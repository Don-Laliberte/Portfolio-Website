'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { createRef, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const PNG_URLS = {
  handheld: '/sprites/pink-handheld.png',
  bunny: '/sprites/bunny.png',
  heart: '/sprites/heart.png',
  heartBlue: '/sprites/heart-blue.png',
  bobaPink: '/sprites/boba-pink.png',
  bobaBlue: '/sprites/boba-blue.png',
  note: '/sprites/music-note.png',
  noteBlue: '/sprites/music-note-blue.png',
  head: '/sprites/nanashi-head.png',
  irl: '/sprites/don-irl.png',
  laptopPurple: '/sprites/laptop-purple.png',
  laptopPink: '/sprites/laptop-pink.png',
  laptopBlue: '/sprites/laptop-blue.png',
  job: '/sprites/job-application.png',
} as const

type TexKey = keyof typeof PNG_URLS
type BaseTexKey = Exclude<TexKey, 'job'>

const BASE_KEYS: BaseTexKey[] = [
  'handheld',
  'bunny',
  'heart',
  'heartBlue',
  'bobaPink',
  'bobaBlue',
  'note',
  'noteBlue',
  'head',
  'irl',
  'laptopPurple',
  'laptopPink',
  'laptopBlue',
]

type MapsState = Record<BaseTexKey, THREE.CanvasTexture>

/**
 * Cheap one-shot UA sniff. We only use this to throttle the sprite simulation
 * on Firefox (its compositor has the least rAF headroom of the three engines
 * we target); UA-sniffing for that one decision is acceptable because the
 * fallback is just a smoother-vs-cheaper visual tradeoff, not a correctness
 * difference. Evaluates at module load; safe under SSR (returns `false`).
 */
const IS_FIREFOX =
  typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox')

/** Per-spawn chance the JOB easter egg appears. */
const JOB_EASTER_EGG_CHANCE = 0.1

/** Nanashi head reads larger than other icons at the same texture resolution — scale down in-world. */
const HEAD_SIZE_FACTOR = 0.82

/** Tier-independent slot constants. SLOT_COUNT and spritePx come from the viewport tier. */
const LIFETIME_MIN_S = 18
const LIFETIME_MAX_S = 36
const FADE_IN_S = 0.8
const FADE_OUT_S = 1.4
const MAX_OPACITY = 0.6

/** Light per-texture size bias so head/irl don't dominate next to small icons. */
const PER_KEY_SIZE_BIAS: Record<TexKey, number> = {
  handheld: 1.0,
  bunny: 1.0,
  heart: 0.95,
  heartBlue: 0.95,
  bobaPink: 1.05,
  bobaBlue: 1.05,
  note: 1.0,
  noteBlue: 1.0,
  head: 0.92,
  irl: 1.05,
  laptopPurple: 0.88,
  laptopPink: 0.88,
  laptopBlue: 0.88,
  job: 1.0,
}

type ChromaKeyedOpts = {
  /** RGB channels must all be <= this to count as "key" black (default 14). */
  threshold?: number
  /**
   * If true, only near-black pixels **connected to the image border** become
   * transparent (flood-fill from edges). Interior black (e.g. JOB text on
   * white paper) stays opaque. If false, every dark pixel is keyed — fine for
   * icons where black only appears in the outer background.
   */
  outerDarkOnly?: boolean
}

