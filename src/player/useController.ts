import { useEffect, useRef } from 'react'

export interface InputState {
  forward: number
  right: number
  jumpPressed: boolean
  mouseDx: number
  mouseDy: number
  pointerLocked: boolean
  sprint: boolean
}

export function useController() {
  const ref = useRef<InputState>({
    forward: 0,
    right: 0,
    jumpPressed: false,
    mouseDx: 0,
    mouseDy: 0,
    pointerLocked: false,
    sprint: false,
  })

  useEffect(() => {
    const keys = new Set<string>()
    const recompute = () => {
      ref.current.forward = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0)
      ref.current.right = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0)
      ref.current.sprint = keys.has('ShiftLeft') || keys.has('ShiftRight')
    }
    const kd = (e: KeyboardEvent) => {
      keys.add(e.code)
      if (e.code === 'Space') ref.current.jumpPressed = true
      recompute()
    }
    const ku = (e: KeyboardEvent) => {
      keys.delete(e.code)
      recompute()
    }
    const move = (e: MouseEvent) => {
      if (!ref.current.pointerLocked) return
      ref.current.mouseDx += e.movementX
      ref.current.mouseDy += e.movementY
    }
    const lock = () => {
      ref.current.pointerLocked = document.pointerLockElement !== null
    }
    document.addEventListener('keydown', kd)
    document.addEventListener('keyup', ku)
    document.addEventListener('mousemove', move)
    document.addEventListener('pointerlockchange', lock)
    return () => {
      document.removeEventListener('keydown', kd)
      document.removeEventListener('keyup', ku)
      document.removeEventListener('mousemove', move)
      document.removeEventListener('pointerlockchange', lock)
    }
  }, [])

  return ref
}
