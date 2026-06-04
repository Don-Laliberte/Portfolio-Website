import type { MutableRefObject } from 'react'
import * as THREE from 'three'
import type { Object3D, PerspectiveCamera } from 'three'

import { pixelifySans } from '@/lib/fonts'

/** Firefox gets 30 Hz idle drift; Chromium/Safari run at full refresh rate. */
export const IS_FIREFOX =
  typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox')

export const MODEL_URL = '/models/portfolio-laptop.glb'
export const HEADSHOT_URL = '/images/don-headshot.jpg'

export const CLOSED_LID_X = 1.58
export const OPEN_LID_X = 0

export const ANIM_DURATION_MS = 3200
export const SPIN_END_T = 0.7
export const LID_START_T = 0.2
export const LID_END_T = 0.95
export const REVEAL_START_T = 0.85
export const REVEAL_END_INTENSITY = 0.9

export const LOADING_BAR_FILL_START_T = 0.22
export const LOADING_BAR_FILL_END_T = 0.74

export const BOOT_GLOW_INTENSITY = 0.85
export const BOOT_GLOW_FADE_IN_T = LID_START_T
export const BOOT_GLOW_FULL_T = 0.45
export const BOOT_GLOW_HOLD_END_T = 0.78
export const HEADSHOT_FADE_IN_END_T = 1.0

export const BOOT_LABEL_TIME_MS_PER_DOT = 420
export const BOOT_LABEL_BLINK_HZ = 1.1
export const BOOT_LABEL_FONT_SCALE = 0.2

export const BOOT_CANVAS_W = 512
export const BOOT_CANVAS_H = 256

export const BOOT_LABEL_FONT_STACK = pixelifySans.style.fontFamily

export const IDLE_YAW_DRIFT = 0.092
export const IDLE_PITCH_AMP = 0.055
export const IDLE_PITCH_FREQ = 1.08
export const IDLE_ROLL_AMP = 0.028
export const IDLE_ROLL_FREQ = 0.72

export const CAMERA_FIT_MARGIN = 1.06
export const CAMERA_HEIGHT_FRAC = 0.6
export const CAMERA_LOOK_DOWN_FRAC = 0.05
export const CAMERA_SPIN_ZOOM_MULT = 1.44
export const CAMERA_ZOOM_BLEND_START = 0.4
export const CAMERA_ZOOM_CURVE_POWER = 1.35

export const SETTLE_DURATION_MS = 130
export const SETTLE_PEAK_RAD = 0.038

export const POINTER_TILT_MAX_RAD = 0.06
export const POINTER_TILT_SMOOTH = 8

export const LATCH_SOUND_URL = '/sounds/hero-laptop-latch.mp3'
export const STARTUP_SOUND_URL = '/sounds/hero-laptop-startup.mp3'

export const SFX_RETRY_MS = 120
export const SFX_RETRY_WINDOW_MS = 14_000

export const TARGET_IDLE_STEP_S = IS_FIREFOX ? 1 / 30 : 0
export const MAX_IDLE_STEP_S = 1 / 30

export const emissiveWhite = new THREE.Color(0xffffff)

const BOOT_THEME_FALLBACK = {
  bg: '#1a0a1a',
  track: '#521053',
  barFill: '#f472c8',
  label: '#d07aa0',
} as const

type BootPalette = {
  bg: string
  track: string
  barFill: string
  label: string
}

let cachedBootPalette: BootPalette | null = null
let cachedBootTheme: string | null = null

function cssThemeColor(varName: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return raw || fallback
}

/** Reads @theme palette tokens so the boot canvas tracks light/dark mode. */
export function getBootPalette(): BootPalette {
  if (typeof document === 'undefined') return { ...BOOT_THEME_FALLBACK }

  const themeKey =
    document.documentElement.getAttribute('data-theme') ??
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

  if (cachedBootPalette && cachedBootTheme === themeKey) {
    return cachedBootPalette
  }

  cachedBootPalette = {
    bg: cssThemeColor('--color-ink', BOOT_THEME_FALLBACK.bg),
    track: cssThemeColor('--color-purple-mid', BOOT_THEME_FALLBACK.track),
    barFill: cssThemeColor('--color-pink-bright', BOOT_THEME_FALLBACK.barFill),
    label: cssThemeColor('--color-rose-bright', BOOT_THEME_FALLBACK.label),
  }
  cachedBootTheme = themeKey
  return cachedBootPalette
}

