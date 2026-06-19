import { noiseGLSL } from './common'

export const skyVert = /* glsl */ `
  varying vec3 vWorldDir;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldDir = normalize(worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

export const skyFrag = /* glsl */ `
  precision highp float;
  uniform vec3 uSunDir;
  uniform vec3 uSkyHigh;
  uniform vec3 uSkyDawn;
  uniform vec3 uSkyDeep;
  uniform vec3 uSunColor;
  uniform float uSunIntensity;
  uniform float uTime;
  varying vec3 vWorldDir;

  ${noiseGLSL}

  // streaky high-cirrus cloud rendered as long horizontal smears.
  // Far less artifact-prone than the old FBM blobs.
  float cirrus(vec3 d, float t) {
    // stretch the uv along x → long thin streaks rather than blobs
    vec2 uv = vec2(d.x, d.z) / max(d.y, 0.05);
    uv.x *= 0.15;
    uv.y *= 0.6;
    uv += vec2(t * 0.005, t * 0.001);
    float n = fbm(uv * 1.4);
    // thin band of cloud
    return smoothstep(0.55, 0.78, n);
  }

  void main() {
    vec3 d = normalize(vWorldDir);
    float y = clamp(d.y, -0.05, 1.0);

    // azimuth alignment to sun
    vec3 horizonDir = normalize(vec3(d.x, 0.0, d.z));
    vec3 sunHorizon = normalize(vec3(uSunDir.x, 0.0, uSunDir.z));
    float sunSide = clamp(dot(horizonDir, sunHorizon), 0.0, 1.0);

    // vertical gradient: zenith (skyHigh) → near-horizon (skyDawn)
    float horizonT = pow(1.0 - y, 2.4);
    vec3 col = mix(uSkyHigh, uSkyDawn, horizonT);

    // away-from-sun zenith → deep navy for depth
    col = mix(col, uSkyDeep, (1.0 - sunSide) * pow(1.0 - y, 3.0) * 0.55);

    // dawn band on horizon, biased toward sun side
    float band = exp(-pow((y - 0.01) * 7.0, 2.0)) * (0.2 + 0.8 * sunSide);
    col += uSkyDawn * band * 0.65;
    // extra warm tint at horizon in sun direction
    col += uSunColor * band * sunSide * 0.25;

    // soft golden halo around the actual sun direction
    float sunDotAtm = dot(d, uSunDir);
    float scatter = pow(max(sunDotAtm, 0.0), 18.0) * 0.3;
    col += uSunColor * scatter;

    // sun disc — bright concentrated point that bloom will flare around
    float sunDot = dot(d, uSunDir);
    // tight bright core (~1.2° radius) — very high HDR for bloom
    float sunCore = smoothstep(0.9992, 0.9998, sunDot);
    // mid halo (~3°)
    float sunHalo = pow(max(sunDot, 0.0), 110.0);
    // soft outer warm glow (~10°)
    float sunGlowSoft = pow(max(sunDot, 0.0), 18.0) * 0.5;
    vec3 sunHot = vec3(1.0, 0.95, 0.85);
    col += sunHot * sunCore * 12.0 * uSunIntensity;
    col += uSunColor * (sunHalo * 1.6 + sunGlowSoft) * uSunIntensity;

    // CIRRUS DISABLED for debug — uncomment when noise pattern is dialed in
    // float cl = cirrus(d, uTime) * smoothstep(0.05, 0.35, d.y);
    // vec3 cloudCol = mix(uSkyHigh, uSunColor, pow(sunSide, 1.5) * 0.7);
    // cloudCol = mix(cloudCol, vec3(1.0), 0.4);
    // col = mix(col, cloudCol, cl * 0.45);

    // dither to kill banding
    col += (hash21(gl_FragCoord.xy) - 0.5) * 0.005;

    gl_FragColor = vec4(col, 1.0);
  }
`
