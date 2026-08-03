'use client'

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import {
  Component,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import * as THREE from 'three'
import type { Group, Object3D } from 'three'

import {
  ANIM_DURATION_MS,
  applyCameraForTimeline,
  applyIdleMotion,
  applyIntroTiltReset,
  CLOSED_LID_X,
  cloneModelWithUniqueResources,
  computeCamFraming,
  computeEmissiveIntensity,
  computeLidRotationX,
  computeLidU,
  computeSpinY,
  createBootScreenTexture,
  disposeClonedModel,
  drawBootLoadingFrame,
  emissiveWhite,
  findScreenDisplayMaterial,
  HEADSHOT_URL,
  LOADING_BAR_FILL_END_T,
  LOADING_BAR_FILL_START_T,
  MODEL_URL,
  OPEN_LID_X,
  POINTER_TILT_MAX_RAD,
  primeHeroLaptopAudioInGesture,
  REVEAL_END_INTENSITY,
  REVEAL_START_T,
  tickHeroLaptopSfx,
  type BootScreenResources,
  type CamFraming,
  type LidSettleState,
} from './hero-laptop-utils'

useGLTF.preload(MODEL_URL)

type LaptopModelProps = {
  replayKey: number
  reducedMotion: boolean
  soundEnabled: boolean
  runnerActive: boolean
}

function resetIntroRefs(
  replayKey: number,
  replayKeyRef: React.MutableRefObject<number>,
  elapsedMs: React.MutableRefObject<number>,
  idleTime: React.MutableRefObject<number>,
  settleRef: React.MutableRefObject<LidSettleState>,
  latchPlayedRef: React.MutableRefObject<boolean>,
  startupPlayedRef: React.MutableRefObject<boolean>,
  headshotRevealedRef: React.MutableRefObject<boolean>,
  latchSinceLidOpenRef: React.MutableRefObject<number | null>,
  latchLastTryRef: React.MutableRefObject<number>,
  startupSinceRevealRef: React.MutableRefObject<number | null>,
  startupLastTryRef: React.MutableRefObject<number>,
) {
  replayKeyRef.current = replayKey
  elapsedMs.current = 0
  idleTime.current = 0
  settleRef.current = { settleStarted: false, settleElapsedMs: 0 }
  latchPlayedRef.current = false
  startupPlayedRef.current = false
  headshotRevealedRef.current = false
  latchSinceLidOpenRef.current = null
  latchLastTryRef.current = 0
  startupSinceRevealRef.current = null
  startupLastTryRef.current = 0
}

function LaptopModel({
  replayKey,
  reducedMotion,
  soundEnabled,
  runnerActive,
}: LaptopModelProps) {
  const { scene: sourceScene } = useGLTF(MODEL_URL) as { scene: Group }
  const model = useMemo(() => cloneModelWithUniqueResources(sourceScene), [sourceScene])
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
  const idleStepAccumRef = useRef(0)
  const settleRef = useRef<LidSettleState>({ settleStarted: false, settleElapsedMs: 0 })
  const latchPlayedRef = useRef(false)
  const startupPlayedRef = useRef(false)
  const headshotRevealedRef = useRef(false)
  const latchAudioRef = useRef<HTMLAudioElement | null>(null)
  const startupAudioRef = useRef<HTMLAudioElement | null>(null)
  const latchSinceLidOpenRef = useRef<number | null>(null)
  const latchLastTryRef = useRef(0)
  const startupSinceRevealRef = useRef<number | null>(null)
  const startupLastTryRef = useRef(0)

  const camFraming = useRef<CamFraming>({
    ready: false,
    start: new THREE.Vector3(),
    end: new THREE.Vector3(),
    look: new THREE.Vector3(),
  })
  const scratchCamPos = useRef(new THREE.Vector3())

  useEffect(() => {
    invalidate()
  }, [invalidate, replayKey])

  useEffect(() => {
    if (runnerActive) invalidate()
  }, [runnerActive, replayKey, invalidate])

  useEffect(() => {
    return () => {
      const screenMat = screenMatRef.current
      if (screenMat) {
        screenMat.map = null
        screenMat.emissiveMap = null
      }
      texture.dispose()
      bootScreenRef.current?.texture.dispose()
      bootScreenRef.current = null
      latchAudioRef.current?.pause()
      latchAudioRef.current = null
      startupAudioRef.current?.pause()
      startupAudioRef.current = null
      disposeClonedModel(model)
    }
  }, [texture, model])

  useEffect(() => {
    if (typeof window === 'undefined' || !soundEnabled || reducedMotion) return
    const ac = new AbortController()
    const { signal } = ac
    const onGesture = () => {
      primeHeroLaptopAudioInGesture(latchAudioRef, startupAudioRef)
      ac.abort()
    }
    window.addEventListener('pointerdown', onGesture, { capture: true, passive: true, signal })
    window.addEventListener('keydown', onGesture, { capture: true, passive: true, signal })
    return () => ac.abort()
  }, [soundEnabled, reducedMotion])

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
    screenRef.current = model.getObjectByName('Screen') ?? null
    screenMatRef.current = findScreenDisplayMaterial(model)

    const mat = screenMatRef.current
    if (!mat) return

    const boot = reducedMotion ? null : getBootScreen()
    if (reducedMotion) {
      mat.map = texture
      mat.emissiveMap = texture
    } else if (boot) {
      mat.map = boot.texture
      mat.emissiveMap = boot.texture
    }
    mat.emissive.copy(emissiveWhite)
    mat.emissiveIntensity = 0
    mat.needsUpdate = true
  }, [model, texture, reducedMotion, getBootScreen])

  useLayoutEffect(() => {
    const rig = rigRef.current
    const spin = spinRef.current
    if (!rig || !spin || !(camera instanceof THREE.PerspectiveCamera)) return

    rig.position.set(0, 0, 0)
    spin.position.set(0, 0, 0)

    const framing = computeCamFraming(model, camera)
    if (!framing) return

    const fm = camFraming.current
    fm.ready = framing.ready
    fm.start.copy(framing.start)
    fm.end.copy(framing.end)
    fm.look.copy(framing.look)

    camera.position.copy(reducedMotion ? fm.end : fm.start)
    camera.lookAt(fm.look)
    invalidate()
  }, [model, camera, invalidate, reducedMotion])

  useFrame((_, delta) => {
    const spin = spinRef.current
    const tilt = tiltRef.current
    const screen = screenRef.current
    const mat = screenMatRef.current
    if (!spin || !tilt || !screen || !mat || !runnerActive) return

    if (!(camera instanceof THREE.PerspectiveCamera)) return

    if (reducedMotion) {
      screen.rotation.x = OPEN_LID_X
      spin.rotation.set(0, 0, 0)
      tilt.rotation.set(0, 0, 0)
      mat.emissive.copy(emissiveWhite)
      mat.emissiveIntensity = REVEAL_END_INTENSITY
      applyCameraForTimeline(camera, camFraming.current, 1, scratchCamPos.current)
      return
    }

    if (replayKeyRef.current !== replayKey) {
      resetIntroRefs(
        replayKey,
        replayKeyRef,
        elapsedMs,
        idleTime,
        settleRef,
        latchPlayedRef,
        startupPlayedRef,
        headshotRevealedRef,
        latchSinceLidOpenRef,
        latchLastTryRef,
        startupSinceRevealRef,
        startupLastTryRef,
      )
      spin.rotation.set(0, 0, 0)
      tilt.rotation.set(0, 0, 0)
      screen.rotation.x = CLOSED_LID_X
      mat.emissive.copy(emissiveWhite)
      mat.emissiveIntensity = 0
      const boot = getBootScreen()
      mat.map = boot.texture
      mat.emissiveMap = boot.texture
      mat.needsUpdate = true
      drawBootLoadingFrame(boot.ctx, 0, 0)
      boot.texture.needsUpdate = true
      applyCameraForTimeline(camera, camFraming.current, 0, scratchCamPos.current)
    }

    elapsedMs.current += delta * 1000
    const t = Math.min(1, elapsedMs.current / ANIM_DURATION_MS)
    const deltaMs = delta * 1000

    applyCameraForTimeline(camera, camFraming.current, t, scratchCamPos.current)

    spin.rotation.y = computeSpinY(t)

    const lidU = computeLidU(t)
    const lidResult = computeLidRotationX(lidU, deltaMs, settleRef.current)
    settleRef.current = lidResult.settle
    screen.rotation.x = lidResult.rotationX

    tickHeroLaptopSfx(
      t,
      lidU,
      soundEnabled,
      latchPlayedRef,
      startupPlayedRef,
      latchSinceLidOpenRef,
      latchLastTryRef,
      startupSinceRevealRef,
      startupLastTryRef,
      latchAudioRef,
      startupAudioRef,
    )

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

    mat.emissive.copy(emissiveWhite)
    mat.emissiveIntensity = computeEmissiveIntensity(t)

    if (t >= 1) {
      mat.emissiveIntensity = REVEAL_END_INTENSITY
      const idle = applyIdleMotion(
        spin,
        tilt,
        delta,
        idleTime.current,
        tiltTargetRef.current,
        idleStepAccumRef.current,
      )
      idleTime.current = idle.idleTime
      idleStepAccumRef.current = idle.idleStepAccum
    } else {
      idleStepAccumRef.current = 0
      applyIntroTiltReset(tilt, delta)
    }
  })

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
      spin?.rotation.set(0, 0, 0)
      tilt?.rotation.set(0, 0, 0)
      return
    }

    screen.rotation.x = CLOSED_LID_X
    mat.emissive.copy(emissiveWhite)
    mat.emissiveIntensity = 0
  }, [model, texture, reducedMotion])

  return (
    <group ref={rigRef}>
      <group ref={spinRef}>
        <group ref={tiltRef}>
          <primitive object={model} />
        </group>
      </group>
    </group>
  )
}

