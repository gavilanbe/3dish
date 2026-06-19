import { useMemo } from 'react'
import { Vector3 } from 'three'
import { Sky } from './Sky'
import { Sun } from './Sun'
import { Terrain, terrainHeight } from './Terrain'
import { Water } from './Water'
import { Lighthouse } from './Lighthouse'
import { PALETTE } from '../state/palette'

// Dawn sun directly in front of the player (player faces +Z on spawn).
// Low elevation so the player looks AT the sun across the water.
export const SUN_AZIMUTH = Math.PI * 0.02
export const SUN_ELEVATION = Math.PI * 0.06

export function makeSunDir() {
  const el = SUN_ELEVATION
  const az = SUN_AZIMUTH
  return new Vector3(
    Math.cos(el) * Math.sin(az),
    Math.sin(el),
    Math.cos(el) * Math.cos(az),
  ).normalize()
}

export function World() {
  const sunDir = useMemo(() => makeSunDir(), [])

  // place lighthouse on a promontory
  const lhX = 28
  const lhZ = -22
  const lhY = Math.max(0, terrainHeight(lhX, lhZ))

  return (
    <>
      <Sun direction={sunDir} />
      <Sky sunDir={sunDir} />
      <Terrain />
      <Water sunDir={sunDir} />
      <Lighthouse position={[lhX, lhY, lhZ]} />
      <fog attach="fog" args={[PALETTE.fogTint, 45, 220]} />
    </>
  )
}
