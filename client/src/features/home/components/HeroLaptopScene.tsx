'use client'

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useEffect, useLayoutEffect, useMemo, useRef, useCallback, type MutableRefObject } from 'react'
import * as THREE from 'three'
import type { Group, Object3D } from 'three'

import { pixelifySans } from '@/lib/fonts'

const MODEL_URL = '/models/portfolio-laptop.glb'
/** Replace with a larger export (e.g. 1600–2400px wide) for sharper detail on the 3D screen. */
const HEADSHOT_URL = '/images/don-headshot.jpg'

/** Closed lid: positive X folds the lid down onto the keyboard for this GLB hinge. */
const CLOSED_LID_X = 1.58
/** Rest / open pose from Blender (screen up). */
const OPEN_LID_X = 0

const ANIM_DURATION_MS = 3200
const SPIN_END_T = 0.7
const LID_START_T = 0.2
const LID_END_T = 0.95
const REVEAL_START_T = 0.85
const REVEAL_END_INTENSITY = 0.9

/** Boot screen: pink loading bar fills 0 → 1 well before the boot fade-out. */
const LOADING_BAR_FILL_START_T = 0.22
const LOADING_BAR_FILL_END_T = 0.74

/**
 * Boot screen emissive curve:
 * - `BOOT_GLOW_FADE_IN_T` → `BOOT_GLOW_FULL_T`: ramp on as lid opens
 * - hold until `BOOT_GLOW_HOLD_END_T`
 * - `BOOT_GLOW_HOLD_END_T` → `REVEAL_START_T`: fade boot out to black
 * - `REVEAL_START_T` → `HEADSHOT_FADE_IN_END_T`: headshot fades in (original look)
 */
const BOOT_GLOW_INTENSITY = 0.85
const BOOT_GLOW_FADE_IN_T = LID_START_T
const BOOT_GLOW_FULL_T = 0.45
const BOOT_GLOW_HOLD_END_T = 0.78
const HEADSHOT_FADE_IN_END_T = 1.0

/** Boot “LOADING” label: dot typing cadence (ms per extra dot) and blink rate (Hz). */
const BOOT_LABEL_TIME_MS_PER_DOT = 420
const BOOT_LABEL_BLINK_HZ = 1.1
const BOOT_LABEL_FONT_SCALE = 0.2

const BOOT_CANVAS_W = 512
const BOOT_CANVAS_H = 256

/** Canvas 2D `font` stack from `next/font` (matches root layout display font). */
const BOOT_LABEL_FONT_STACK = pixelifySans.style.fontFamily

/** Post-open idle motion (after normalized timeline t ≥ 1). */
const IDLE_YAW_DRIFT = 0.092
const IDLE_PITCH_AMP = 0.055
const IDLE_PITCH_FREQ = 1.08
const IDLE_ROLL_AMP = 0.028
const IDLE_ROLL_FREQ = 0.72

/** Camera fit margin (lower = closer camera = laptop fills more of the canvas). */
const CAMERA_FIT_MARGIN = 1.06

/** Lens height above bbox center (× maxDim) — higher sees more of the laptop top. */
const CAMERA_HEIGHT_FRAC = 0.6

/** Look slightly below bbox center (× size.y) — shifts framing so the lid isn’t clipped. */
const CAMERA_LOOK_DOWN_FRAC = -2.5

/**
 * During spin, camera sits further out on the same view ray; eases to the final
 * framing by t → 1 so corners don’t clip, then matches your tuned end pose.
 */
const CAMERA_SPIN_ZOOM_MULT = 1.44

/** Camera zoom blend: smoothstep starts at this t (stay wide longer during spin). */
const CAMERA_ZOOM_BLEND_START = 0.4
/** Raise smoothstep output to this power for a snappier settle into final framing. */
const CAMERA_ZOOM_CURVE_POWER = 1.35

/** Lid micro-settle: duration (ms) and peak additive rotation (rad) on local X. */
const SETTLE_DURATION_MS = 130
const SETTLE_PEAK_RAD = 0.038

/** Idle pointer tilt: max radians pitch/yaw from cursor at canvas edge. */
const POINTER_TILT_MAX_RAD = 0.06
const POINTER_TILT_SMOOTH = 8

/** Latch SFX (litupsubway-ui-open-sfx). */
const LATCH_SOUND_URL = '/sounds/hero-laptop-latch.mp3'
/** Startup / menu layer (dragon-studio), when screen emissive reveal begins (see REVEAL_START_T). */
const STARTUP_SOUND_URL = '/sounds/hero-laptop-startup.mp3'

useGLTF.preload(MODEL_URL)

