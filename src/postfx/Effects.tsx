import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  BrightnessContrast,
  HueSaturation,
  ToneMapping,
  SMAA,
} from '@react-three/postprocessing'
import { KernelSize, ToneMappingMode } from 'postprocessing'
import { Vector2 } from 'three'
import { useMemo } from 'react'

export function Effects() {
  const caOffset = useMemo(() => new Vector2(0.0008, 0.0008), [])
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.18}
        luminanceThreshold={1.2}
        luminanceSmoothing={0.1}
        kernelSize={KernelSize.MEDIUM}
        mipmapBlur
      />
      <ChromaticAberration offset={caOffset} radialModulation={true} modulationOffset={0.45} />
      <HueSaturation hue={-0.02} saturation={-0.04} />
      <BrightnessContrast brightness={0.02} contrast={0.05} />
      <Vignette eskil={false} offset={0.3} darkness={0.45} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
    </EffectComposer>
  )
}
