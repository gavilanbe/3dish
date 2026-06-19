import { useFrame, useThree } from '@react-three/fiber'
import type { RefObject, MutableRefObject } from 'react'
import { Vector3 } from 'three'
import type { RapierRigidBody } from '@react-three/rapier'

const DISTANCE = 7
const HEIGHT_OFFSET = 1.8

const tmpTarget = new Vector3()
const tmpDesired = new Vector3()

export function CameraRig({
  bodyRef,
  yawRef,
  pitchRef,
}: {
  bodyRef: RefObject<RapierRigidBody | null>
  yawRef: MutableRefObject<number>
  pitchRef: MutableRefObject<number>
}) {
  const { camera } = useThree()

  useFrame((_, dt) => {
    if (!bodyRef.current) return
    const p = bodyRef.current.translation()
    const yaw = yawRef.current
    const pitch = pitchRef.current

    tmpTarget.set(p.x, p.y + HEIGHT_OFFSET, p.z)

    const horiz = Math.cos(pitch) * DISTANCE
    const vert = Math.sin(pitch) * DISTANCE
    tmpDesired.set(
      p.x + Math.sin(yaw) * horiz,
      p.y + HEIGHT_OFFSET + vert,
      p.z + Math.cos(yaw) * horiz,
    )

    const k = 1 - Math.exp(-12 * dt)
    camera.position.lerp(tmpDesired, k)
    camera.lookAt(tmpTarget)
  })

  return null
}
