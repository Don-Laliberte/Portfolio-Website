'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const PNG_URLS = {
  handheld: '/sprites/pink-handheld.png',
  bunny: '/sprites/bunny.png',
  heart: '/sprites/heart.png',
  note: '/sprites/music-note.png',
  head: '/sprites/nanashi-head.png',
  irl: '/sprites/don-irl.png',
  job: '/sprites/job-application.png',
} as const

type TexKey = keyof typeof PNG_URLS
type BaseTexKey = Exclude<TexKey, 'job'>

type MapsState = Record<BaseTexKey, THREE.CanvasTexture> & {
  job?: THREE.CanvasTexture
}

/** ~1.5% per visit — "jobs are scary" easter egg. */
const JOB_EASTER_EGG_CHANCE = 0.15

/** Nanashi head reads larger than other icons at the same texture resolution — scale down in-world. */
const HEAD_SIZE_FACTOR = 0.82

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

type LayoutEntry = {
  key: TexKey
  position: [number, number, number]
  /** Base speed in world units/sec; per-axis sign is randomized on mount. */
  speed: number
  /** Seed offset so per-sprite RNG is deterministic per slot. */
  seed: number
  /** Multiplier on auto scale from viewport (logo-ish size). */
  sizeMul: number
}

/** Fixed slots — never `job` (that sprite is easter-egg only). */
type CoreLayoutEntry = Omit<LayoutEntry, 'key'> & { key: BaseTexKey }

const LAYOUT: CoreLayoutEntry[] = [
  { key: 'handheld', position: [-5.4, 2.2, -3.8], speed: 0.55, seed: 0.13, sizeMul: 1.35 },
  { key: 'bunny', position: [4.8, 1.4, -2.9], speed: 0.7, seed: 0.41, sizeMul: 1.2 },
  { key: 'heart', position: [-2.1, -2.8, -1.2], speed: 0.85, seed: 0.62, sizeMul: 1.1 },
  { key: 'note', position: [5.6, -1.9, -3.2], speed: 0.6, seed: 0.27, sizeMul: 1.25 },
  { key: 'head', position: [-4.2, -1.1, 0.4], speed: 0.45, seed: 0.83, sizeMul: 1.05 },
  { key: 'handheld', position: [2.4, 3.1, -0.8], speed: 0.9, seed: 0.05, sizeMul: 1.05 },
  { key: 'bunny', position: [-6.0, -2.4, -2.0], speed: 0.5, seed: 0.91, sizeMul: 1.15 },
  { key: 'heart', position: [0.8, 2.6, -3.6], speed: 0.75, seed: 0.34, sizeMul: 1.0 },
  { key: 'note', position: [-3.5, 0.2, -2.4], speed: 0.65, seed: 0.58, sizeMul: 1.1 },
  { key: 'irl', position: [4.0, 0.8, -1.6], speed: 0.5, seed: 0.77, sizeMul: 1.15 },
  { key: 'irl', position: [6.2, -3.0, -3.9], speed: 0.95, seed: 0.19, sizeMul: 1.25 },
  { key: 'head', position: [-1.2, -3.4, 0.2], speed: 0.7, seed: 0.46, sizeMul: 0.95 },
]

type SpriteKinematics = {
  px: number
  py: number
  pz: number
  vx: number
  vy: number
  targetVx: number
  targetVy: number
  nextTurnIn: number
  rotZ: number
  rotVel: number
  targetRotVel: number
  nextRotSteerIn: number
}

function SpriteBillboard({
  map,
  texKey,
  initialPosition,
  speed,
  seed,
  sizeMul,
  reducedMotion,
}: {
  map: THREE.Texture
  texKey: TexKey
  initialPosition: [number, number, number]
  speed: number
  seed: number
  sizeMul: number
  reducedMotion: boolean
}) {
  const ref = useRef<THREE.Sprite>(null)
  const { viewport } = useThree()
  const aspect = (map.image as { width?: number; height?: number })?.width
    ? ((map.image as HTMLImageElement).width || 1) / ((map.image as HTMLImageElement).height || 1)
    : 1

  const scale = useMemo(() => {
    const headAdjust = texKey === 'head' ? HEAD_SIZE_FACTOR : 1
    const h = viewport.height * 0.14 * sizeMul * headAdjust
    const w = h * aspect
    return [w, h, 1] as const
  }, [viewport.height, texKey, sizeMul, aspect])

  const stateRef = useRef<SpriteKinematics>({
    px: initialPosition[0],
    py: initialPosition[1],
    pz: initialPosition[2],
    vx: 0,
    vy: 0,
    targetVx: 0,
    targetVy: 0,
    nextTurnIn: 0,
    rotZ: 0,
    rotVel: 0,
    targetRotVel: 0,
    nextRotSteerIn: 0,
  })

  useEffect(() => {
    const angle = (seed * Math.PI * 2 + Math.random() * Math.PI * 2) % (Math.PI * 2)
    const vx = Math.cos(angle) * speed
    const vy = Math.sin(angle) * speed
    const s = stateRef.current
    s.px = initialPosition[0]
    s.py = initialPosition[1]
    s.pz = initialPosition[2]
    s.vx = vx
    s.vy = vy
    s.targetVx = vx
    s.targetVy = vy
    s.nextTurnIn = 1.5 + Math.random() * 3.5
    s.rotZ = (seed * 6.28 + Math.random() * 6.28) % 6.28
    s.rotVel = (Math.random() - 0.5) * 1.4
    s.targetRotVel = s.rotVel
    s.nextRotSteerIn = 1.2 + Math.random() * 2.8
  }, [initialPosition, seed, speed])

  useFrame((_, dt) => {
    const spr = ref.current
    if (!spr) return
    const s = stateRef.current
    const mat = spr.material as THREE.SpriteMaterial
    if (reducedMotion) {
      spr.position.set(initialPosition[0], initialPosition[1], initialPosition[2])
      mat.rotation = 0
      return
    }

    const step = Math.min(dt, 1 / 30)

    s.nextTurnIn -= step
    if (s.nextTurnIn <= 0) {
      const newAngle = Math.random() * Math.PI * 2
      s.targetVx = Math.cos(newAngle) * speed
      s.targetVy = Math.sin(newAngle) * speed
      s.nextTurnIn = 2.5 + Math.random() * 4.5
    }

    s.nextRotSteerIn -= step
    if (s.nextRotSteerIn <= 0) {
      s.targetRotVel = (Math.random() - 0.5) * 1.8
      s.nextRotSteerIn = 1.8 + Math.random() * 4.2
    }

    const ease = 1 - Math.exp(-step * 0.9)
    s.vx += (s.targetVx - s.vx) * ease
    s.vy += (s.targetVy - s.vy) * ease
    s.rotVel += (s.targetRotVel - s.rotVel) * ease

    s.px += s.vx * step
    s.py += s.vy * step
    s.rotZ += s.rotVel * step
    mat.rotation = s.rotZ

    const halfW = viewport.width / 2
    const halfH = viewport.height / 2
    const margin = Math.max(scale[0], scale[1])
    const xBound = halfW + margin
    const yBound = halfH + margin

    if (s.px > xBound) s.px = -xBound
    else if (s.px < -xBound) s.px = xBound
    if (s.py > yBound) s.py = -yBound
    else if (s.py < -yBound) s.py = yBound

    spr.position.set(s.px, s.py, s.pz)
  })

  return (
    <sprite ref={ref} position={initialPosition} scale={scale}>
      <spriteMaterial
        map={map}
        transparent
        depthWrite={false}
        toneMapped={false}
        opacity={0.6}
      />
    </sprite>
  )
}

