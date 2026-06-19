import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { RigidBody } from '@react-three/rapier'

export function Lighthouse({
  position = [0, 0, 0],
}: {
  position?: [number, number, number]
}) {
  const beam = useRef<Group>(null)
  useFrame((_, dt) => {
    if (beam.current) beam.current.rotation.y += dt * 0.45
  })

  const H = 18

  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      <group>
        {/* base */}
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[3.4, 3.8, 2, 18]} />
          <meshStandardMaterial color="#3a3a4a" roughness={0.95} flatShading />
        </mesh>
        {/* shaft */}
        <mesh position={[0, H / 2 + 1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.5, 2.2, H, 24]} />
          <meshStandardMaterial color="#e8dfd2" roughness={0.7} flatShading />
        </mesh>
        {/* red band */}
        <mesh position={[0, H * 0.62 + 1, 0]} castShadow>
          <cylinderGeometry args={[1.85, 1.85, 2, 24]} />
          <meshStandardMaterial color="#a64b4b" roughness={0.7} flatShading />
        </mesh>
        {/* lamp room — dark cage */}
        <mesh position={[0, H + 1.7, 0]} castShadow>
          <cylinderGeometry args={[1.6, 1.6, 1.3, 16]} />
          <meshStandardMaterial color="#2d2d3a" roughness={0.85} flatShading />
        </mesh>
        {/* glowing core */}
        <mesh position={[0, H + 1.7, 0]}>
          <sphereGeometry args={[0.9, 16, 12]} />
          <meshBasicMaterial color="#ffe2a8" />
        </mesh>
        <pointLight
          position={[0, H + 1.7, 0]}
          color="#ffe2a8"
          intensity={6}
          distance={60}
          decay={2}
        />
        {/* roof */}
        <mesh position={[0, H + 3.0, 0]} castShadow>
          <coneGeometry args={[1.75, 1.4, 16]} />
          <meshStandardMaterial color="#3a3a4a" roughness={0.9} flatShading />
        </mesh>
        {/* sweeping beam group */}
        <group ref={beam} position={[0, H + 1.7, 0]}>
          <spotLight
            position={[0, 0, 0]}
            target-position={[80, -6, 0]}
            angle={0.14}
            penumbra={0.55}
            intensity={2200}
            distance={300}
            color="#ffe2a8"
          />
        </group>
      </group>
    </RigidBody>
  )
}
