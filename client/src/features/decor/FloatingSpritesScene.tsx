'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const PNG_URLS = {
  handheld: '/sprites/pink-handheld.png',
  bunny: '/sprites/bunny.png',
  heart: '/sprites/heart.png',
  note: '/sprites/music-note.png',
} as const

const LOGO_SVG_URL = '/icons/donsprite-with-border.svg'

type TexKey = keyof typeof PNG_URLS | 'logo'

/** Keys out near-black pixels so pixel-art PNGs work on any page background. */
function chromaKeyedCanvasTexture(
  source: CanvasImageSource,
  sw: number,
  sh: number,
  threshold = 14,
): THREE.CanvasTexture {
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
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]!
    const g = d[i + 1]!
    const b = d[i + 2]!
    if (r <= threshold && g <= threshold && b <= threshold) {
      d[i + 3] = 0
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

async function loadKeyedPng(url: string, maxDim = 128): Promise<THREE.CanvasTexture> {
  const img = await loadImage(url)
  const w = img.naturalWidth || img.width
  const h = img.naturalHeight || img.height
  const scale = Math.min(1, maxDim / Math.max(w, h))
  const sw = Math.max(1, Math.round(w * scale))
  const sh = Math.max(1, Math.round(h * scale))
  return chromaKeyedCanvasTexture(img, sw, sh)
}

async function loadKeyedSvg(url: string, targetHeightPx = 128): Promise<THREE.CanvasTexture> {
  const img = await loadImage(url)
  const w = img.naturalWidth || img.width
  const h = img.naturalHeight || img.height
  const aspect = w / h
  const sh = targetHeightPx
  const sw = Math.max(1, Math.round(sh * aspect))
  return chromaKeyedCanvasTexture(img, sw, sh)
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

const LAYOUT: LayoutEntry[] = [
  { key: 'handheld', position: [-5.4, 2.2, -3.8], speed: 0.55, seed: 0.13, sizeMul: 1.35 },
  { key: 'bunny', position: [4.8, 1.4, -2.9], speed: 0.7, seed: 0.41, sizeMul: 1.2 },
  { key: 'heart', position: [-2.1, -2.8, -1.2], speed: 0.85, seed: 0.62, sizeMul: 1.1 },
  { key: 'note', position: [5.6, -1.9, -3.2], speed: 0.6, seed: 0.27, sizeMul: 1.25 },
  { key: 'logo', position: [-4.2, -1.1, 0.4], speed: 0.45, seed: 0.83, sizeMul: 1.3 },
  { key: 'handheld', position: [2.4, 3.1, -0.8], speed: 0.9, seed: 0.05, sizeMul: 1.05 },
  { key: 'bunny', position: [-6.0, -2.4, -2.0], speed: 0.5, seed: 0.91, sizeMul: 1.15 },
  { key: 'heart', position: [0.8, 2.6, -3.6], speed: 0.75, seed: 0.34, sizeMul: 1.0 },
  { key: 'note', position: [-3.5, 0.2, -2.4], speed: 0.65, seed: 0.58, sizeMul: 1.1 },
  { key: 'logo', position: [4.0, 0.8, -1.6], speed: 0.5, seed: 0.77, sizeMul: 1.2 },
  { key: 'bunny', position: [6.2, -3.0, -3.9], speed: 0.95, seed: 0.19, sizeMul: 1.3 },
  { key: 'heart', position: [-1.2, -3.4, 0.2], speed: 0.7, seed: 0.46, sizeMul: 1.05 },
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
}

function SpriteBillboard({
  map,
  initialPosition,
  speed,
  seed,
  sizeMul,
  reducedMotion,
}: {
  map: THREE.Texture
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
    const h = viewport.height * 0.14 * sizeMul
    const w = h * aspect
    return [w, h, 1] as const
  }, [viewport.height, sizeMul, aspect])

  const stateRef = useRef<SpriteKinematics>({
    px: initialPosition[0],
    py: initialPosition[1],
    pz: initialPosition[2],
    vx: 0,
    vy: 0,
    targetVx: 0,
    targetVy: 0,
    nextTurnIn: 0,
  })

  useEffect(() => {
    const angle = (seed * Math.PI * 2 + Math.random() * Math.PI * 2) % (Math.PI * 2)
    const vx = Math.cos(angle) * speed
    const vy = Math.sin(angle) * speed
    stateRef.current.px = initialPosition[0]
    stateRef.current.py = initialPosition[1]
    stateRef.current.pz = initialPosition[2]
    stateRef.current.vx = vx
    stateRef.current.vy = vy
    stateRef.current.targetVx = vx
    stateRef.current.targetVy = vy
    stateRef.current.nextTurnIn = 1.5 + Math.random() * 3.5
  }, [initialPosition, seed, speed])

  useFrame((_, dt) => {
    const spr = ref.current
    if (!spr) return
    const s = stateRef.current
    if (reducedMotion) {
      spr.position.set(initialPosition[0], initialPosition[1], initialPosition[2])
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

    const ease = 1 - Math.exp(-step * 0.9)
    s.vx += (s.targetVx - s.vx) * ease
    s.vy += (s.targetVy - s.vy) * ease

    s.px += s.vx * step
    s.py += s.vy * step

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
  const groupRef = useRef<THREE.Group>(null)
  const [maps, setMaps] = useState<Record<TexKey, THREE.CanvasTexture> | null>(null)

  useEffect(() => {
    let cancelled = false
    let loaded: THREE.CanvasTexture[] = []

    ;(async () => {
      try {
        const [handheld, bunny, heart, note, logo] = await Promise.all([
          loadKeyedPng(PNG_URLS.handheld),
          loadKeyedPng(PNG_URLS.bunny),
          loadKeyedPng(PNG_URLS.heart),
          loadKeyedPng(PNG_URLS.note),
          loadKeyedSvg(LOGO_SVG_URL, 128),
        ])
        if (cancelled) {
          ;[handheld, bunny, heart, note, logo].forEach((t) => t.dispose())
          return
        }
        loaded = [handheld, bunny, heart, note, logo]
        setMaps({
          handheld,
          bunny,
          heart,
          note,
          logo,
        })
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
    <group ref={groupRef}>
      {LAYOUT.map((entry, i) => (
        <SpriteBillboard
          key={`${entry.key}-${i}`}
          map={maps[entry.key]}
          initialPosition={entry.position}
          speed={entry.speed}
          seed={entry.seed}
          sizeMul={entry.sizeMul}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
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
