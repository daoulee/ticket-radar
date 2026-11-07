/*
 * 화면 배경 물결 번짐 (다크·라이트 공통, 색은 pen 변수 tr-glow-warm / tr-glow-plum / tr-glow-strength로 모드별 전환).
 * 한 점에 동그란 번짐 하나가 아니라, 화면 전체에 휘어진 띠(물결)가 겹겹이 퍼지는 모양이다.
 * 카드의 background_blur가 이 물결을 흐리게 비추면서 유리 느낌을 낸다.
 * fill 배열에서 tr-bg 단색 위에 두 번째 fill로 쓴다. 출력은 미리 곱한 알파(premultiplied).
 * 값은 Suno 원본에서 측정한 것이 아니라 새 제안값이다 (docs/design-tokens.md 참고).
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
 * @label Warm
 * @color
 * @default #FF4D5E
 */
uniform vec3 u_warm;

/**
 * @label Plum
 * @color
 * @default #7A3B8F
 */
uniform vec3 u_plum;

/**
 * @label Strength
 * @default 0.5
 * @range 0, 1
 */
uniform float u_strength;

float hash(vec2 p) {
  // 작은 상수만 쓴다: 내보내기 렌더러가 소수 정밀도가 낮은(mediump) 경우에도 값이 깨지지 않도록.
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43.7585);
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
  // 좌표 크기를 작게 유지한다(옥타브마다 큰 값을 더하지 않음). 큰 좌표는 낮은 정밀도에서 계단처럼 끊긴다.
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.0 + vec2(0.37, 0.61);
    a *= 0.5;
  }
  return v;
}

void main() {
  float aspect = u_resolution.x / u_resolution.y;
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = vec2(uv.x * aspect, uv.y) * 1.6 + vec2(fract(u_seed * 0.29), fract(u_seed * 0.17));

  // 좌표를 노이즈로 휘어 준 뒤(도메인 워핑) 노이즈 덩어리의 밝기를 따라 넓은 띠가 번지게 한다.
  vec2 q = vec2(fbm(p), fbm(p + vec2(1.7, 0.9)));
  vec2 w = p + 1.0 * q;
  float field = fbm(w);                                // 0~1, 큰 덩어리의 밝기
  float band = 0.5 + 0.5 * sin((field * 3.5 + w.y * 1.2 + w.x * 0.5) * 3.14159);
  band = band * band;                                  // 밝은 띠는 좁고 골은 넓게, 가장자리는 부드럽게

  // 위쪽이 조금 진하고 아래로 갈수록 옅지만 화면 전체에 깔린다.
  float vert = mix(0.55, 1.0, uv.y);
  float amount = u_strength * vert * (0.2 + 0.8 * band) * (0.5 + field);

  // 색: 덩어리 밝기에 따라 두 색 사이를 오간다.
  vec3 tint = mix(u_plum, u_warm, smoothstep(0.3, 0.75, field));

  // 8비트로 끊겨 보이는 줄무늬(밴딩)를 없애려고 픽셀마다 ±1/255 만큼 흩어 준다(디더링).
  float dither = (hash(fract(gl_FragCoord.xy * 0.0137) * 7.0) - 0.5) * (2.0 / 255.0);
  float a = clamp(amount + dither, 0.0, 1.0);
  gl_FragColor = vec4(tint * a, a);
}
