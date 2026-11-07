import { useEffect, useState } from 'react'
import './TicketIntro.css'

export function TicketIntro() {
  const [visible, setVisible] = useState(() => {
    try { return !matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
  })
  const finish = () => setVisible(false)
  useEffect(() => {
    if (!visible) return
    let stopped = false, frame = 0, progress = 0, touchY = 0, interacted = false
    let cleanup = () => {}
    const advance = (distance: number) => {
      interacted = true
      progress = Math.max(0, Math.min(1, progress + distance / 850))
      if (progress >= 1) finish()
    }
    const wheel = (e: WheelEvent) => { e.preventDefault(); advance(e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1)) }
    const touchStart = (e: TouchEvent) => { touchY = e.touches[0]?.clientY ?? 0 }
    const touchMove = (e: TouchEvent) => { e.preventDefault(); const y = e.touches[0]?.clientY ?? touchY; advance(touchY - y); touchY = y }
    const keydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
      else if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); advance(e.key === 'ArrowDown' ? 100 : 350) }
      else if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); advance(e.key === 'ArrowUp' ? -100 : -350) }
    }
    addEventListener('keydown', keydown)
    addEventListener('wheel', wheel, { passive: false })
    addEventListener('touchstart', touchStart, { passive: true })
    addEventListener('touchmove', touchMove, { passive: false })
    const deadline = setTimeout(finish, 9000)
    const start = async () => {
      try {
        const [THREE, { GLTFLoader }, { TrackballControls }] = await Promise.all([import('three'), import('three/examples/jsm/loaders/GLTFLoader.js'), import('three/examples/jsm/controls/TrackballControls.js')])
        if (stopped) return
        const canvas = document.querySelector<HTMLCanvasElement>('#ticket-intro-canvas')!
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.localClippingEnabled = true
        const scene = new THREE.Scene()
        scene.add(new THREE.HemisphereLight(0xffffff, 0x6e7797, 2.2))
        scene.add(new THREE.AmbientLight(0xffffff, 0.9))
        const light = new THREE.DirectionalLight(0xffffff, 2)
        scene.add(light)
        const ticket = new THREE.Group(); ticket.rotation.set(0.15, 0, -0.12); scene.add(ticket)
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 20)
        camera.position.set(0, 3, 0); camera.up.set(0, 0, -1); camera.lookAt(0, 0, 0)
        // Touch gestures remain reserved for opening the ticket; mouse dragging rotates it.
        const blockTouchPointer = (e: PointerEvent) => { if (e.pointerType !== 'mouse') e.stopImmediatePropagation() }
        canvas.addEventListener('pointerdown', blockTouchPointer, true)
        const controls = new TrackballControls(camera, canvas)
        controls.noZoom = true; controls.noPan = true; controls.staticMoving = true; controls.rotateSpeed = 2.2
        const dragStart = () => { interacted = true; canvas.parentElement?.classList.add('is-interacted'); canvas.classList.add('is-dragging') }
        const dragEnd = () => canvas.classList.remove('is-dragging')
        controls.addEventListener('start', dragStart); controls.addEventListener('end', dragEnd)
        const resize = () => {
          const width = canvas.clientWidth, height = canvas.clientHeight, aspect = width / Math.max(height, 1)
          renderer.setSize(width, height, false)
          const halfWidth = Math.max(0.32, 0.4 * aspect)
          camera.left = -halfWidth; camera.right = halfWidth; camera.top = halfWidth / aspect; camera.bottom = -halfWidth / aspect; camera.updateProjectionMatrix()
          controls.handleResize()
        }
        resize(); addEventListener('resize', resize)
        const cleanupRenderer = () => { removeEventListener('resize', resize); canvas.removeEventListener('pointerdown', blockTouchPointer, true); controls.removeEventListener('start', dragStart); controls.removeEventListener('end', dragEnd); controls.dispose(); renderer.dispose() }
        cleanup = cleanupRenderer
        const gltf = await new GLTFLoader().loadAsync('/models/ticket-intro.glb')
        if (stopped) { renderer.dispose(); return }
        gltf.scene.updateMatrixWorld(true)
        let source: InstanceType<typeof THREE.Mesh> | undefined
        gltf.scene.traverse((object) => { if (!source && object instanceof THREE.Mesh) source = object })
        if (!source) throw Error('Ticket mesh missing')
        const mesh = source as InstanceType<typeof THREE.Mesh>, geometry = mesh.geometry.clone()
        geometry.applyMatrix4(mesh.matrixWorld); geometry.computeBoundingBox()
        const box = geometry.boundingBox!
        geometry.translate(-(box.min.x + box.max.x) / 2, -(box.min.y + box.max.y) / 2, -(box.min.z + box.max.z) / 2)
        geometry.computeBoundingBox()
        const originalMaterial = mesh.material as InstanceType<typeof THREE.MeshStandardMaterial>
        if (!originalMaterial.map?.image) throw Error('Ticket texture missing')
        const logo = new Image(); logo.src = '/models/ticket-logo.png'; await logo.decode()
        if (stopped) return
        const art = document.createElement('canvas'); art.width = 1024; art.height = 1024
        const ctx = art.getContext('2d')!
        ctx.drawImage(originalMaterial.map.image as CanvasImageSource, 0, 0, 1024, 1024)
        // The two atlas regions are upside down; retain the paper texture and serial numbers.
        for (const y of [0, 530]) {
          // Repeat a clean patch of paper and feather all four edges into the source.
          const patch = document.createElement('canvas'); patch.width = 530; patch.height = 190
          const pctx = patch.getContext('2d')!
          for (let row = 0; row < 4; row++) {
            pctx.save(); pctx.translate(0, row * 60 + (row % 2 ? 60 : 0)); pctx.scale(1, row % 2 ? -1 : 1)
            pctx.drawImage(art, 260, 105 + y, 530, 60, 0, 0, 530, 60); pctx.restore()
          }
          pctx.globalCompositeOperation = 'destination-in'
          const horizontal = pctx.createLinearGradient(0, 0, 530, 0)
          horizontal.addColorStop(0, 'transparent'); horizontal.addColorStop(.025, 'black'); horizontal.addColorStop(.975, 'black'); horizontal.addColorStop(1, 'transparent')
          pctx.fillStyle = horizontal; pctx.fillRect(0, 0, 530, 190)
          const vertical = pctx.createLinearGradient(0, 0, 0, 190)
          vertical.addColorStop(0, 'transparent'); vertical.addColorStop(.14, 'black'); vertical.addColorStop(.86, 'black'); vertical.addColorStop(1, 'transparent')
          pctx.fillStyle = vertical; pctx.fillRect(0, 0, 530, 190)
          ctx.drawImage(patch, 250, 160 + y)
          ctx.save(); ctx.translate(515, 255 + y); if (y !== 0) ctx.rotate(Math.PI); ctx.scale(-1, 1)
          if (y === 0) {
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#13233a'
            ctx.font = '600 30px sans-serif'; ctx.fillText('Copyright © 2026', 0, -42)
            ctx.font = '600 25px sans-serif'; ctx.fillText('Daelim.Univ CS Engineering · 월32', 0, 0)
            ctx.font = '24px sans-serif'; ctx.fillText('All rights reserved.', 0, 42)
          } else ctx.drawImage(logo, -255, -120, 510, 240)
          ctx.restore()
        }
        const texture = new THREE.CanvasTexture(art); texture.colorSpace = THREE.SRGBColorSpace; texture.flipY = false
        const halves = [-1, 1].map((side) => {
          const material = originalMaterial.clone(); material.map = texture; material.side = THREE.DoubleSide
          material.onBeforeCompile = (shader) => {
            shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vTicketPosition;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvTicketPosition = position;')
            shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vTicketPosition;`).replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\nfloat tear = 0.007 * sin(vTicketPosition.z * 95.0) + 0.004 * sin(vTicketPosition.z * 211.0);\nif (${side.toFixed(1)} * (vTicketPosition.x - tear) < 0.0) discard;`)
          }
          material.customProgramCacheKey = () => `ticket-tear-${side}`
          const part = new THREE.Mesh(geometry, material); ticket.add(part)
          return { part, material, side }
        })
        cleanup = () => { halves.forEach(({ material }) => material.dispose()); geometry.dispose(); texture.dispose(); cleanupRenderer() }
        clearTimeout(deadline)
        const fallback = document.querySelector<HTMLElement>('.ticket-intro-fallback')
        const entryStart = performance.now()
        const animate = (now: number) => {
          if (stopped) return
          if (interacted) canvas.parentElement?.classList.add('is-interacted')
          const elapsed = (now - entryStart) / 1000
          const entry = interacted ? 1 : Math.min(1, Math.max(0, elapsed / 1.2))
          const arrival = 1 - Math.pow(1 - entry, 3)
          ticket.scale.setScalar(1)
          ticket.position.z = -0.35 * (1 - arrival)
          ticket.rotation.set(0.15 + 0.10 * (1 - arrival), 0, -0.12 - 0.08 * (1 - arrival))
          const ease = progress * progress * (3 - 2 * progress)
          const overlay = canvas.parentElement
          if (overlay) overlay.style.backgroundColor = `rgba(218, 224, 239, ${1 - ease})`
          ticket.updateMatrixWorld(true)
          halves.forEach(({ part, side }) => {
            part.position.x = side * ease * 1.05; part.rotation.y = side * ease * 0.4; part.updateMatrixWorld()
          })
          controls.update()
          // Keep the key light on the viewer's side as the camera orbits the ticket.
          light.position.copy(camera.position).multiplyScalar(2)
          renderer.render(scene, camera)
          if (fallback && !fallback.hidden) { fallback.hidden = true; canvas.classList.add('is-ready'); canvas.parentElement?.classList.add('is-ready') }
          frame = requestAnimationFrame(animate)
        }
        frame = requestAnimationFrame(animate)
      } catch { finish() }
    }
    void start()
    return () => { stopped = true; clearTimeout(deadline); removeEventListener('keydown', keydown); removeEventListener('wheel', wheel); removeEventListener('touchstart', touchStart); removeEventListener('touchmove', touchMove); cancelAnimationFrame(frame); cleanup() }
  }, [visible])
  if (!visible) return null
  return <div className="ticket-intro" aria-label="티켓레이더 소개 애니메이션">
    <div className="ticket-intro-fallback" role="status">티켓을 준비하고 있어요</div>
    <canvas id="ticket-intro-canvas" aria-hidden="true" />
    <p className="ticket-intro-hint">드래그해서 살펴보고 · 스크롤해서 열어보세요 ↓</p>
    <button className="ticket-intro-skip" onClick={finish}>건너뛰기 <span aria-hidden="true">↗</span></button>
  </div>
}
