import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Color, ShaderMaterial, Vector3 } from 'three'
import { waterVert, waterFrag } from '../shaders/water'
import { PALETTE } from '../state/palette'

// Smaller, denser water plane. Beyond ~150m water dissolves into fog/sky.
const SIZE = 400
const SEGMENTS = 200

export function Water({ sunDir }: { sunDir: Vector3 }) {
  const matRef = useRef<ShaderMaterial>(null)
  const { camera } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSunDir: { value: sunDir.clone() },
      uSunColor: { value: new Color(PALETTE.sun) },
      uSkyHigh: { value: new Color(PALETTE.skyHigh) },
      uSkyDawn: { value: new Color(PALETTE.skyDawn) },
      uSkyDeep: { value: new Color(PALETTE.skyDeep) },
      uDeepColor: { value: new Color(PALETTE.waterDeep) },
      uShallowColor: { value: new Color(PALETTE.waterShallow) },
      uFoamColor: { value: new Color(PALETTE.foam) },
      uCameraPos: { value: new Vector3() },
      uFogColor: { value: new Color(PALETTE.fogTint) },
      uFogNear: { value: 45 },
      uFogFar: { value: 160 },
    }),
    [sunDir],
  )

  useFrame((_, dt) => {
    if (!matRef.current) return
    const u = matRef.current.uniforms
    ;(u.uTime as { value: number }).value += dt
    ;(u.uCameraPos as { value: Vector3 }).value.copy(camera.position)
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} frustumCulled={false}>
      <planeGeometry args={[SIZE, SIZE, SEGMENTS, SEGMENTS]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={waterVert}
        fragmentShader={waterFrag}
        uniforms={uniforms}
      />
    </mesh>
  )
}