export function cubicOut(u: number) {
  return 1 - (1 - u) ** 3
}

export function easeOutBack(u: number) {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * (u - 1) ** 3 + c1 * (u - 1) ** 2
}

export function cameraZoomBlend(t: number) {
  const edge = THREE.MathUtils.smoothstep(t, CAMERA_ZOOM_BLEND_START, 1)
  return edge ** CAMERA_ZOOM_CURVE_POWER
}

export function isMeshMaterial(
  m: THREE.Material | THREE.Material[],
): m is THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial {
  return !Array.isArray(m) && 'map' in m && 'emissiveIntensity' in m
}

export type BootScreenResources = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  texture: THREE.CanvasTexture
}

export function createBootScreenTexture(): BootScreenResources {
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

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '').trim()
  if (normalized.length !== 6) return null
  const n = Number.parseInt(normalized, 16)
  if (Number.isNaN(n)) return null
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  }
}

/** Pink “OS boot” frame: themed field + rounded track + fill by `progress` (0–1). */
export function drawBootLoadingFrame(
  ctx: CanvasRenderingContext2D,
  progress: number,
  timeMs: number,
) {
  const palette = getBootPalette()
  const w = BOOT_CANVAS_W
  const h = BOOT_CANVAS_H
  ctx.fillStyle = palette.bg
  ctx.fillRect(0, 0, w, h)

  const marginX = w * 0.14
  const trackW = w - marginX * 2
  const barH = h * 0.072
  const barY = h * 0.5 - barH * 0.5
  const r = barH * 0.5
  const p = THREE.MathUtils.clamp(progress, 0, 1)

  ctx.fillStyle = palette.track
  ctx.beginPath()
  ctx.roundRect(marginX, barY, trackW, barH, r)
  ctx.fill()

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(marginX, barY, trackW, barH, r)
  ctx.clip()
  ctx.fillStyle = palette.barFill
  const fillW = Math.max(barH * 0.35, trackW * p)
  ctx.fillRect(marginX, barY, fillW, barH)
  ctx.restore()

  const dotCount = Math.floor(timeMs / BOOT_LABEL_TIME_MS_PER_DOT) % 4
  const label = `LOADING${'.'.repeat(dotCount)}`
  const blink =
    0.38 + 0.62 * (0.5 + 0.5 * Math.sin((timeMs / 1000) * Math.PI * 2 * BOOT_LABEL_BLINK_HZ))
  const alpha = THREE.MathUtils.clamp(0.28 + 0.72 * blink, 0.12, 1)

  const labelRgb = hexToRgb(palette.label)
  ctx.fillStyle = labelRgb
    ? `rgba(${labelRgb.r}, ${labelRgb.g}, ${labelRgb.b}, ${alpha})`
    : `rgba(208, 122, 160, ${alpha})`
  ctx.font = `600 ${Math.round(h * BOOT_LABEL_FONT_SCALE)}px ${BOOT_LABEL_FONT_STACK}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, w * 0.5, h * 0.28)
}

export function playCachedAudio(
  ref: MutableRefObject<HTMLAudioElement | null>,
  url: string,
): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (!ref.current) {
    ref.current = new Audio(url)
    ref.current.preload = 'auto'
  }
  const a = ref.current
  try {
    a.currentTime = 0
    return a.play().then(
      () => undefined,
      () => undefined,
    )
  } catch {
    return Promise.resolve()
  }
}

export function primeHeroLaptopAudioInGesture(
  latchRef: MutableRefObject<HTMLAudioElement | null>,
  startupRef: MutableRefObject<HTMLAudioElement | null>,
) {
  const primeOne = (r: MutableRefObject<HTMLAudioElement | null>, url: string) => {
    if (!r.current) {
      r.current = new Audio(url)
      r.current.preload = 'auto'
    }
    const el = r.current
    const wasMuted = el.muted
    el.muted = true
    void el.play().then(
      () => {
        el.pause()
        el.currentTime = 0
        el.muted = wasMuted
      },
      () => {
        el.muted = wasMuted
      },
    )
  }
  primeOne(latchRef, LATCH_SOUND_URL)
  primeOne(startupRef, STARTUP_SOUND_URL)
}

export type CamFraming = {
  ready: boolean
  start: THREE.Vector3
  end: THREE.Vector3
  look: THREE.Vector3
}

export function computeCamFraming(
  model: THREE.Object3D,
  camera: PerspectiveCamera,
): CamFraming | null {
  const box = new THREE.Box3().setFromObject(model)
  if (box.isEmpty()) return null

  const center = new THREE.Vector3()
  const size = new THREE.Vector3()
  box.getCenter(center)
  box.getSize(size)

  const maxDim = Math.max(size.x, size.y, size.z)
  const fovRad = THREE.MathUtils.degToRad(camera.fov)
  const dist = (maxDim / 2 / Math.tan(fovRad / 2)) * CAMERA_FIT_MARGIN

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

  return {
    ready: true,
    start: startPos,
    end: endPos,
    look: lookTarget,
  }
}

export function applyCameraForTimeline(
  camera: PerspectiveCamera,
  framing: CamFraming,
  t: number,
  scratchPos: THREE.Vector3,
) {
  if (!framing.ready) return
  if (t >= 1) {
    camera.position.copy(framing.end)
  } else {
    const camBlend = cameraZoomBlend(t)
    scratchPos.lerpVectors(framing.start, framing.end, camBlend)
    camera.position.copy(scratchPos)
  }
  camera.lookAt(framing.look)
}

export function computeSpinY(t: number) {
  const spinU = Math.min(1, t / SPIN_END_T)
  return cubicOut(spinU) * Math.PI * 4
}

export function computeLidU(t: number) {
  if (t <= LID_START_T) return 0
  if (t >= LID_END_T) return 1
  return (t - LID_START_T) / (LID_END_T - LID_START_T)
}

export type LidSettleState = {
  settleStarted: boolean
  settleElapsedMs: number
}

export function computeLidRotationX(
  lidU: number,
  deltaMs: number,
  settle: LidSettleState,
): { rotationX: number; settle: LidSettleState } {
  const baseLidX = THREE.MathUtils.lerp(CLOSED_LID_X, OPEN_LID_X, easeOutBack(lidU))
  let settleOffset = 0
  let nextSettle = settle

  if (lidU >= 1) {
    if (!settle.settleStarted) {
      nextSettle = { settleStarted: true, settleElapsedMs: 0 }
    } else {
      nextSettle = {
        settleStarted: true,
        settleElapsedMs: settle.settleElapsedMs + deltaMs,
      }
    }
    if (nextSettle.settleElapsedMs <= SETTLE_DURATION_MS) {
      settleOffset =
        SETTLE_PEAK_RAD *
        Math.sin(Math.PI * Math.min(1, nextSettle.settleElapsedMs / SETTLE_DURATION_MS))
    }
  } else {
    nextSettle = { settleStarted: false, settleElapsedMs: 0 }
  }

  return { rotationX: baseLidX + settleOffset, settle: nextSettle }
}

export function computeEmissiveIntensity(t: number): number {
  if (t < BOOT_GLOW_FADE_IN_T) return 0
  if (t < BOOT_GLOW_FULL_T) {
    const u = THREE.MathUtils.smoothstep(t, BOOT_GLOW_FADE_IN_T, BOOT_GLOW_FULL_T)
    return u * BOOT_GLOW_INTENSITY
  }
  if (t < BOOT_GLOW_HOLD_END_T) return BOOT_GLOW_INTENSITY
  if (t < REVEAL_START_T) {
    const u = THREE.MathUtils.smoothstep(t, BOOT_GLOW_HOLD_END_T, REVEAL_START_T)
    return BOOT_GLOW_INTENSITY * (1 - u)
  }
  const u = THREE.MathUtils.smoothstep(t, REVEAL_START_T, HEADSHOT_FADE_IN_END_T)
  return u * REVEAL_END_INTENSITY
}

export function tickHeroLaptopSfx(
  t: number,
  lidU: number,
  soundEnabled: boolean,
  latchPlayedRef: MutableRefObject<boolean>,
  startupPlayedRef: MutableRefObject<boolean>,
  latchSinceLidOpenRef: MutableRefObject<number | null>,
  latchLastTryRef: MutableRefObject<number>,
  startupSinceRevealRef: MutableRefObject<number | null>,
  startupLastTryRef: MutableRefObject<number>,
  latchAudioRef: MutableRefObject<HTMLAudioElement | null>,
  startupAudioRef: MutableRefObject<HTMLAudioElement | null>,
) {
  const now = performance.now()

  if (lidU <= 0) {
    latchSinceLidOpenRef.current = null
  } else if (latchSinceLidOpenRef.current === null) {
    latchSinceLidOpenRef.current = now
  }

  if (soundEnabled && lidU > 0 && !latchPlayedRef.current) {
    const since = latchSinceLidOpenRef.current
    if (since !== null && now - since < SFX_RETRY_WINDOW_MS) {
      if (latchLastTryRef.current === 0 || now - latchLastTryRef.current >= SFX_RETRY_MS) {
        latchLastTryRef.current = now
        void playCachedAudio(latchAudioRef, LATCH_SOUND_URL).then(() => {
          latchPlayedRef.current = true
        })
      }
    }
  }

  if (t < REVEAL_START_T) {
    startupSinceRevealRef.current = null
  } else if (startupSinceRevealRef.current === null) {
    startupSinceRevealRef.current = now
  }

  if (soundEnabled && t >= REVEAL_START_T && !startupPlayedRef.current) {
    const since = startupSinceRevealRef.current
    if (since !== null && now - since < SFX_RETRY_WINDOW_MS) {
      if (startupLastTryRef.current === 0 || now - startupLastTryRef.current >= SFX_RETRY_MS) {
        startupLastTryRef.current = now
        void playCachedAudio(startupAudioRef, STARTUP_SOUND_URL).then(() => {
          startupPlayedRef.current = true
        })
      }
    }
  }
}

export function applyIdleMotion(
  spin: THREE.Object3D,
  tilt: THREE.Object3D,
  delta: number,
  idleTime: number,
  tiltTarget: THREE.Vector2,
  idleStepAccum: number,
): { idleTime: number; idleStepAccum: number } {
  let nextAccum = idleStepAccum + delta
  if (nextAccum < TARGET_IDLE_STEP_S) {
    return { idleTime, idleStepAccum: nextAccum }
  }

  const stepDelta = Math.min(nextAccum, MAX_IDLE_STEP_S)
  const nextIdleTime = idleTime + stepDelta

  spin.rotation.y += stepDelta * IDLE_YAW_DRIFT
  spin.rotation.x = Math.sin(nextIdleTime * IDLE_PITCH_FREQ) * IDLE_PITCH_AMP
  spin.rotation.z = Math.sin(nextIdleTime * IDLE_ROLL_FREQ + 1.2) * IDLE_ROLL_AMP

  const k = 1 - Math.exp(-POINTER_TILT_SMOOTH * stepDelta)
  tilt.rotation.x += (tiltTarget.y - tilt.rotation.x) * k
  tilt.rotation.y += (tiltTarget.x - tilt.rotation.y) * k

  return { idleTime: nextIdleTime, idleStepAccum: 0 }
}

export function applyIntroTiltReset(tilt: THREE.Object3D, delta: number) {
  const k = 1 - Math.exp(-POINTER_TILT_SMOOTH * delta)
  tilt.rotation.x += (0 - tilt.rotation.x) * k
  tilt.rotation.y += (0 - tilt.rotation.y) * k
}

export function findScreenDisplayMaterial(
  model: THREE.Object3D,
): THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial | null {
  let found: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial | null = null
  model.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return
    const mat = obj.material
    if (!isMeshMaterial(mat)) return
    if (mat.name !== 'ScreenDisplay') return
    found = mat
  })
  return found
}

export function disposeClonedModel(model: THREE.Object3D) {
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    child.geometry?.dispose()
    const mats = Array.isArray(child.material) ? child.material : [child.material]
    for (const m of mats) {
      m.dispose()
    }
  })
}
