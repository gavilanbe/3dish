import { Canvas, useThree } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Suspense, useEffect } from 'react'
import { NoToneMapping, SRGBColorSpace } from 'three'
import { World } from './scene/World'
import { Player } from './player/Player'
import { Effects } from './postfx/Effects'
import { useGame } from './state/game'

function DebugExpose() {
  const state = useThree()
  useEffect(() => {
    ;(window as any).__three = state
  }, [state])
  return null
}

function StartOverlay() {
  const phase = useGame((s) => s.phase)
  const setPhase = useGame((s) => s.setPhase)
  if (phase !== 'menu') return null
  const start = () => {
    setPhase('play')
    // pointer lock needs a user gesture — this click qualifies
    document.body.requestPointerLock()
  }
  return (
    <div className="start-overlay">
      <h1>TIDEBORNE</h1>
      <p>An ocean. A faint light. Walk toward it.</p>
      <button onClick={start}>Begin</button>
    </div>
  )
}

function Hud() {
  const phase = useGame((s) => s.phase)
  const fragments = useGame((s) => s.fragments)
  if (phase !== 'play') return null
  return (
    <>
      <div className="hud">
        <div className="crosshair" />
        <div className="fragments">{fragments} / 30 fragments</div>
      </div>
      <div className="controls-hint">WASD · Shift · Space · Mouse</div>
    </>
  )
}

function App() {
  // re-engage pointer lock on click during play (browser drops lock on Esc)
  useEffect(() => {
    const onClick = () => {
      if (useGame.getState().phase === 'play' && !document.pointerLockElement) {
        document.body.requestPointerLock()
      }
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [])

  return (
    <>
      <Canvas
        shadows
        camera={{ fov: 62, near: 0.1, far: 1200, position: [0, 12, 16] }}
        gl={{
          antialias: false,
          toneMapping: NoToneMapping,
          outputColorSpace: SRGBColorSpace,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <DebugExpose />
          <Physics gravity={[0, -24, 0]} timeStep="vary">
            <World />
            <Player />
          </Physics>
          <Effects />
        </Suspense>
      </Canvas>
      <Hud />
      <StartOverlay />
    </>
  )
}

export default App
