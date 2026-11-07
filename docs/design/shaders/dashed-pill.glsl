/*
 * 알약(pill) 모양 점선 테두리. pen.dev는 점선 stroke 속성이 없어 stroke 채우기 셰이더로 그린다.
 * 둘레를 따라 거리를 재서 u_dash 길이만큼 칠하고 u_gap 길이만큼 비운다. 둘레 길이에 맞춰 주기를 살짝 조정해 이음새가 맞는다.
 * Suno Simple 만들기 화면의 "+ / Audio / Styles / Lyrics" 칩 참고(흰색 20% 점선).
 * u_color는 pen 변수 tr-dash-ink(다크 흰색 / 라이트 남색)로 연결해 모드에 따라 바뀐다.
 */

/** @resolution */
uniform vec2 u_resolution;

/**
 * @label Color
 * @color
 * @default #FFFFFF
 */
uniform vec3 u_color;

/**
 * @label Opacity
 * @default 0.32
 * @range 0, 1
 */
uniform float u_alpha;

/**
 * @label Dash
 * @default 5.0
 * @range 1, 30
 */
uniform float u_dash;

/**
 * @label Gap
 * @default 4.0
 * @range 1, 30
 */
uniform float u_gap;

const float PI = 3.14159265;

void main() {
  float W = u_resolution.x;
  float H = u_resolution.y;
  float r = H * 0.5;
  float L = max(W - 2.0 * r, 0.0);
  vec2 f = gl_FragCoord.xy;
  float s;
  if (f.x < r) {
    vec2 d = f - vec2(r, r);
    float ang = atan(d.y, d.x);
    if (ang < 0.0) ang += 2.0 * PI;
    s = (ang - 0.5 * PI) * r;
  } else if (f.x > W - r) {
    vec2 d = f - vec2(W - r, r);
    float ang = atan(d.y, d.x);
    s = PI * r + L + (ang + 0.5 * PI) * r;
  } else if (f.y < r) {
    s = PI * r + (f.x - r);
  } else {
    s = 2.0 * PI * r + L + (W - r - f.x);
  }
  float P = 2.0 * PI * r + 2.0 * L;
  float period = u_dash + u_gap;
  float count = max(floor(P / period + 0.5), 1.0);
  float fitted = P / count;
  float on = step(mod(s, fitted), u_dash * fitted / period);
  float a = on * u_alpha;
  gl_FragColor = vec4(u_color * a, a);
}
