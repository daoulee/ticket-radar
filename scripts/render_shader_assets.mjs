import { chromium } from '../web/node_modules/@playwright/test/index.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const out=path.join(root,'mobile/assets/shaders');
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();
const tasks=[
 {name:'cta-light',file:'suno-cta.glsl',width:358,height:54,uniforms:{u_seed:2.1,u_pink:'#2563EB',u_red:'#3B82F6',u_orange:'#38BDF8',u_yellow:'#7DD3FC',u_grain:0.045}},
 {name:'screen-glow-light',file:'screen-glow.glsl',width:390,height:844,uniforms:{u_seed:2.1,u_warm:'#3B82F6',u_plum:'#93C5FD',u_strength:0.26}},
];
const evidence=[];
try{
 for(const task of tasks){
  const fragment=await fs.readFile(path.join(root,'docs/design/shaders',task.file),'utf8');
  const result=await page.evaluate(({task,fragment})=>{
   const canvas=document.createElement('canvas');canvas.width=task.width*3;canvas.height=task.height*3;
   const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true,antialias:false});
   if(!gl)throw new Error('WebGL unavailable');
   const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s};
   const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,'attribute vec2 position;void main(){gl_Position=vec4(position,0.0,1.0);}'));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program);
   const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);gl.uniform2f(gl.getUniformLocation(program,'u_resolution'),canvas.width,canvas.height);
   for(const [key,value]of Object.entries(task.uniforms)){const loc=gl.getUniformLocation(program,key);if(typeof value==='string'){const v=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)/255);gl.uniform3f(loc,...v)}else gl.uniform1f(loc,value)}
   gl.viewport(0,0,canvas.width,canvas.height);gl.drawArrays(gl.TRIANGLES,0,6);gl.finish();if(gl.getError()!==gl.NO_ERROR)throw new Error('WebGL render error');
   const pixels=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
   const linear=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
   const minContrast=alpha=>{let max=0;for(let i=0;i<pixels.length;i+=4){const rgb=[0,1,2].map((j)=>(pixels[i+j]/255)*(1-alpha)+[11,18,32][j]/255*alpha);max=Math.max(max,linear(rgb[0])*.2126+linear(rgb[1])*.7152+linear(rgb[2])*.0722)}return 1.05/(max+.05)};
   let overlay=0,before=null,after=null;if(task.name==='cta-light'){before=minContrast(0);while(overlay<.8 && minContrast(overlay)<4.5)overlay=Math.round((overlay+.01)*100)/100;after=minContrast(overlay)}
   return{png:canvas.toDataURL('image/png').split(',')[1],overlay,contrastBefore:before,contrastAfter:after,width:canvas.width,height:canvas.height};
  },{task,fragment});
  await fs.writeFile(path.join(out,`${task.name}.png`),Buffer.from(result.png,'base64'));
  const {png,...metrics}=result;evidence.push({...task,sourceSha256:crypto.createHash('sha256').update(fragment).digest('hex'),...metrics});
 }
 await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify({method:'Supplied static GLSL rendered with browser WebGL at 3x; no runtime GPU dependency',assets:evidence},null,2)+'\n');
 console.log(JSON.stringify(evidence.map(({name,overlay,contrastBefore,contrastAfter,width,height})=>({name,overlay,contrastBefore,contrastAfter,width,height})),null,2));
}finally{await browser.close()}