function SpriteField({ reducedMotion }: { reducedMotion: boolean }) {
  const [maps, setMaps] = useState<MapsState | null>(null)
  const [jobEasterEgg, setJobEasterEgg] = useState<(LayoutEntry & { key: 'job' }) | null>(null)

  useEffect(() => {
    let cancelled = false
    let loaded: THREE.CanvasTexture[] = []

    ;(async () => {
      try {
        const [handheld, bunny, heart, note, head, irl] = await Promise.all([
          loadKeyedPng(PNG_URLS.handheld),
          loadKeyedPng(PNG_URLS.bunny),
          loadKeyedPng(PNG_URLS.heart),
          loadKeyedPng(PNG_URLS.note),
          loadKeyedPng(PNG_URLS.head),
          loadKeyedPng(PNG_URLS.irl),
        ])
        if (cancelled) {
          ;[handheld, bunny, heart, note, head, irl].forEach((t) => t.dispose())
          return
        }

        const base: Record<BaseTexKey, THREE.CanvasTexture> = {
          handheld,
          bunny,
          heart,
          note,
          head,
          irl,
        }
        loaded = [handheld, bunny, heart, note, head, irl]

        let nextMaps: MapsState = { ...base }
        let egg: (LayoutEntry & { key: 'job' }) | null = null

        if (Math.random() < JOB_EASTER_EGG_CHANCE) {
          try {
            const jobTex = await loadKeyedPng(PNG_URLS.job, 128, {
              outerDarkOnly: true,
            })
            if (cancelled) {
              jobTex.dispose()
              return
            }
            loaded.push(jobTex)
            nextMaps = { ...base, job: jobTex }
            egg = {
              key: 'job',
              position: [
                (Math.random() - 0.5) * 11,
                (Math.random() - 0.5) * 7,
                -1.8 - Math.random() * 2.4,
              ],
              speed: 0.38 + Math.random() * 0.42,
              seed: Math.random(),
              sizeMul: 1.02,
            }
          } catch {
            // Rare asset failure — skip egg silently
          }
        }

        if (cancelled) {
          loaded.forEach((t) => t.dispose())
          return
        }
        setMaps(nextMaps)
        setJobEasterEgg(egg)
      } catch (e) {
        console.error('[FloatingSpritesScene] texture load failed', e)
      }
    })()

    return () => {
      cancelled = true
      loaded.forEach((t) => t.dispose())
    }
  }, [])

  if (!maps) return null

  return (
    <>
      {LAYOUT.map((entry, i) => (
        <SpriteBillboard
          key={`${entry.key}-${i}`}
          map={maps[entry.key]}
          texKey={entry.key}
          initialPosition={entry.position}
          speed={entry.speed}
          seed={entry.seed}
          sizeMul={entry.sizeMul}
          reducedMotion={reducedMotion}
        />
      ))}
      {jobEasterEgg && maps.job ? (
        <SpriteBillboard
          key="easter-egg-job"
          map={maps.job}
          texKey="job"
          initialPosition={jobEasterEgg.position}
          speed={jobEasterEgg.speed}
          seed={jobEasterEgg.seed}
          sizeMul={jobEasterEgg.sizeMul}
          reducedMotion={reducedMotion}
        />
      ) : null}
    </>
  )
}

export type FloatingSpritesSceneProps = {
  active: boolean
  reducedMotion: boolean
}

export default function FloatingSpritesScene({ active, reducedMotion }: FloatingSpritesSceneProps) {
  const frameloop = active ? 'always' : 'never'

  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 1.5]}
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
      <SpriteField reducedMotion={reducedMotion} />
    </Canvas>
  )
}
