# 사용자 제공 셰이더 적용 · 2026-11-02

## 원본 확인

사용자가 제공한 Downloads의 `suno-cta.glsl`, `screen-glow.glsl`, `dashed-pill.glsl`을 읽고 `docs/design/shaders/`에 동일한 사본으로 보존했다. Pen의 기존 상대 참조가 해결되어 홈/CTA 미리보기에서 누락 오류가 사라진 것을 확인했다. Pen 원본 자체는 수정하지 않았다.

세 셰이더 모두 시간 uniform이 없고, 해상도·색·seed 등으로 정적 효과를 계산한다. 따라서 현재 라이트 모드에는 별도 네이티브 GPU 패키지 없이 사전 렌더 결과를 사용할 수 있다.

## 적용 방식

| 원본 | 앱 적용 | 정확성 범위 |
|---|---|---|
| suno-cta.glsl | Chrome WebGL로 358×54의 3배 해상도 PNG 생성, 주요 버튼의 장식 이미지로 사용 | 원본 GLSL와 목업 라이트 uniform 사용. 읽기 대비를 위해 네이비 보정층 추가 |
| screen-glow.glsl | 390×844의 3배 해상도 투명 PNG 생성, Screen 배경 | 고정 seed 2.1·라이트 색상. 런타임 GPU·실시간 크기별 재계산 아님 |
| dashed-pill.glsl | 원문 보존, 미선택 칩의 native dashed border 및 선택 시 solid로 표현 | 같은 시각적 목적. 원본 shader의 정확한 dash 위상/길이를 재현한 것은 아님 |

생성 코드: `scripts/render_shader_assets.mjs`. 이미지와 색·seed·SHA-256·대비 결과: `mobile/assets/shaders/manifest.json`.

```sh
cd /Users/daoule/Desktop/AID
node scripts/render_shader_assets.mjs
cd mobile
npm run release:d2
```

모델로 이미지를 생성한 것이 아니라 사용자 GLSL 코드를 WebGL로 실행해 얻은 결과다. 새 UI·GL 라이브러리는 설치하지 않았다. 입력·API·실제/시연 구분은 변경하지 않는다.

## 글자 대비와 조작

CTA 원본 이미지 전체의 가장 밝은 픽셀 기준 흰 글자 대비는 약 1.59:1이었다. 네이비 #0B1220, opacity 0.47을 더하면 정적 계산상 최소 약 4.61:1이다. 이 수치는 정상 상태의 원본 픽셀 기반이며, 모든 기기에서 렌더된 글자 가장자리·디스플레이·접근성 설정을 실측한 결과는 아니다.

버튼 눌림 피드백은 전체 opacity를 낮추는 대신 경계선으로 표현해 정상 대비가 흐려지지 않게 했다. 비활성 버튼의 기존 표시/접근성 상태는 유지했다. 이미지와 장식층은 터치 대상에서 제외했다. 점선 칩 경계는 옅은 색 대신 보조 텍스트 색을 사용했다.

## 남는 차이

- 현재 라이트 모드만 적용. 목업의 다크 모드를 구현했다고 하지 않는다.
- 배경은 이미지 cover로 기기 비율에 맞춰 표시하므로 원본 화면별 seed·모든 해상도의 실시간 shader 결과와 완전히 같지 않다.
- 글자 대비 보정 때문에 CTA는 Pen 원본보다 어둡다.
- 실시간 glass blur, Noto Serif 폰트, 사용자 최종 로고는 별도 항목이다.
- 배경 PNG 약4.7MB(3배 해상도), CTA 약100KB. 여러 화면의 디코딩/캐시 메모리는 별도 계측하지 않았다.
