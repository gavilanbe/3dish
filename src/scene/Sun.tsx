import type { Vector3 } from 'three'
import { PALETTE } from '../state/palette'

export function Sun({ direction, intensity = 4.5 }: { direction: Vector3; intensity?: number }) {
  const px = direction.x * 140
  const py = direction.y * 140
  const pz = direction.z * 140
  return (
    <>
      <directionalLight
        position={[px, py, pz]}
        color={PALETTE.sun}
        intensity={intensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-110}
        shadow-camera-right={110}
        shadow-camera-top={110}
        shadow-camera-bottom={-110}
        shadow-camera-near={0.1}
        shadow-camera-far={500}
        shadow-bias={-0.0003}
        shadow-normalBias={0.04}
      />
      {/* sky fill */}
      <hemisphereLight color={PALETTE.skyDawn} groundColor={PALETTE.skyDeep} intensity={0.55} />
      {/* tiny ambient lift so darks stay readable */}
      <ambientLight intensity={0.12} color={PALETTE.skyHigh} />
      {/* rim light from opposite side for sculpting silhouettes */}
      <directionalLight
        position={[-px * 0.5, py * 0.6, -pz * 0.5]}
        color={PALETTE.skyDawn}
        intensity={0.8}
      />
    </>
  )
}
