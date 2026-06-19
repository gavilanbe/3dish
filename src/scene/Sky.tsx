import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide, Color, ShaderMaterial, Vector3 } from 'three'
import { skyVert, skyFrag } from '../shaders/sky'
import { PALETTE } from '../state/palette'

export function Sky({ sunDir }: { sunDir: Vector3 }) {
  const matRef = useRef<ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSunDir: { value: sunDir.clone() },
      uSkyHigh: { value: new Color(PALETTE.skyHigh) },
      uSkyDawn: { value: new Color(PALETTE.skyDawn) },
      uSkyDeep: { value: new Color(PALETTE.skyDeep) },
      uSunColor: { value: new Color(PALETTE.sun) },
      uSunIntensity: { value: 1.0 },
    }),
    [sunDir],
  )

  useFrame((_, dt) => {
    if (matRef.current) {
      ;(matRef.current.uniforms.uTime as { value: number }).value += dt
    }
  })

  return (
    <mesh renderOrder={-1000} frustumCulled={false}>
      <sphereGeometry args={[450, 64, 32]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={skyVert}
        fragmentShader={skyFrag}
        uniforms={uniforms}
        side={BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}