function cubicOut(u: number) {
  return 1 - (1 - u) ** 3
}

function easeOutBack(u: number) {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * (u - 1) ** 3 + c1 * (u - 1) ** 2
}

/** Camera stays wider longer, then eases into end pose. */
function cameraZoomBlend(t: number) {
  const edge = THREE.MathUtils.smoothstep(t, CAMERA_ZOOM_BLEND_START, 1)
  return edge ** CAMERA_ZOOM_CURVE_POWER
}

function isMeshMaterial(
  m: THREE.Material | THREE.Material[],
): m is THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial {
  return !Array.isArray(m) && 'map' in m && 'emissiveIntensity' in m
}

const emissiveWhite = new THREE.Color(0xffffff)

type BootScreenResources = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  texture: THREE.CanvasTexture
}

function createBootScreenTexture(): BootScreenResources {
  const canvas = document.createElement('canvas')
  canvas.width = BOOT_CANVAS_W
  canvas.height = BOOT_CANVAS_H
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) {
    throw new Error('2d context required for laptop boot screen')
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.flipY = false
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return { canvas, ctx, texture: tex }
}

/** Pink “OS boot” frame: dark magenta field + rounded track + fill by `progress` (0–1). */
function drawBootLoadingFrame(ctx: CanvasRenderingContext2D, progress: number, timeMs: number) {
  const w = BOOT_CANVAS_W
  const h = BOOT_CANVAS_H
  ctx.fillStyle = '#1a0d16'
  ctx.fillRect(0, 0, w, h)

  const marginX = w * 0.14
  const trackW = w - marginX * 2
  const barH = h * 0.072
  const barY = h * 0.5 - barH * 0.5
  const r = barH * 0.5
  const p = THREE.MathUtils.clamp(progress, 0, 1)

  ctx.fillStyle = '#3d1530'
  ctx.beginPath()
  ctx.roundRect(marginX, barY, trackW, barH, r)
  ctx.fill()

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(marginX, barY, trackW, barH, r)
  ctx.clip()
  ctx.fillStyle = '#ff6eb3'
  const fillW = Math.max(barH * 0.35, trackW * p)
  ctx.fillRect(marginX, barY, fillW, barH)
  ctx.restore()

  const dotCount = Math.floor(timeMs / BOOT_LABEL_TIME_MS_PER_DOT) % 4
  const label = `LOADING${'.'.repeat(dotCount)}`
  const blink =
    0.38 + 0.62 * (0.5 + 0.5 * Math.sin((timeMs / 1000) * Math.PI * 2 * BOOT_LABEL_BLINK_HZ))
  const alpha = THREE.MathUtils.clamp(0.28 + 0.72 * blink, 0.12, 1)

  ctx.fillStyle = `rgba(255, 140, 200, ${alpha})`
  ctx.font = `600 ${Math.round(h * BOOT_LABEL_FONT_SCALE)}px ${BOOT_LABEL_FONT_STACK}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, w * 0.5, h * 0.28)
}

function playCachedAudio(ref: MutableRefObject<HTMLAudioElement | null>, url: string) {
  if (typeof window === 'undefined') return
  if (!ref.current) {
    ref.current = new Audio(url)
    ref.current.preload = 'auto'
  }
  const a = ref.current
  try {
    a.currentTime = 0
    void a.play().catch(() => {
      /* autoplay / decode */
    })
  } catch {
    /* ignore */
  }
}

type LaptopModelProps = {
  replayKey: number
  reducedMotion: boolean
  soundEnabled: boolean
}

function LaptopModel({ replayKey, reducedMotion, soundEnabled }: LaptopModelProps) {
  const { scene } = useGLTF(MODEL_URL) as { scene: Group }
  const loadedTexture = useLoader(THREE.TextureLoader, HEADSHOT_URL)
  const { camera, gl, invalidate } = useThree()

  const texture = useMemo(() => {
    const t = loadedTexture.clone()
    t.colorSpace = THREE.SRGBColorSpace
    t.flipY = false
    t.anisotropy = 16
    t.generateMipmaps = true
    t.minFilter = THREE.LinearMipmapLinearFilter
    t.magFilter = THREE.LinearFilter
    t.wrapS = THREE.ClampToEdgeWrapping
    t.wrapT = THREE.ClampToEdgeWrapping
    t.needsUpdate = true
    return t
  }, [loadedTexture])

  const bootScreenRef = useRef<BootScreenResources | null>(null)
  const getBootScreen = useCallback(() => {
    if (!bootScreenRef.current) {
      const b = createBootScreenTexture()
      drawBootLoadingFrame(b.ctx, 0, 0)
      b.texture.needsUpdate = true
      bootScreenRef.current = b
    }
    return bootScreenRef.current
  }, [])

  useEffect(() => {
    return () => {
      texture.dispose()
      bootScreenRef.current?.texture.dispose()
      bootScreenRef.current = null
      latchAudioRef.current?.pause()
      latchAudioRef.current = null
      startupAudioRef.current?.pause()
      startupAudioRef.current = null
    }
  }, [texture])

  const rigRef = useRef<Group>(null)
  const spinRef = useRef<Group>(null)
  const tiltRef = useRef<Group>(null)
  const screenRef = useRef<Object3D | null>(null)
  const screenMatRef = useRef<THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial | null>(
    null,
  )

  const elapsedMs = useRef(0)
  const replayKeyRef = useRef(replayKey)
  const idleTime = useRef(0)
  const tiltTargetRef = useRef(new THREE.Vector2(0, 0))
  const settleStartedRef = useRef(false)
  const settleElapsedMsRef = useRef(0)
  const prevLidURef = useRef(-1)
  const latchPlayedRef = useRef(false)
  const startupPlayedRef = useRef(false)
  const headshotRevealedRef = useRef(false)
  const latchAudioRef = useRef<HTMLAudioElement | null>(null)
  const startupAudioRef = useRef<HTMLAudioElement | null>(null)

  const camFraming = useRef({
    ready: false,
    start: new THREE.Vector3(),
    end: new THREE.Vector3(),
    look: new THREE.Vector3(),
  })
  const scratchCamPos = useRef(new THREE.Vector3())

  useEffect(() => {
    const canvas = gl.domElement
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      if (r.width < 1 || r.height < 1) return
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1
      const ny = -(((e.clientY - r.top) / r.height) * 2 - 1)
      tiltTargetRef.current.set(nx * POINTER_TILT_MAX_RAD, ny * POINTER_TILT_MAX_RAD)
    }
    const onLeave = () => {
      tiltTargetRef.current.set(0, 0)
    }
    canvas.addEventListener('pointermove', onMove, { passive: true })
    canvas.addEventListener('pointerleave', onLeave)
    return () => {
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [gl])

  useLayoutEffect(() => {
    const screen = scene.getObjectByName('Screen')
    screenRef.current = screen ?? null

    const boot = reducedMotion ? null : getBootScreen()

    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return
      const mat = obj.material
      if (!isMeshMaterial(mat)) return
      if (mat.name !== 'ScreenDisplay') return
      if (reducedMotion) {
        mat.map = texture
        mat.emissiveMap = texture
      } else if (boot) {
        mat.map = boot.texture
        mat.emissiveMap = boot.texture
      }
      mat.emissive = new THREE.Color(0xffffff)
      mat.emissiveIntensity = 0
      mat.needsUpdate = true
      screenMatRef.current = mat
    })
  }, [scene, texture, reducedMotion, getBootScreen])

  // GLB root = Blender spin origin (do not offset rig/spin). Aim camera at mesh bounds.
  useLayoutEffect(() => {
    const rig = rigRef.current
    const spin = spinRef.current
    if (!rig || !spin || !(camera instanceof THREE.PerspectiveCamera)) return

    rig.position.set(0, 0, 0)
    spin.position.set(0, 0, 0)

    const box = new THREE.Box3().setFromObject(scene)
    if (box.isEmpty()) return

    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)

    const maxDim = Math.max(size.x, size.y, size.z)
    const margin = CAMERA_FIT_MARGIN
    const fovRad = THREE.MathUtils.degToRad(camera.fov)
    const dist = (maxDim / 2 / Math.tan(fovRad / 2)) * margin

    const lookTarget = center.clone()
    lookTarget.y -= size.y * CAMERA_LOOK_DOWN_FRAC

    const endPos = new THREE.Vector3(
      center.x,
      center.y + maxDim * CAMERA_HEIGHT_FRAC,
      center.z + dist,
    )
    const viewRay = new THREE.Vector3().subVectors(endPos, lookTarget)
    const span = viewRay.length()
    viewRay.normalize()
    const startPos = lookTarget.clone().addScaledVector(viewRay, span * CAMERA_SPIN_ZOOM_MULT)

    const fm = camFraming.current
    fm.end.copy(endPos)
    fm.start.copy(startPos)
    fm.look.copy(lookTarget)
    fm.ready = true

    if (reducedMotion) {
      camera.position.copy(fm.end)
    } else {
      camera.position.copy(fm.start)
    }
    camera.lookAt(fm.look)
    camera.updateProjectionMatrix()
    invalidate()
  }, [scene, camera, invalidate, reducedMotion])

  useFrame((_, delta) => {
    const spin = spinRef.current
    const tilt = tiltRef.current
    const screen = screenRef.current
    const mat = screenMatRef.current
    if (!spin || !tilt || !screen || !mat) return

    if (reducedMotion) {
      screen.rotation.x = OPEN_LID_X
      spin.rotation.y = 0
      spin.rotation.x = 0
      spin.rotation.z = 0
      tilt.rotation.x = 0
      tilt.rotation.y = 0
      mat.emissive.copy(emissiveWhite)
      mat.emissiveIntensity = REVEAL_END_INTENSITY
      const fmRm = camFraming.current
      if (fmRm.ready && camera instanceof THREE.PerspectiveCamera) {
        camera.position.copy(fmRm.end)
        camera.lookAt(fmRm.look)
        camera.updateProjectionMatrix()
      }
      return
    }

    if (replayKeyRef.current !== replayKey) {
      replayKeyRef.current = replayKey
      elapsedMs.current = 0
      idleTime.current = 0
      spin.rotation.y = 0
      spin.rotation.x = 0
      spin.rotation.z = 0
      tilt.rotation.x = 0
      tilt.rotation.y = 0
      screen.rotation.x = CLOSED_LID_X
      mat.emissive.copy(emissiveWhite)
      mat.emissiveIntensity = 0
      settleStartedRef.current = false
      settleElapsedMsRef.current = 0
      prevLidURef.current = -1
      latchPlayedRef.current = false
      startupPlayedRef.current = false
      headshotRevealedRef.current = false
      const boot = getBootScreen()
      mat.map = boot.texture
      mat.emissiveMap = boot.texture
      mat.needsUpdate = true
      drawBootLoadingFrame(boot.ctx, 0, 0)
      boot.texture.needsUpdate = true
      const fmReplay = camFraming.current
      if (fmReplay.ready && camera instanceof THREE.PerspectiveCamera) {
        camera.position.copy(fmReplay.start)
        camera.lookAt(fmReplay.look)
        camera.updateProjectionMatrix()
      }
    }

    elapsedMs.current += delta * 1000
    const t = Math.min(1, elapsedMs.current / ANIM_DURATION_MS)

    const fm = camFraming.current
    if (fm.ready && camera instanceof THREE.PerspectiveCamera) {
      if (t >= 1) {
        camera.position.copy(fm.end)
      } else {
        const camBlend = cameraZoomBlend(t)
        scratchCamPos.current.lerpVectors(fm.start, fm.end, camBlend)
        camera.position.copy(scratchCamPos.current)
      }
      camera.lookAt(fm.look)
      camera.updateProjectionMatrix()
    }

    // Spin: 0 → 4π over first SPIN_END_T of timeline
    const spinU = Math.min(1, t / SPIN_END_T)
    spin.rotation.y = cubicOut(spinU) * Math.PI * 4

    // Lid: CLOSED_LID_X → 0 from LID_START_T to LID_END_T + micro-settle after fully open
    let lidU = 0
    if (t <= LID_START_T) lidU = 0
    else if (t >= LID_END_T) lidU = 1
    else lidU = (t - LID_START_T) / (LID_END_T - LID_START_T)

    const baseLidX = THREE.MathUtils.lerp(CLOSED_LID_X, OPEN_LID_X, easeOutBack(lidU))
    let settleOffset = 0
    if (lidU >= 1) {
      if (!settleStartedRef.current) {
        settleStartedRef.current = true
        settleElapsedMsRef.current = 0
      }
      settleElapsedMsRef.current += delta * 1000
      if (settleElapsedMsRef.current <= SETTLE_DURATION_MS) {
        settleOffset =
          SETTLE_PEAK_RAD *
          Math.sin(Math.PI * Math.min(1, settleElapsedMsRef.current / SETTLE_DURATION_MS))
      }
    } else {
      settleStartedRef.current = false
    }
    screen.rotation.x = baseLidX + settleOffset

    // Latch once when lid first leaves closed (lidU: 0 → >0)
    if (soundEnabled && prevLidURef.current <= 0 && lidU > 0 && !latchPlayedRef.current) {
      latchPlayedRef.current = true
      playCachedAudio(latchAudioRef, LATCH_SOUND_URL)
    }
    prevLidURef.current = lidU

    // Startup when emissive / screen “lights up” (same timeline as texture feeling active)
    if (soundEnabled && t >= REVEAL_START_T && !startupPlayedRef.current) {
      startupPlayedRef.current = true
      playCachedAudio(startupAudioRef, STARTUP_SOUND_URL)
    }

    // Pink boot loading bar on canvas texture; swap to headshot at reveal
    if (t < REVEAL_START_T) {
      const boot = getBootScreen()
      const barU = THREE.MathUtils.clamp(
        THREE.MathUtils.smoothstep(t, LOADING_BAR_FILL_START_T, LOADING_BAR_FILL_END_T),
        0,
        1,
      )
      drawBootLoadingFrame(boot.ctx, barU, elapsedMs.current)
      boot.texture.needsUpdate = true
    } else if (!headshotRevealedRef.current) {
      headshotRevealedRef.current = true
      mat.map = texture
      mat.emissiveMap = texture
      mat.needsUpdate = true
    }

    // Emissive: boot fades in, holds, fades out → headshot fades in from black.
    mat.emissive.copy(emissiveWhite)
    if (t < BOOT_GLOW_FADE_IN_T) {
      mat.emissiveIntensity = 0
    } else if (t < BOOT_GLOW_FULL_T) {
      const u = THREE.MathUtils.smoothstep(t, BOOT_GLOW_FADE_IN_T, BOOT_GLOW_FULL_T)
      mat.emissiveIntensity = u * BOOT_GLOW_INTENSITY
    } else if (t < BOOT_GLOW_HOLD_END_T) {
      mat.emissiveIntensity = BOOT_GLOW_INTENSITY
    } else if (t < REVEAL_START_T) {
      const u = THREE.MathUtils.smoothstep(t, BOOT_GLOW_HOLD_END_T, REVEAL_START_T)
      mat.emissiveIntensity = BOOT_GLOW_INTENSITY * (1 - u)
    } else {
      const u = THREE.MathUtils.smoothstep(t, REVEAL_START_T, HEADSHOT_FADE_IN_END_T)
      mat.emissiveIntensity = u * REVEAL_END_INTENSITY
    }

    if (t >= 1) {
      mat.emissive.copy(emissiveWhite)
      mat.emissiveIntensity = REVEAL_END_INTENSITY
      idleTime.current += delta
      spin.rotation.y += delta * IDLE_YAW_DRIFT
      spin.rotation.x = Math.sin(idleTime.current * IDLE_PITCH_FREQ) * IDLE_PITCH_AMP
      spin.rotation.z = Math.sin(idleTime.current * IDLE_ROLL_FREQ + 1.2) * IDLE_ROLL_AMP

      const k = 1 - Math.exp(-POINTER_TILT_SMOOTH * delta)
      tilt.rotation.x += (tiltTargetRef.current.y - tilt.rotation.x) * k
      tilt.rotation.y += (tiltTargetRef.current.x - tilt.rotation.y) * k
      invalidate()
    } else {
      const k = 1 - Math.exp(-POINTER_TILT_SMOOTH * delta)
      tilt.rotation.x += (0 - tilt.rotation.x) * k
      tilt.rotation.y += (0 - tilt.rotation.y) * k
    }
  })

  // First mount + reduced-motion toggle: lid / emissive before first useFrame.
  useLayoutEffect(() => {
    const screen = screenRef.current
    const mat = screenMatRef.current
    const spin = spinRef.current
    const tilt = tiltRef.current
    if (!screen || !mat) return
    if (reducedMotion) {
      screen.rotation.x = OPEN_LID_X
      mat.emissive.copy(emissiveWhite)
      mat.emissiveIntensity = REVEAL_END_INTENSITY
      if (spin) {
        spin.rotation.y = 0
        spin.rotation.x = 0
        spin.rotation.z = 0
      }
      if (tilt) {
        tilt.rotation.x = 0
        tilt.rotation.y = 0
      }
      return
    }
    screen.rotation.x = CLOSED_LID_X
    mat.emissive.copy(emissiveWhite)
    mat.emissiveIntensity = 0
  }, [scene, texture, reducedMotion])

  return (
    <group ref={rigRef}>
      <group ref={spinRef}>
        <group ref={tiltRef}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  )
}

export type HeroLaptopSceneProps = {
  replayKey: number
  reducedMotion: boolean
  soundEnabled: boolean
}

export default function HeroLaptopScene({
  replayKey,
  reducedMotion,
  soundEnabled,
}: HeroLaptopSceneProps) {
  return (
    <Canvas
      className="h-full w-full touch-none"
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0.25, 6], fov: 38, near: 0.01, far: 200 }}
      frameloop="always"
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} />
      <directionalLight position={[-3, 2, -2]} intensity={0.25} />
      <LaptopModel replayKey={replayKey} reducedMotion={reducedMotion} soundEnabled={soundEnabled} />
    </Canvas>
  )
}
