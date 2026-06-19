import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CapsuleCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { Group, Vector3 } from 'three'
import { useController } from './useController'
import { CameraRig } from './CameraRig'
import { terrainHeight } from '../scene/Terrain'

const SPEED_WALK = 4.5
const SPEED_RUN = 8.5
const JUMP_V = 9.5
const TURN_LERP = 14

const tmpDir = new Vector3()
const tmpFwd = new Vector3()
const tmpRight = new Vector3()

export function Player() {
  const body = useRef<RapierRigidBody>(null!)
  const visual = useRef<Group>(null!)
  const controller = useController()
  const yaw = useRef(Math.PI) // start looking south (camera will be north-of-player)
  const pitch = useRef(0.05) // close to horizontal so we look across the water at the sun
  const grounded = useRef(false)

  // spawn JUST above terrain so gravity settles us cleanly onto the surface
  const spawnY = Math.max(0, terrainHeight(0, 0)) + 1.2
  const spawn: [number, number, number] = [0, spawnY, 0]
  const RESPAWN_BELOW = -8

  useFrame((_, dtRaw) => {
    if (!body.current) return
    const dt = Math.min(dtRaw, 1 / 30)
    const c = controller.current

    if (c.pointerLocked) {
      yaw.current -= c.mouseDx * 0.0025
      pitch.current -= c.mouseDy * 0.0022
      pitch.current = Math.max(-1.0, Math.min(1.1, pitch.current))
    }
    c.mouseDx = 0
    c.mouseDy = 0

    // movement axes in camera-yaw space
    tmpFwd.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current))
    tmpRight.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current))
    tmpDir
      .set(0, 0, 0)
      .addScaledVector(tmpFwd, c.forward)
      .addScaledVector(tmpRight, c.right)
    const inputMag = tmpDir.length()
    if (inputMag > 1) tmpDir.divideScalar(inputMag)

    const speed = c.sprint ? SPEED_RUN : SPEED_WALK
    const v = body.current.linvel()
    const p = body.current.translation()

    // safety: if we fell below the world, teleport back to spawn
    if (p.y < RESPAWN_BELOW) {
      body.current.setTranslation({ x: spawn[0], y: spawn[1], z: spawn[2] }, true)
      body.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      return
    }

    // analytic ground check (player only walks on terrain, no other collidables)
    const groundY = Math.max(0, terrainHeight(p.x, p.z))
    grounded.current = p.y - groundY < 1.35

    const targetVX = tmpDir.x * speed
    const targetVZ = tmpDir.z * speed
    body.current.setLinvel(
      { x: targetVX, y: v.y, z: targetVZ },
      true,
    )

    if (c.jumpPressed && grounded.current) {
      body.current.setLinvel({ x: targetVX, y: JUMP_V, z: targetVZ }, true)
    }
    c.jumpPressed = false

    // face movement direction
    if (visual.current) {
      const moving = tmpDir.lengthSq() > 0.01
      if (moving) {
        const targetYaw = Math.atan2(tmpDir.x, tmpDir.z)
        const cur = visual.current.rotation.y
        let delta = targetYaw - cur
        while (delta > Math.PI) delta -= Math.PI * 2
        while (delta < -Math.PI) delta += Math.PI * 2
        visual.current.rotation.y = cur + delta * Math.min(1, TURN_LERP * dt)
      }
    }
  })

  return (
    <>
      <RigidBody
        ref={body}
        type="dynamic"
        colliders={false}
        position={spawn}
        lockRotations
        canSleep={false}
        linearDamping={0.4}
      >
        <CapsuleCollider args={[0.55, 0.45]} />
        <group ref={visual}>
          {/* robed body — tapered cylinder, wider at bottom */}
          <mesh position={[0, -0.1, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.58, 1.5, 18, 1]} />
            <meshStandardMaterial color="#3a4a6b" roughness={0.92} />
          </mesh>
          {/* head — small sphere */}
          <mesh position={[0, 0.78, 0]} castShadow>
            <sphereGeometry args={[0.2, 16, 12]} />
            <meshStandardMaterial color="#2a2230" roughness={0.9} />
          </mesh>
          {/* hood — dome over the head, deep and oversized */}
          <mesh position={[0, 0.78, -0.03]} castShadow>
            <sphereGeometry args={[0.32, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
            <meshStandardMaterial color="#28324a" roughness={0.95} side={2} />
          </mesh>
          {/* sash — warm pink accent */}
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.49, 0.5, 0.11, 18]} />
            <meshStandardMaterial color="#b85a6a" roughness={0.8} />
          </mesh>
        </group>
      </RigidBody>
      <CameraRig bodyRef={body} yawRef={yaw} pitchRef={pitch} />
    </>
  )
}
