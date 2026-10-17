// Génère les icônes PWA (PNG valides) référencées par le manifest de vite.config.ts.
// Aucun module externe : rasterisation + encodage PNG faits à la main (zlib natif).
// Usage : node scripts/generate-pwa-icons.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

const BG = [5, 7, 10] // #05070a (theme_color)
const EMERALD_TOP = [52, 211, 153] // #34d399
const EMERALD_BOTTOM = [5, 150, 105] // #059669
const WHITE = [255, 255, 255]

// "V" Vaultis, coordonnées normalisées 0..1 (centré, dans la zone sûre maskable de 80 %)
const V_SHAPE = [
  [0.3, 0.31], [0.405, 0.31], [0.5, 0.585], [0.595, 0.31],
  [0.7, 0.31], [0.56, 0.69], [0.44, 0.69],
]

const pointInPolygon = (x, y, poly) => {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

const inRoundedRect = (x, y, min, max, r) => {
  if (x < min || x > max || y < min || y > max) return false
  const cx = Math.min(Math.max(x, min + r), max - r)
  const cy = Math.min(Math.max(y, min + r), max - r)
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r
}

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)

// Couleur d'un point (fond plein pour rester compatible "maskable")
const shade = (x, y) => {
  if (pointInPolygon(x, y, V_SHAPE)) return WHITE
  if (inRoundedRect(x, y, 0.12, 0.88, 0.2)) return mix(EMERALD_TOP, EMERALD_BOTTOM, (x + y) / 2)
  return BG
}

const render = (size, samples = 4) => {
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let py = 0; py < size; py++) {
    const row = py * (size * 4 + 1)
    raw[row] = 0 // filtre PNG : aucun
    for (let px = 0; px < size; px++) {
      const acc = [0, 0, 0]
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const c = shade((px + (sx + 0.5) / samples) / size, (py + (sy + 0.5) / samples) / size)
          acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2]
        }
      }
      const n = samples * samples
      const o = row + 1 + px * 4
      raw[o] = Math.round(acc[0] / n)
      raw[o + 1] = Math.round(acc[1] / n)
      raw[o + 2] = Math.round(acc[2] / n)
      raw[o + 3] = 255
    }
  }
  return raw
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

const encodePng = (size) => {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // profondeur 8 bits
  ihdr[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(render(size), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync(PUBLIC_DIR, { recursive: true })
for (const [name, size] of [
  ['pwa-192x192.png', 192],
  ['pwa-512x512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  writeFileSync(join(PUBLIC_DIR, name), encodePng(size))
  console.log(`✔ public/${name} (${size}x${size})`)
}
