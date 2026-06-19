import { Color } from 'three'

export const PALETTE = {
  skyHigh: '#b8c5d6',
  skyDawn: '#f4b8c4',
  skyDeep: '#2d4059',
  cream: '#f5e6d3',
  waterDeep: '#1a3a52',
  waterShallow: '#5d9bb6',
  foam: '#f5e6d3',
  rock: '#5a5663',
  grass: '#6d7d5b',
  sand: '#d4b896',
  sun: '#ffd4a3',
  fogTint: '#d4c4d0',
} as const

export const COLORS = Object.fromEntries(
  Object.entries(PALETTE).map(([k, v]) => [k, new Color(v)]),
) as Record<keyof typeof PALETTE, Color>
