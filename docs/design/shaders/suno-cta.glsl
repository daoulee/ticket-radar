/*
 * 티켓레이더 주요 버튼 질감 (Suno iOS Create/Continue/Confirm 버튼 관찰 기반)
 * 구성: 분홍 바탕 + 한쪽 끝의 큰 따뜻한 덩어리(빨간주황→주황→노랑) + 가운데 쪽 작은 보조 덩어리.
 * 노이즈는 덩어리 경계를 안개처럼 울퉁불퉁하게 만드는 데만 쓰고, 입자(grain)는 따뜻한 영역에서만 보인다.
 * u_seed 를 바꾸면 덩어리가 놓이는 쪽(왼/오른)과 높이가 달라져 버튼마다 모양이 조금씩 다르다.
 * 참고 캡처: docs/reference/suno/zoom/cta-*.png
 */

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

/** @resolution */
uniform vec2 u_resolution;

/**
 * @label Seed
 * @default 0.0
 * @range 0, 10
 */
uniform float u_seed;

/**
 * @label Pink
 * @color
 * @default #FF2F74
 */
uniform vec3 u_pink;

/**
 * @label Red Orange
 * @color
 * @default #FF5A2E
 */
uniform vec3 u_red;

/**
 * @label Orange
 * @color
 * @default #FF8A2B
 */
uniform vec3 u_orange;

/**
 * @label Yellow
 * @color
 * @default #FFB42E
 */
uniform vec3 u_yellow;

/**
 * @label Grain
 * @default 0.045
 * @range 0, 0.5
 */
uniform float u_grain;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  float aspect = u_resolution.x / u_resolution.y;
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 a = vec2(uv.x * aspect, uv.y);

  float sA = fract(u_seed * 0.618 + 0.11);
  float sB = fract(u_seed * 0.371 + 0.53);
  float side = step(0.5, sB);
  vec2 cA = vec2(mix(0.12, 0.88, side) * aspect, mix(0.15, 0.85, sA));
  vec2 cB = vec2(mix(0.62, 0.38, side) * aspect, mix(0.9, 0.1, sA));

  vec2 p = a * 1.1 + vec2(fract(u_seed * 0.29) * 4.0, fract(u_seed * 0.17) * 4.0);
  vec2 q = vec2(fbm(p), fbm(p + vec2(5.2, 1.3)));
  float nz = fbm(p + 1.2 * q) - 0.5;

  float dA = distance(a, cA) / aspect;
  float dB = distance(a, cB) / aspect;
  float blobA = 1.0 - smoothstep(0.0, 0.40, dA + nz * 0.30);
  float blobB = 1.0 - smoothstep(0.0, 0.20, dB + nz * 0.24);
  float heat = clamp(blobA + 0.5 * blobB, 0.0, 1.0);

  vec3 pinkRed = mix(u_pink, u_red, 0.45);
  vec3 col = u_pink;
  col = mix(col, pinkRed, smoothstep(0.18, 0.46, heat));
  col = mix(col, u_red, smoothstep(0.36, 0.68, heat));
  col = mix(col, u_orange, smoothstep(0.64, 0.90, heat));
  col = mix(col, u_yellow, smoothstep(0.88, 1.0, heat));

  float tone = noise(p * 0.8 + 3.1);
  col *= 0.96 + 0.08 * tone;

  float warm = smoothstep(0.55, 1.0, heat);
  float px = u_resolution.y / 50.0;
  vec2 cell = floor(gl_FragCoord.xy / (1.4 * px));
  float g = hash(cell + fract(u_seed * 0.77) * 10.0) - 0.5;
  col *= 1.0 + g * u_grain * (0.1 + 1.1 * warm);

  gl_FragColor = vec4(col, 1.0);
}