/** Keys out near-black pixels so pixel-art PNGs work on any page background. */
function chromaKeyedCanvasTexture(
  source: CanvasImageSource,
  sw: number,
  sh: number,
  opts?: ChromaKeyedOpts,
): THREE.CanvasTexture {
  const threshold = opts?.threshold ?? 14
  const outerDarkOnly = opts?.outerDarkOnly ?? false

  const canvas = document.createElement('canvas')
  canvas.width = sw
  canvas.height = sh
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('FloatingSpritesScene: 2D context unavailable')
  }
  ctx.drawImage(source, 0, 0, sw, sh)
  const imgData = ctx.getImageData(0, 0, sw, sh)
  const d = imgData.data

  const isKeyPixel = (px: number) => {
    const r = d[px]!
    const g = d[px + 1]!
    const b = d[px + 2]!
    return r <= threshold && g <= threshold && b <= threshold
  }

  if (!outerDarkOnly) {
    for (let i = 0; i < d.length; i += 4) {
      if (isKeyPixel(i)) {
        d[i + 3] = 0
      }
    }
  } else {
    const n = sw * sh
    const visited = new Uint8Array(n)
    const queue: number[] = []

    const tryEnqueue = (ix: number, iy: number) => {
      if (ix < 0 || ix >= sw || iy < 0 || iy >= sh) return
      const idx = iy * sw + ix
      if (visited[idx]) return
      const di = idx * 4
      if (!isKeyPixel(di)) return
      visited[idx] = 1
      queue.push(idx)
    }

    for (let x = 0; x < sw; x++) {
      tryEnqueue(x, 0)
      tryEnqueue(x, sh - 1)
    }
    for (let y = 0; y < sh; y++) {
      tryEnqueue(0, y)
      tryEnqueue(sw - 1, y)
    }

    while (queue.length > 0) {
      const idx = queue.pop()!
      const di = idx * 4
      d[di + 3] = 0
      const ix = idx % sw
      const iy = (idx / sw) | 0
      tryEnqueue(ix - 1, iy)
      tryEnqueue(ix + 1, iy)
      tryEnqueue(ix, iy - 1)
      tryEnqueue(ix, iy + 1)
    }
  }

  ctx.putImageData(imgData, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.magFilter = THREE.NearestFilter
  tex.minFilter = THREE.NearestFilter
  tex.generateMipmaps = false
  tex.needsUpdate = true
  return tex
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}

async function loadKeyedPng(
  url: string,
  maxDim = 128,
  chroma?: ChromaKeyedOpts,
): Promise<THREE.CanvasTexture> {
  const img = await loadImage(url)
  const w = img.naturalWidth || img.width
  const h = img.naturalHeight || img.height
  const scale = Math.min(1, maxDim / Math.max(w, h))
  const sw = Math.max(1, Math.round(w * scale))
  const sh = Math.max(1, Math.round(h * scale))
  return chromaKeyedCanvasTexture(img, sw, sh, chroma)
}

function getAspectFor(map: THREE.Texture | null | undefined): number {
  if (!map) return 1
  const img = map.image as { width?: number; height?: number } | undefined
  if (!img?.width || !img?.height) return 1
  return img.width / img.height
}

/** Per-slot mutable state. Lives in a ref array, never triggers React renders. */
type SlotState = {
  // Texture
  texKey: TexKey | null
  appliedTexKey: TexKey | null
  aspect: number
  // Position + velocity
  px: number
  py: number
  pz: number
  vx: number
  vy: number
  targetVx: number
  targetVy: number
  nextTurnIn: number
  baseSpeed: number
  // Rotation
  rotZ: number
  rotVel: number
  targetRotVel: number
  nextRotSteerIn: number
  // Sizing
  sizeMul: number
  // Lifecycle
  age: number
  lifetime: number
}

function makeEmptySlot(): SlotState {
  return {
    texKey: null,
    appliedTexKey: null,
    aspect: 1,
    px: 0,
    py: 0,
    pz: 0,
    vx: 0,
    vy: 0,
    targetVx: 0,
    targetVy: 0,
    nextTurnIn: 0,
    baseSpeed: 0.6,
    rotZ: 0,
    rotVel: 0,
    targetRotVel: 0,
    nextRotSteerIn: 0,
    sizeMul: 1,
    age: 0,
    lifetime: LIFETIME_MIN_S,
  }
}

function pickBaseKey(): BaseTexKey {
  return BASE_KEYS[Math.floor(Math.random() * BASE_KEYS.length)]!
}

