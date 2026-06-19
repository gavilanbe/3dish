export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt))

function hash21(x: number, y: number) {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s)
}

export function smoothNoise2(x: number, y: number) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const u = fx * fx * (3 - 2 * fx)
  const v = fy * fy * (3 - 2 * fy)
  const a = hash21(ix, iy)
  const b = hash21(ix + 1, iy)
  const c = hash21(ix, iy + 1)
  const d = hash21(ix + 1, iy + 1)
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v
}

export function fbm2(x: number, y: number, octaves = 5) {
  let sum = 0
  let amp = 0.5
  let freq = 1
  for (let i = 0; i < octaves; i++) {
    sum += amp * smoothNoise2(x * freq, y * freq)
    amp *= 0.5
    freq *= 2
  }
  return sum
}
