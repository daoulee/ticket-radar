import { useEffect, useRef, useState } from 'react'
import './phone3d.css'

// The original model has a separate OLED mesh (Object_23). Its UVs span the display,
// allowing an explicitly synthetic demo to be drawn onto a CanvasTexture.
export function Phone3D() {
  const host = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const element = host.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    let disposed = false
    let cleanup: (() => void) | undefined
    let pendingRenderer: { dispose: () => void; domElement: HTMLCanvasElement } | undefined
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      try {
        const THREE = await import('three')
        const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js')
        if (disposed) return
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
        pendingRenderer = renderer
        // Sharper on high-density displays while bounding GPU work at 2×.
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.setClearColor(0x000000, 0)
        element.appendChild(renderer.domElement)
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(28, 1, 0.001, 10)
        camera.position.set(0, 0, -0.45)
        camera.lookAt(0, 0, 0)
        scene.add(new THREE.HemisphereLight(0xffffff, 0x677991, 2.6))
        const light = new THREE.DirectionalLight(0xffffff, 3)
        light.position.set(-1, 2, -3)
        scene.add(light)

        const canvas = document.createElement('canvas')
        canvas.width = 1024; canvas.height = 2208
        const ctx = canvas.getContext('2d')!
        // Cache each stage; mix only when scroll progress actually changes.
        const stages = Array.from({ length: 3 }, () => { const c = document.createElement('canvas'); c.width = 1024; c.height = 2208; return c })
        let drawContext = ctx
        const texture = new THREE.CanvasTexture(canvas)
        texture.colorSpace = THREE.SRGBColorSpace
        texture.flipY = false
        // Front of this asset faces -Z: its original U axis is reversed from the viewer's horizontal axis.
        texture.repeat.x = -1
        texture.offset.x = 1
        const text = (str: string, x: number, y: number, font: string, color = '#13233A') => {
          drawContext.fillStyle = color; drawContext.font = font; drawContext.fillText(str, x, y)
        }
        function draw(index: number) {
          const ctx = stages[index].getContext('2d')!
          // Keep layout coordinates stable while drawing twice as many pixels.
          ctx.setTransform(2, 0, 0, 2, 0, 0)
          drawContext = ctx
          ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 512, 1104)
          ctx.fillStyle = '#ECECF5'; ctx.roundRect(34, 92, 240, 54, 27); ctx.fill()
          text(['가상 판매글 예시', '가상 공식 안내', '가상 대조 결과'][index], 50, 128, '700 26px sans-serif', '#404890')
          const titles = [['레이더 라이브', 'VIP석 1장'], ['입장 조건', '살펴보기'], ['구매 전', '확인할 점']]
          text(titles[index][0], 34, 240, '800 48px sans-serif'); text(titles[index][1], 34, 305, '800 48px sans-serif')
          if (index !== 1) text(index === 0 ? '230,000원' : '+76,000원', 34, 430, '800 56px sans-serif')
          const lines = [['입금 먼저 해주시면', 'QR 캡처 보내드려요'], ['예매자 본인 앱에서', '모바일 티켓을 표시해요.', '캡처로는 입장할 수 없어요.'], ['공식 가격 대비 차이', '캡처 전달 방식 확인 필요']][index]
          lines.forEach((line, i) => text(line, 34, 530 + i * 54, '500 28px sans-serif', '#526173'))
          ctx.fillStyle = '#404890'; ctx.beginPath(); ctx.roundRect(34, 920, 444, 86, 43); ctx.fill()
          text(['공식 안내와 비교', '판매글과 대조', '근거 살펴보기'][index], 120, 974, '700 29px sans-serif', '#ffffff')
        }
        stages.forEach((_, index) => draw(index))
        let lastBlend = ''
        function mix(progress: number) {
          // Each blend ends before the next stage; no timer or autonomous motion.
          const blendA = Math.max(0, Math.min(1, (progress - 0.65) / 0.04))
          const blendB = Math.max(0, Math.min(1, (progress - 0.82) / 0.04))
          const a = Math.round(blendA * 40) / 40, b = Math.round(blendB * 40) / 40
          const key = `${a}:${b}`
          if (key === lastBlend) return
          lastBlend = key
          // Fade through a blank screen: overlapping two sets of Korean text is unreadable.
          ctx.globalAlpha = 1; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height)
          const stage = b > 0 ? (b < .5 ? 1 : 2) : (a < .5 ? 0 : 1)
          const blend = b > 0 ? b : a
          ctx.globalAlpha = blend === 0 ? 1 : Math.abs(blend * 2 - 1)
          ctx.drawImage(stages[stage], 0, 0)
          ctx.globalAlpha = 1
          texture.needsUpdate = true
        }
        mix(0)
        let last = -1
        const loader = new GLTFLoader()
        const gltf = await loader.loadAsync('/models/iphone_17_pro-1k.glb')
        if (disposed) { renderer.dispose(); return }
        const object = gltf.scene
        const display = object.getObjectByName('Object_23')
        if (!(display instanceof THREE.Mesh)) throw new Error('OLED mesh missing')
        // The model's tinted front glass darkens a UI texture; use the bezel and
        // Dynamic Island meshes while leaving the synthetic screen readable.
        const frontGlass = object.getObjectByName('Object_21')
        if (frontGlass) frontGlass.visible = false
        display.material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
        const box = new THREE.Box3().setFromObject(object)
        const center = box.getCenter(new THREE.Vector3())
        object.position.sub(center)
        scene.add(object)
        const resize = () => {
          const w = element.clientWidth, h = element.clientHeight
          if (!w || !h) return
          renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix()
        }
        const ro = new ResizeObserver(resize); ro.observe(element); resize()
        let frame = 0
        let firstFrameRendered = false
        const render = () => {
          if (disposed) return
          const bounds = element.getBoundingClientRect()
          if (!bounds.width || !bounds.height || bounds.bottom < 0 || bounds.top > window.innerHeight) { frame = requestAnimationFrame(render); return }
          const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          const sceneElement = element.closest<HTMLElement>('.l-phone-scene')
          const index = reduced ? 0 : Math.min(2, Math.max(0, Number(sceneElement?.dataset.phoneStep) || 0))
          if (index !== last) { element.dataset.screenStep = String(index); last = index }
          const progress = reduced ? 0 : Number(getComputedStyle(sceneElement!).getPropertyValue('--p')) || 0
          mix(progress)
          const p = reduced ? 1 : Number(getComputedStyle(element.closest('.l-phone-scene')!).getPropertyValue('--phone-approach')) || 0
          object.rotation.y = (1 - p) * 0.4
          object.rotation.z = (1 - p) * -0.08
          // Fit height dynamically so mobile and desktop retain the full device.
          const maxDistance = Math.max(0.32, 0.32 * (0.50 / Math.max(0.35, camera.aspect)))
          camera.position.z = -(maxDistance + (1 - p) * 0.18)
          renderer.render(scene, camera)
          // Reveal the WebGL canvas only after it contains the first real model frame.
          // The same React class update hides the illustration in that paint.
          if (!firstFrameRendered) { firstFrameRendered = true; setReady(true) }
          frame = requestAnimationFrame(render)
        }
        render()
        pendingRenderer = undefined
        cleanup = () => { cancelAnimationFrame(frame); ro.disconnect(); texture.dispose(); object.traverse(o => { if (o instanceof THREE.Mesh) { o.geometry.dispose(); const mats = Array.isArray(o.material) ? o.material : [o.material]; mats.forEach(m => { for (const value of Object.values(m)) if (value instanceof THREE.Texture) value.dispose(); m.dispose() }) } }); renderer.dispose(); renderer.domElement.remove() }
      } catch (error) {
        console.error('Phone 3D unavailable; using illustration', error)
        pendingRenderer?.dispose(); pendingRenderer?.domElement.remove()
      }
    }, { rootMargin: '500px' })
    observer.observe(element)
    return () => { disposed = true; observer.disconnect(); cleanup?.(); pendingRenderer?.dispose(); pendingRenderer?.domElement.remove() }
  }, [])

  return <div className={`phone-three${ready ? ' is-ready' : ''}`} ref={host} aria-hidden="true" />
}
