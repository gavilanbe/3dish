import { useMemo } from 'react'
import { HeightfieldCollider, RigidBody } from '@react-three/rapier'
import {
  BufferAttribute,
  Color,
  MeshStandardMaterial,
  PlaneGeometry,
  Vector3,
} from 'three'
import { fbm2, smoothNoise2 } from '../lib/math'
import { PALETTE } from '../state/palette'

export const TERRAIN_SIZE = 240
const SEGMENTS = 140 // 140 cells per side → 141 grid points per side

// shared analytic terrain — used by mesh generation, player ground check,
// and heightfield collider construction. Must be deterministic.
export function terrainHeight(x: number, z: number): number {
  const r = Math.sqrt(x * x + z * z)
  const island = Math.exp(-(r * r) / (95 * 95)) * 34 - 6
  const ridge = fbm2(x * 0.022 + 11, z * 0.022 + 7, 5) * 14
  const detail = fbm2(x * 0.07, z * 0.07, 3) * 2.2
  const cliff = Math.max(0, x) * 0.06 * smoothNoise2(x * 0.012 - 3, z * 0.012 + 2)
  return island + ridge * 0.7 + detail - 4 + cliff
}

export function Terrain() {
  const { geometry, material, heights, hfScale } = useMemo(() => {
    const geo = new PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, SEGMENTS, SEGMENTS)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position as BufferAttribute
    const colorAttr = new Float32Array(pos.count * 3)
    const cRock = new Color(PALETTE.rock)
    const cGrass = new Color(PALETTE.grass)
    const cSand = new Color(PALETTE.sand)
    const cCream = new Color(PALETTE.cream)
    const tmp = new Color()

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const y = terrainHeight(x, z)
      pos.setY(i, y)

      let c: Color
      if (y < 0.2) {
        c = cSand
      } else if (y < 5) {
        tmp.copy(cSand).lerp(cGrass, (y - 0.2) / 4.8)
        c = tmp
      } else if (y < 16) {
        tmp.copy(cGrass).lerp(cRock, (y - 5) / 11)
        c = tmp
      } else {
        tmp.copy(cRock).lerp(cCream, Math.min(1, (y - 16) / 14))
        c = tmp
      }
      colorAttr[i * 3 + 0] = c.r
      colorAttr[i * 3 + 1] = c.g
      colorAttr[i * 3 + 2] = c.b
    }

    geo.setAttribute('color', new BufferAttribute(colorAttr, 3))
    geo.computeVertexNormals()
    geo.computeBoundingBox()
    geo.computeBoundingSphere()

    const mat = new MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.95,
      metalness: 0.0,
      flatShading: true,
    })

    // Rapier heightfield grid:
    //   - nrows × ncols cells, so (nrows+1) × (ncols+1) height samples
    //   - heights stored COLUMN-MAJOR: heights[col * (nrows+1) + row]
    //   - extents are scale.x in X and scale.z in Z, centered at body origin
    //   - heights are multiplied by scale.y
    const nrows = SEGMENTS
    const ncols = SEGMENTS
    const sx = nrows + 1
    const sz = ncols + 1
    const half = TERRAIN_SIZE / 2
    const heights = new Float32Array(sx * sz)
    for (let r = 0; r < sx; r++) {
      // rapier's heightfield maps row → x, col → z
      const x = -half + (r / nrows) * TERRAIN_SIZE
      for (let c = 0; c < sz; c++) {
        const z = -half + (c / ncols) * TERRAIN_SIZE
        heights[c * sx + r] = terrainHeight(x, z)
      }
    }
    const scale = new Vector3(TERRAIN_SIZE, 1, TERRAIN_SIZE)

    return { geometry: geo, material: mat, heights, hfScale: scale }
  }, [])

  return (
    <RigidBody type="fixed" colliders={false}>
      <mesh geometry={geometry} material={material} receiveShadow castShadow />
      <HeightfieldCollider args={[SEGMENTS, SEGMENTS, heights, hfScale]} />
    </RigidBody>
  )
}
