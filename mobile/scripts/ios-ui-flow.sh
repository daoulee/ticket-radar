#!/bin/sh
# iOS 시뮬레이터 실제 조작 검증(XCUITest). 개발용 딥링크 바로가기를 쓰지 않는다.
# 준비: 시뮬레이터에 개발 빌드(dev.aid.ticketradar)가 설치돼 있어야 한다(npx expo run:ios 1회).
# 사용: sh scripts/ios-ui-flow.sh [시뮬레이터 UDID]
# 하는 일: Sol 서버·Metro가 없으면 띄움 → 앱을 Metro 번들로 실행 → 판매글을 시뮬레이터 클립보드에 복사
#          → e2e-ios 의 XCUITest 가 탭·붙여넣기·키보드 입력으로 흐름 진행 → 캡처를 evidence/screenshots 에 저장.
set -eu
cd "$(dirname "$0")/.."
SIM="${1:-2D967200-F4E4-4FC7-A751-3D1B978A68F0}"
API=http://127.0.0.1:3001
TMP="${TMPDIR:-/tmp}"
SHOTS="$(pwd)/evidence/screenshots"
STARTED=""

# 이 스크립트가 띄운 서버·Metro만 종료한다(자식 프로세스까지 포트 기준으로 정리).
cleanup() {
  for pid in $STARTED; do kill "$pid" 2>/dev/null || true; done
  case "$STARTED_PORTS" in *3001*) lsof -tiTCP:3001 -sTCP:LISTEN | xargs kill 2>/dev/null || true;; esac
  case "$STARTED_PORTS" in *8081*) lsof -tiTCP:8081 -sTCP:LISTEN | xargs kill 2>/dev/null || true;; esac
}
STARTED_PORTS=""
trap cleanup EXIT

if ! curl -s -m 2 "$API/health" >/dev/null; then
  (cd ../server && npm start >"$TMP/aid-ui-server.log" 2>&1) & STARTED="$STARTED $!"; STARTED_PORTS="$STARTED_PORTS 3001"
  for _ in $(seq 1 20); do curl -s -m 2 "$API/health" >/dev/null && break; sleep 1; done
fi
curl -s "$API/health"; echo

if ! curl -s -m 2 http://127.0.0.1:8081/status | grep -q running; then
  EXPO_PUBLIC_API_BASE_URL="$API" CI=1 npx expo start --dev-client --port 8081 >"$TMP/aid-ui-metro.log" 2>&1 & STARTED="$STARTED $!"; STARTED_PORTS="$STARTED_PORTS 8081"
  for _ in $(seq 1 60); do curl -s -m 2 http://127.0.0.1:8081/status | grep -q running && break; sleep 1; done
fi

xcrun simctl boot "$SIM" 2>/dev/null || true
xcrun simctl terminate "$SIM" dev.aid.ticketradar 2>/dev/null || true
xcrun simctl openurl "$SIM" 'dev.aid.ticketradar://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081'
sleep 15

# 판매글(합성 시연 문장)을 클립보드에 둔다. 테스트는 입력칸을 길게 눌러 붙여넣는다.
node -e "process.stdout.write(require('../shared/examples/manual-request.json').listingText)" | xcrun simctl pbcopy "$SIM"

mkdir -p "$SHOTS"
rm -f "$SHOTS"/ios-ui-*.png
RESULT="$TMP/aid-ui-$(date +%Y%m%d-%H%M%S).xcresult"
xcodebuild test \
  -project e2e-ios/TicketRadarUITests.xcodeproj -scheme TicketRadarUITests \
  -destination "platform=iOS Simulator,id=$SIM" \
  -derivedDataPath "$TMP/aid-uitests-dd" -resultBundlePath "$RESULT" 2>&1 | tee "$TMP/aid-ui-xcodebuild.log" | grep -E 'Test Case|error:|failed|passed|TEST (SUCCEEDED|FAILED)' || true
echo "xcresult: $RESULT"
# 첨부(캡처·실패 시 접근성 트리)를 꺼내 저장한다.
OUT="$TMP/aid-ui-attachments"; rm -rf "$OUT"; mkdir -p "$OUT"
xcrun xcresulttool export attachments --path "$RESULT" --output-path "$OUT" >/dev/null 2>&1 || true
node -e '
const fs=require("fs"),path=require("path");const [out,shots]=process.argv.slice(1);
const m=JSON.parse(fs.readFileSync(path.join(out,"manifest.json"),"utf8"));
for(const t of m) for(const a of t.attachments){const n=a.suggestedHumanReadableName.replace(/_\d+_[0-9A-F-]+(\.\w+)$/i,"$1");
 const dest=n.startsWith("ios-ui-")?path.join(shots,n.endsWith(".png")?n:n+".png"):path.join(out,n);
 fs.copyFileSync(path.join(out,a.exportedFileName),dest);console.log("saved",dest);}' "$OUT" "$SHOTS" || true
grep -q '\*\* TEST SUCCEEDED \*\*' "$TMP/aid-ui-xcodebuild.log"
