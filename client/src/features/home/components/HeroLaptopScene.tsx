'use client'

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useEffect, useLayoutEffect, useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import type { Group, Object3D } from 'three'

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

  useEffect(() => {
    return () => {
      texture.dispose()
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

    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return
      const mat = obj.material
      if (!isMeshMaterial(mat)) return
      if (mat.name !== 'ScreenDisplay') return
      mat.map = texture
      mat.emissiveMap = texture
      mat.emissive = new THREE.Color(0xffffff)
      mat.emissiveIntensity = 0
      mat.needsUpdate = true
      screenMatRef.current = mat
    })
  }, [scene, texture])

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

    // Reveal emissive (white only; emissiveMap stays the headshot)
    if (t < REVEAL_START_T) {
      mat.emissive.copy(emissiveWhite)
      mat.emissiveIntensity = 0
    } else {
      const rU = (t - REVEAL_START_T) / (1 - REVEAL_START_T)
      const rClamped = Math.min(1, rU)
      mat.emissive.copy(emissiveWhite)
      mat.emissiveIntensity = THREE.MathUtils.lerp(0, REVEAL_END_INTENSITY, rClamped)
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