function randomSizeMul(key: TexKey): number {
  const base = 0.95 + Math.random() * 0.3
  return base * (PER_KEY_SIZE_BIAS[key] ?? 1)
}

type SpriteFieldProps = {
  reducedMotion: boolean
  slotCount: number
  spritePx: number
}

function SpriteField({ reducedMotion, slotCount, spritePx }: SpriteFieldProps) {
  const [maps, setMaps] = useState<MapsState | null>(null)
  const { viewport } = useThree()

  // Sprite + slot state (mutable, ref-only)
  const spriteRefs = useMemo(
    () => Array.from({ length: slotCount }, () => createRef<THREE.Sprite>()),
    [slotCount],
  )
  const slotsRef = useRef<SlotState[]>([])

  // Texture lifecycle
  const disposablesRef = useRef<THREE.CanvasTexture[]>([])
  const jobTexRef = useRef<THREE.CanvasTexture | null>(null)
  const jobLoadingRef = useRef<Promise<THREE.CanvasTexture> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Load base textures once
  useEffect(() => {
    let cancelled = false
    const local: THREE.CanvasTexture[] = []

    ;(async () => {
      try {
        const [
          handheld,
          bunny,
          heart,
          heartBlue,
          bobaPink,
          bobaBlue,
          note,
          noteBlue,
          head,
          irl,
          laptopPurple,
          laptopPink,
          laptopBlue,
        ] = await Promise.all([
          loadKeyedPng(PNG_URLS.handheld),
          loadKeyedPng(PNG_URLS.bunny),
          loadKeyedPng(PNG_URLS.heart),
          loadKeyedPng(PNG_URLS.heartBlue),
          loadKeyedPng(PNG_URLS.bobaPink),
          loadKeyedPng(PNG_URLS.bobaBlue),
          loadKeyedPng(PNG_URLS.note),
          loadKeyedPng(PNG_URLS.noteBlue),
          loadKeyedPng(PNG_URLS.head),
          loadKeyedPng(PNG_URLS.irl),
          loadKeyedPng(PNG_URLS.laptopPurple),
          loadKeyedPng(PNG_URLS.laptopPink),
          loadKeyedPng(PNG_URLS.laptopBlue),
        ])
        if (cancelled) {
          ;[
            handheld,
            bunny,
            heart,
            heartBlue,
            bobaPink,
            bobaBlue,
            note,
            noteBlue,
            head,
            irl,
            laptopPurple,
            laptopPink,
            laptopBlue,
          ].forEach((t) => t.dispose())
          return
        }
        local.push(
          handheld,
          bunny,
          heart,
          heartBlue,
          bobaPink,
          bobaBlue,
          note,
          noteBlue,
          head,
          irl,
          laptopPurple,
          laptopPink,
          laptopBlue,
        )
        disposablesRef.current.push(...local)
        setMaps({
          handheld,
          bunny,
          heart,
          heartBlue,
          bobaPink,
          bobaBlue,
          note,
          noteBlue,
          head,
          irl,
          laptopPurple,
          laptopPink,
          laptopBlue,
        })
      } catch (e) {
        console.error('[FloatingSpritesScene] base texture load failed', e)
      }
    })()

    return () => {
      cancelled = true
      // Dispose everything we've loaded, including any lazy JOB texture
      disposablesRef.current.forEach((t) => t.dispose())
      disposablesRef.current = []
      jobTexRef.current = null
      jobLoadingRef.current = null
    }
  }, [])

  /** Roll a texture key. JOB has a low chance; falls back to a base key while the
   *  JOB texture is downloading (one-shot lazy load per session). */
  function rollTexKey(): TexKey {
    if (Math.random() < JOB_EASTER_EGG_CHANCE) {
      if (jobTexRef.current) return 'job'
      if (!jobLoadingRef.current) {
        jobLoadingRef.current = loadKeyedPng(PNG_URLS.job, 128, {
          outerDarkOnly: true,
        })
          .then((t) => {
            if (!mountedRef.current) {
              t.dispose()
              return t
            }
            jobTexRef.current = t
            disposablesRef.current.push(t)
            return t
          })
          .catch((e) => {
            jobLoadingRef.current = null
            throw e
          })
      }
      // Fall through: use a base key this cycle; JOB will be ready next time.
    }
    return pickBaseKey()
  }

  /** Re-randomize a slot for a new spawn cycle. */
  function respawn(slot: SlotState, vWidth: number, vHeight: number) {
    const key = rollTexKey()
    slot.texKey = key
    slot.sizeMul = randomSizeMul(key)

    const halfW = vWidth / 2
    const halfH = vHeight / 2
    slot.px = (Math.random() - 0.5) * halfW * 1.8
    slot.py = (Math.random() - 0.5) * halfH * 1.8
    slot.pz = -4 + Math.random() * 4.4

    slot.baseSpeed = 0.45 + Math.random() * 0.5
    const angle = Math.random() * Math.PI * 2
    slot.vx = Math.cos(angle) * slot.baseSpeed
    slot.vy = Math.sin(angle) * slot.baseSpeed
    slot.targetVx = slot.vx
    slot.targetVy = slot.vy
    slot.nextTurnIn = 1.5 + Math.random() * 3.5

    slot.rotZ = Math.random() * Math.PI * 2
    slot.rotVel = (Math.random() - 0.5) * 1.4
    slot.targetRotVel = slot.rotVel
    slot.nextRotSteerIn = 1.2 + Math.random() * 2.8

    slot.lifetime = LIFETIME_MIN_S + Math.random() * (LIFETIME_MAX_S - LIFETIME_MIN_S)
    slot.age = 0
  }

  // Allocate slots once textures + slotCount are known, staggering initial ages.
  useEffect(() => {
    if (!maps) return
    const w = viewport.width
    const h = viewport.height
    const next: SlotState[] = []
    for (let i = 0; i < slotCount; i++) {
      const s = makeEmptySlot()
      respawn(s, w, h)
      // Spread initial ages across each slot's own lifetime so cycles are out of phase.
      s.age = (i / Math.max(1, slotCount)) * s.lifetime * 0.9
      next.push(s)
    }
    slotsRef.current = next
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maps, slotCount])

  // On Firefox we cap the simulation to ~30 Hz: Firefox's compositor has the
  // least rAF headroom of the three engines, especially with our sticky navbar
  // + fixed WebGL stack, and 30 fps reads as smooth at this scale. Chromium
  // and Safari run at full refresh rate (`TARGET_STEP_S = 0` means "every
  // frame"). MAX_STEP_S caps the physics step on both paths so a long pause
  // doesn't translate into a giant lurch on the first resumed frame.
  const stepAccumRef = useRef(0)
  const TARGET_STEP_S = IS_FIREFOX ? 1 / 30 : 0
  const MAX_STEP_S = 1 / 30

  useFrame((_, dt) => {
    const slots = slotsRef.current
    if (!maps || slots.length === 0) return

    stepAccumRef.current += dt
    if (stepAccumRef.current < TARGET_STEP_S) return
    const step = Math.min(stepAccumRef.current, MAX_STEP_S)
    stepAccumRef.current = 0

    const vWidth = viewport.width
    const vHeight = viewport.height
    const vFactor = viewport.factor // px per world unit at z = 0

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]!
      const spr = spriteRefs[i]?.current
      if (!spr) continue
      const mat = spr.material as THREE.SpriteMaterial

      // Apply texture if it changed since last frame
      if (slot.texKey && slot.appliedTexKey !== slot.texKey) {
        const tex =
          slot.texKey === 'job' ? jobTexRef.current : maps[slot.texKey as BaseTexKey]
        if (tex) {
          mat.map = tex
          mat.needsUpdate = true
          slot.aspect = getAspectFor(tex)
          slot.appliedTexKey = slot.texKey
        }
      }

      // Scale derived from tier sprite px (resilient across viewport changes)
      const headAdjust = slot.texKey === 'head' ? HEAD_SIZE_FACTOR : 1
      const targetPx = spritePx * slot.sizeMul * headAdjust
      const h = targetPx / vFactor
      const w = h * slot.aspect
      spr.scale.set(w, h, 1)

      if (reducedMotion) {
        spr.position.set(slot.px, slot.py, slot.pz)
        mat.rotation = 0
        mat.opacity = slot.appliedTexKey ? MAX_OPACITY : 0
        continue
      }

      // Advance lifetime; respawn if past it
      slot.age += step
      if (slot.age >= slot.lifetime) {
        respawn(slot, vWidth, vHeight)
        // Defer texture/scale apply to next frame (cheap)
      }

      // Wander steering
      slot.nextTurnIn -= step
      if (slot.nextTurnIn <= 0) {
        const newAngle = Math.random() * Math.PI * 2
        slot.targetVx = Math.cos(newAngle) * slot.baseSpeed
        slot.targetVy = Math.sin(newAngle) * slot.baseSpeed
        slot.nextTurnIn = 2.5 + Math.random() * 4.5
      }

      // Rotation steering
      slot.nextRotSteerIn -= step
      if (slot.nextRotSteerIn <= 0) {
        slot.targetRotVel = (Math.random() - 0.5) * 1.8
        slot.nextRotSteerIn = 1.8 + Math.random() * 4.2
      }

      const ease = 1 - Math.exp(-step * 0.9)
      slot.vx += (slot.targetVx - slot.vx) * ease
      slot.vy += (slot.targetVy - slot.vy) * ease
      slot.rotVel += (slot.targetRotVel - slot.rotVel) * ease

      slot.px += slot.vx * step
      slot.py += slot.vy * step
      slot.rotZ += slot.rotVel * step

      // Edge wrap so sprites stay in-frame during their lifetime
      const halfW = vWidth / 2
      const halfH = vHeight / 2
      const margin = Math.max(w, h)
      const xBound = halfW + margin
      const yBound = halfH + margin
      if (slot.px > xBound) slot.px = -xBound
      else if (slot.px < -xBound) slot.px = xBound
      if (slot.py > yBound) slot.py = -yBound
      else if (slot.py < -yBound) slot.py = yBound

      // Fade curve
      let op = MAX_OPACITY
      const t = slot.age
      const L = slot.lifetime
      if (t < FADE_IN_S) {
        op = MAX_OPACITY * (t / FADE_IN_S)
      } else if (t > L - FADE_OUT_S) {
        op = MAX_OPACITY * Math.max(0, (L - t) / FADE_OUT_S)
      }

      mat.opacity = slot.appliedTexKey ? op : 0
      mat.rotation = slot.rotZ
      spr.position.set(slot.px, slot.py, slot.pz)
    }
  })

  return (
    <>
      {spriteRefs.map((ref, i) => (
        <sprite key={i} ref={ref} position={[0, 0, 0]} scale={[0.001, 0.001, 1]}>
          <spriteMaterial
            transparent
            depthWrite={false}
            toneMapped={false}
            opacity={0}
          />
        </sprite>
      ))}
    </>
  )
}

export type FloatingSpritesSceneProps = {
  active: boolean
  reducedMotion: boolean
  slotCount: number
  spritePx: number
  dprMax: number
}

export default function FloatingSpritesScene({
  active,
  reducedMotion,
  slotCount,
  spritePx,
  dprMax,
}: FloatingSpritesSceneProps) {
  const frameloop = active ? 'always' : 'never'

  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, dprMax]}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      }}
      camera={{ position: [0, 0, 8], fov: 50, near: 0.1, far: 60 }}
      frameloop={frameloop}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
      }}
    >
      <SpriteField
        reducedMotion={reducedMotion}
        slotCount={slotCount}
        spritePx={spritePx}
      />
    </Canvas>
  )
}
