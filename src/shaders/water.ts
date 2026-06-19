import { noiseGLSL } from './common'

export const waterVert = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCameraPos;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vWaveHeight;
  varying float vDistToCam;

  vec3 gerstner(
    vec2 dir, float steepness, float wavelength, float speed,
    float t, float distFalloff,
    inout vec3 tangent, inout vec3 binormal, vec3 p
  ) {
    float k = 6.2831853 / wavelength;
    float c = sqrt(9.8 / k);
    vec2 dn = normalize(dir);
    float f = k * (dot(dn, p.xz) - c * speed * t);
    float a = (steepness / k) * distFalloff;
    tangent += vec3(
      -dn.x * dn.x * (steepness * sin(f) * distFalloff),
       dn.x * (steepness * cos(f) * distFalloff),
      -dn.x * dn.y * (steepness * sin(f) * distFalloff)
    );
    binormal += vec3(
      -dn.x * dn.y * (steepness * sin(f) * distFalloff),
       dn.y * (steepness * cos(f) * distFalloff),
      -dn.y * dn.y * (steepness * sin(f) * distFalloff)
    );
    return vec3(
      dn.x * (a * cos(f)),
      a * sin(f),
      dn.y * (a * cos(f))
    );
  }

  void main() {
    vec3 p = position;
    float distXZ = length(vec3(position.x - uCameraPos.x, 0.0, position.z - uCameraPos.z));

    // STRONG distance attenuation — everything fades to flat by 120m
    float fadeBig    = 1.0 - smoothstep( 60.0, 140.0, distXZ);
    float fadeMid    = 1.0 - smoothstep( 30.0,  90.0, distXZ);
    float fadeSmall  = 1.0 - smoothstep( 12.0,  45.0, distXZ);

    vec3 T = vec3(1.0, 0.0, 0.0);
    vec3 B = vec3(0.0, 0.0, 1.0);
    p += gerstner(vec2( 1.0,  0.55), 0.14, 22.0, 0.55, uTime, fadeBig,   T, B, position);
    p += gerstner(vec2(-0.7,  1.0 ), 0.10, 14.0, 0.75, uTime, fadeMid,   T, B, position);
    p += gerstner(vec2( 0.45,-0.85), 0.06,  8.0, 1.00, uTime, fadeSmall, T, B, position);

    vec3 N = normalize(cross(B, T));
    vNormal = N;
    vWaveHeight = p.y - position.y;
    vec4 worldPos = modelMatrix * vec4(p, 1.0);
    vWorldPos = worldPos.xyz;
    vDistToCam = distance(uCameraPos, worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

export const waterFrag = /* glsl */ `
  precision highp float;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform vec3 uSkyHigh;
  uniform vec3 uSkyDawn;
  uniform vec3 uSkyDeep;
  uniform vec3 uDeepColor;
  uniform vec3 uShallowColor;
  uniform vec3 uFoamColor;
  uniform vec3 uCameraPos;
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uTime;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vWaveHeight;
  varying float vDistToCam;

  ${noiseGLSL}

  void main() {
    vec3 viewDir = normalize(uCameraPos - vWorldPos);

    // detail fades much more aggressively — kills sparkle aliasing at distance
    float detailFade = 1.0 - smoothstep(25.0, 90.0, vDistToCam);

    // small-scale normal perturbation, only near
    vec2 nuv = vWorldPos.xz * 0.18 + vec2(uTime * 0.04, uTime * 0.03);
    float n1 = fbm(nuv);
    float n2 = fbm(nuv * 2.3 + 9.0);
    vec3 detail = normalize(vec3((n1 - n2) * 0.45, 1.0, (n2 - n1) * 0.45));
    vec3 N = normalize(mix(vec3(0.0, 1.0, 0.0), mix(vNormal, detail, 0.55), 1.0));
    // blend toward flat normal at distance
    N = normalize(mix(vec3(0.0, 1.0, 0.0), N, detailFade * 0.6 + 0.4));

    float NdotV = clamp(dot(N, viewDir), 0.0, 1.0);
    float fresnel = 0.02 + 0.98 * pow(1.0 - NdotV, 5.0);

    // base water color
    float depthT = smoothstep(-0.5, 0.5, vWaveHeight);
    vec3 water = mix(uDeepColor, uShallowColor, depthT * 0.75);

    // sun-track on water: focused gold corridor pointing AT the sun
    vec3 sunHor = normalize(vec3(uSunDir.x, 0.0, uSunDir.z));
    vec3 toCamHor = normalize(vec3(viewDir.x, 0.0, viewDir.z));
    float trackAlign = max(0.0, -dot(toCamHor, sunHor));
    // medium-width corridor with soft falloff
    float track = pow(trackAlign, 2.0);
    // visible from 4m to 90m, peaks around 25-40m
    float trackDistFade = (1.0 - smoothstep(20.0, 90.0, vDistToCam))
                        * smoothstep(2.0, 12.0, vDistToCam);

    vec3 col = water;

    // sky reflection from a SOFT approximation — never sharp enough to artifact
    // at horizon. Use a 2-color gradient by reflection y.
    vec3 reflDir = reflect(-viewDir, N);
    float ry = clamp(abs(reflDir.y), 0.0, 1.0);
    vec3 sky = mix(uSkyDawn, uSkyHigh, ry);
    col = mix(col, sky, fresnel * 0.7);

    // golden sun reflection — soft, only contributes within the corridor and near
    col += uSunColor * track * trackDistFade * 1.6;

    // tiny sun spec — only on near surfaces where normals are crisp
    float spec = pow(max(dot(reflect(-viewDir, N), uSunDir), 0.0), 200.0);
    col += uSunColor * spec * 4.0 * detailFade;

    // sparkle highlights — near only
    float sparkleNoise = fbm(vWorldPos.xz * 3.5 + uTime * 0.5);
    float sparkle = pow(sparkleNoise, 10.0) * trackAlign * detailFade;
    col += uSunColor * sparkle * 0.7;

    // crest foam — wave peaks only, near
    float crest = smoothstep(0.45, 0.85, vWaveHeight)
                * detailFade;
    col = mix(col, uFoamColor, crest * 0.35);

    // VERY aggressive fog blend so distant water dissolves into the sky color
    float fogT = smoothstep(uFogNear, uFogFar, vDistToCam);
    // smooth the curve so the transition isn't a hard line
    fogT = fogT * fogT * (3.0 - 2.0 * fogT);
    col = mix(col, uFogColor, fogT);

    gl_FragColor = vec4(col, 1.0);
  }
`