export type HeroLaptopSceneProps = {
  replayKey: number
  reducedMotion: boolean
  soundEnabled: boolean
  runnerActive: boolean
}

class HeroLaptopErrorBoundary extends Component<
  { children: ReactNode },
  { error: unknown }
> {
  state = { error: null as unknown }
  static getDerivedStateFromError(error: unknown) {
    return { error }
  }
  componentDidCatch(error: unknown) {
    if (typeof window !== 'undefined') {
      console.error('[HeroLaptopScene] render error:', error)
    }
  }
  render() {
    if (this.state.error) return null
    return this.props.children
  }
}

export default function HeroLaptopScene({
  replayKey,
  reducedMotion,
  soundEnabled,
  runnerActive,
}: HeroLaptopSceneProps) {
  return (
    <Canvas
      className="h-full w-full touch-none"
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0.25, 6], fov: 38, near: 0.01, far: 200 }}
      frameloop={runnerActive ? 'always' : 'never'}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} />
      <directionalLight position={[-3, 2, -2]} intensity={0.25} />
      <HeroLaptopErrorBoundary>
        <Suspense fallback={null}>
          <LaptopModel
            replayKey={replayKey}
            reducedMotion={reducedMotion}
            soundEnabled={soundEnabled}
            runnerActive={runnerActive}
          />
        </Suspense>
      </HeroLaptopErrorBoundary>
    </Canvas>
  )
}
