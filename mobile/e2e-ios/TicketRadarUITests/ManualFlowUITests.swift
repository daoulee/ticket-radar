import XCTest

// 시뮬레이터에 설치된 티켓레이더 개발 빌드(dev.aid.ticketradar)를 XCUITest로 실제 탭·키보드 입력한다.
// 개발용 딥링크 바로가기(demoScenario·devLive)를 쓰지 않는다. 앱 코드에 테스트 전용 분기를 넣지 않는다.
// 전제(scripts/ios-ui-flow.sh 가 준비): Sol 서버 127.0.0.1:3001(AI 미설정), Metro(EXPO_PUBLIC_API_BASE_URL 지정),
// 앱이 Metro 번들로 첫 화면을 띄운 상태, 판매글 문장이 시뮬레이터 클립보드에 복사된 상태.
// 판매글은 사용자가 하듯 입력칸을 길게 눌러 '붙여넣기'로 넣고, 숫자는 키보드로 입력한다.
final class ManualFlowUITests: XCTestCase {
    let app = XCUIApplication(bundleIdentifier: "dev.aid.ticketradar")
    var step = 0

    override func setUp() {
        continueAfterFailure = false
    }

    func testManualFlowOnRealServer() throws {
        app.activate()

        let homeStart = app.buttons["판매글 확인하기"]
        if homeStart.waitForExistence(timeout: 5) { homeStart.tap() }

        // 1. 공연 선택
        let event = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", "AKMU CONCERT TOUR")).firstMatch
        XCTAssertTrue(event.waitForExistence(timeout: 60), "공연 목록이 보이지 않음")
        shot("events")
        event.tap()

        // 2. 판매글 입력: 길게 눌러 붙여넣기
        // 화면 제목도 '판매글 입력'이므로 여러 줄 입력칸(TextView)으로 한정한다.
        let input = app.textViews.matching(NSPredicate(format: "label BEGINSWITH %@", "판매글 입력")).firstMatch
        XCTAssertTrue(input.waitForExistence(timeout: 15))
        dismissDevWarningToast()
        // 입력칸이 하단 고정 버튼에 가려지지 않도록 화면을 올린 뒤 누른다(사용자가 스크롤하는 것과 같음).
        app.swipeUp(velocity: .slow)
        input.tap()
        input.press(forDuration: 1.2)
        let paste = app.descendants(matching: .any).matching(NSPredicate(format: "label IN %@", ["Paste", "붙여넣기"])).firstMatch
        if !paste.waitForExistence(timeout: 5) {
            attachTree("paste-missing")
            XCTFail("붙여넣기 메뉴가 나오지 않음")
        }
        paste.tap()
        allowPasteIfAsked()
        let pasted = expectation(for: NSPredicate(format: "value CONTAINS %@", "AKMU 대구 11월 21일"), evaluatedWith: input)
        wait(for: [pasted], timeout: 5)
        dismissKeyboard()
        shot("listing-pasted")

        // 3. AI 미설정 확인: 오류 코드, 재시도 버튼 없음, 화면 유지
        dismissDevWarningToast()
        app.buttons["이 판매글 확인하기"].tap()
        XCTAssertTrue(text(containing: "오류 코드: AI_NOT_CONFIGURED").waitForExistence(timeout: 20), "AI 미설정 오류가 보이지 않음")
        XCTAssertFalse(app.buttons["다시 시도"].exists, "재시도할 수 없는 오류에 다시 시도 버튼이 보임")
        shot("ai-not-configured")

        // 4. 명시적 수동 입력
        app.buttons["AI 없이 직접 입력"].tap()
        XCTAssertTrue(text(containing: "AI 추출 없음 · 사용자가 직접 입력").waitForExistence(timeout: 10))
        shot("manual-review-empty")

        // 5. 값 입력(칩 탭·숫자 키보드) → 가격 비교
        choose("회차", "11월 21일 (토) 17:00")
        choose("좌석 등급", "VIP석")
        typeNumber(into: "가격 입력", "250000")
        typeNumber(into: "매수 입력", "1")
        choose("선택한 공연의 판매글인가", "예, 선택한 공연의 판매글")
        choose("예매 유형", "팬클럽 선예매")
        choose("가격 기준", "1매 가격")
        choose("수수료 포함 여부", "티켓 금액만")
        choose("할인 여부", "할인 없는 기본가")
        choose("구매자가 예매자 본인인가", "아니요")
        shot("manual-review-filled")
        app.buttons["이 값으로 공식 자료와 대조"].tap()
        XCTAssertTrue(text(containing: "+74,000원").waitForExistence(timeout: 20), "가격 비교 결과(+74,000원)가 보이지 않음")
        XCTAssertTrue(text(containing: "AI 추출 없이 사용자가 직접 입력한 값으로 대조한 결과입니다.").exists)
        shot("result-compare")

        // 6. 값 수정 → 재대조
        app.buttons["값 수정하고 다시 대조"].tap()
        replaceNumber(in: "가격 입력", "200000")
        shot("edit-price")
        app.buttons["이 값으로 공식 자료와 대조"].tap()
        XCTAssertTrue(text(containing: "+24,000원").waitForExistence(timeout: 20), "수정값 재대조 결과(+24,000원)가 보이지 않음")
        shot("result-recompare")

        // 7. 조건 누락(공연 일치 미확인) → 보류
        app.buttons["값 수정하고 다시 대조"].tap()
        choose("선택한 공연의 판매글인가", "아니거나 모름")
        shot("condition-missing")
        app.buttons["이 값으로 공식 자료와 대조"].tap()
        XCTAssertTrue(text(containing: "가격 비교 보류").waitForExistence(timeout: 20), "조건 누락 보류가 보이지 않음")
        XCTAssertFalse(text(containing: "+24,000원").exists, "보류인데 차액이 보임")
        shot("result-held")
    }

    func testDemoReleaseFlowD2() throws {
        app.activate()
        XCTAssertTrue(text(containing: "찾고 계세요?").waitForExistence(timeout: 30), "플랫폼 홈이 첫 화면이어야 함")
        XCTAssertFalse(app.buttons["다음 대조 요청을 실패시키기"].exists)
        shot("release-home")
        openCheckFlow()
        let event = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", "레이더 라이브 2026")).firstMatch
        XCTAssertTrue(event.waitForExistence(timeout: 15))
        shot("release-events")
        event.tap()
        let sample = app.buttons["예시 1 · 가격 차이와 캡처 전달"]
        scrollIntoView(sample)
        sample.tap()
        shot("release-listing")
        app.buttons["이 판매글 확인하기"].tap()
        XCTAssertTrue(text(containing: "시연 fixture 조회").waitForExistence(timeout: 15))
        shot("release-review")
        choose("선택한 공연의 판매글인가", "예, 선택한 공연의 판매글")
        choose("수수료 포함 여부", "티켓 금액만")
        choose("할인 여부", "할인 없는 기본가")
        app.buttons["이 값으로 공식 자료와 대조"].tap()
        XCTAssertTrue(text(containing: "+76,000원").waitForExistence(timeout: 15))
        XCTAssertTrue(app.buttons["값 수정하고 다시 대조"].exists)
        shot("release-result")
    }

    // 실서버(Gemini 설정) Release: 홈 → 공연 → 판매글 붙여넣기(스크립트가 simctl pbcopy) → 실제 AI 추출 → 대조.
    // 개발용 바로가기 없음. AI 추출 표시는 서버 응답의 actualModelCall 로만 나온다.
    func testAiLiveFlowD2() throws {
        app.activate()
        // APP-024: 판매글 확인(기존 암표 방지 흐름)은 '전체' 탭 → '다른 곳 판매글 확인하기'에서 시작한다.
        openCheckFlow()
        let event = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", "AKMU")).firstMatch
        XCTAssertTrue(event.waitForExistence(timeout: 30), "실서버 공연 목록이 보이지 않음")
        shot("live-events")
        event.tap()
        let input = app.textViews.matching(NSPredicate(format: "label BEGINSWITH %@", "판매글 입력")).firstMatch
        XCTAssertTrue(input.waitForExistence(timeout: 15))
        app.swipeUp(velocity: .slow)
        // 스크롤 관성이 멈춘 뒤 눌러야 첫 탭이 스크롤 정지로 소모되지 않는다.
        Thread.sleep(forTimeInterval: 1.5)
        // 글이 시작되는 윗부분을 누른다(정가운데 탭은 포커스가 안 잡히는 경우가 있었음, APP-020).
        input.coordinate(withNormalizedOffset: CGVector(dx: 0.3, dy: 0.2)).tap()
        // 시뮬레이터 하드웨어 키보드 연결 상태에선 편집 메뉴가 뜨지 않을 수 있어, 키보드 입력으로 넣는다.
        input.typeText("AKMU 대구 11월 21일 오후 5시 VIP 1매, 티켓 금액만 25만원입니다. 팬클럽 선예매로 샀고 예매자는 저지만 구매자 혼자 가면 됩니다.")
        let typed = expectation(for: NSPredicate(format: "value CONTAINS %@", "AKMU"), evaluatedWith: input)
        wait(for: [typed], timeout: 10)
        // 개편 후 화면 제목은 '공연 바꾸기' 버튼이라, 키보드는 본문 글자를 눌러 닫는다.
        if app.keyboards.count > 0 { app.staticTexts["공식 자료"].firstMatch.tap() }
        shot("live-listing")
        app.buttons["이 판매글 확인하기"].tap()
        var ok = text(containing: "AI 모델 추출").waitForExistence(timeout: 45)
        if !ok, app.buttons["다시 시도"].exists {
            shot("live-ai-retry") // 구글 과부하 등으로 실패하면 사용자가 하듯 한 번 다시 시도
            app.buttons["다시 시도"].tap()
            ok = text(containing: "AI 모델 추출").waitForExistence(timeout: 45)
        }
        XCTAssertTrue(ok, "AI 추출 결과 표시가 없음")
        shot("live-review")
        app.buttons["이 값으로 공식 자료와 대조"].tap()
        XCTAssertTrue(text(containing: "공식 자료 대조 결과").waitForExistence(timeout: 30))
        shot("live-result")
    }

    // 캡처 업로드 OCR: 사진 보관함(스크립트가 simctl addmedia 로 넣은 판매글 이미지)에서 고르면
    // 기기 안 Vision 인식으로 판매글 입력칸이 채워져야 한다. 개발용 바로가기·테스트 분기 없음.
    func testCaptureOcrD2() throws {
        app.activate()
        // APP-024: 판매글 확인(기존 암표 방지 흐름)은 '전체' 탭 → '다른 곳 판매글 확인하기'에서 시작한다.
        openCheckFlow()
        let event = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", "레이더 라이브 2026")).firstMatch
        XCTAssertTrue(event.waitForExistence(timeout: 15), "공연 선택(1단계)이 보이지 않음")
        event.tap()
        let attach = app.buttons["캡처 이미지 올리기"]
        XCTAssertTrue(attach.waitForExistence(timeout: 10))
        attach.tap()
        // 시스템 사진 선택기(PHPicker, 앱 밖 화면)가 뜰 때까지 기다린 뒤 첫 번째(가장 최근) 사진 칸을 누른다.
        let picker = app.descendants(matching: .any).matching(NSPredicate(format: "label CONTAINS %@", "비공개 접근")).firstMatch
        if !picker.waitForExistence(timeout: 15) {
            attachTree("picker-missing")
            XCTFail("사진 선택기가 보이지 않음")
        }
        sleep(1)
        shot("ocr-picker")
        app.coordinate(withNormalizedOffset: CGVector(dx: 0.14, dy: 0.42)).tap()
        let input = app.textViews.matching(NSPredicate(format: "label BEGINSWITH %@", "판매글 입력")).firstMatch
        let filled = expectation(for: NSPredicate(format: "value CONTAINS %@", "VIP"), evaluatedWith: input)
        wait(for: [filled], timeout: 30)
        XCTAssertTrue(text(containing: "캡처에서 읽은 글을 위 입력칸에 넣었어요").waitForExistence(timeout: 5))
        shot("ocr-filled")
    }

    // 홈(웹 소개 구성) 스크롤 연출 확인용: 위로 쓸어 올리며 구간마다 캡처한다.
    func testLandingScrollD2() throws {
        app.activate()
        let more = anyEl("전체 탭")
        XCTAssertTrue(more.waitForExistence(timeout: 30))
        more.tap()
        app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "서비스 소개")).firstMatch.tap()
        XCTAssertTrue(app.buttons["바로 체험하기"].waitForExistence(timeout: 10))
        sleep(1)
        shot("landing-00")
        for i in 1...14 {
            app.swipeUp(velocity: .slow)
            usleep(600_000)
            shot(String(format: "landing-%02d", i))
        }
        XCTAssertTrue(text(containing: "직접 확인해 볼까요?").waitForExistence(timeout: 5))
    }

    // 플랫폼(시연 모드): 홈 → 가입 → 공연 하트 → 매물 → 시연 결제 → 티켓 받았어요 → 판매 등록. 바로가기 없음.
    func testMarketFlowD2() throws {
        app.activate()
        XCTAssertTrue(text(containing: "찾고 계세요?").waitForExistence(timeout: 30))
        ensureLoggedOut()
        shot("market-home")
        // 가입(시연 계정)
        app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "로그인하고 즐겨찾기를")).firstMatch.tap()
        anyEl("가입").tap()
        let name = app.textFields["닉네임"]
        XCTAssertTrue(name.waitForExistence(timeout: 10))
        name.tap(); name.typeText("demo\(Int.random(in: 100...999))")
        let pw = app.secureTextFields["비밀번호"]
        pw.tap(); pw.typeText("demo-pass-1")
        shot("market-signup")
        app.buttons["가입하고 시작하기"].tap()
        allowNotificationsIfAsked()
        // 공연 → 하트(계정 저장)
        let show = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "[가상] 레이더 라이브 2026")).firstMatch
        XCTAssertTrue(show.waitForExistence(timeout: 15))
        show.tap()
        let heart = app.buttons["즐겨찾기"]
        XCTAssertTrue(heart.waitForExistence(timeout: 10))
        heart.tap()
        XCTAssertTrue(app.buttons["즐겨찾기 해제"].waitForExistence(timeout: 10))
        shot("market-show")
        // 정가 초과·캡처 매물 상세(안심 확인)
        app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "VIP 1매, 230,000원")).firstMatch.tap()
        XCTAssertTrue(text(containing: "캡처로는 입장할 수 없어요").waitForExistence(timeout: 10))
        shot("market-item-warning")
        app.buttons["뒤로"].tap()
        // 정가 이하 매물 구매(시연 결제)
        app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "R 2매, 120,000원")).firstMatch.tap()
        let buy = app.buttons["구매하기"]
        XCTAssertTrue(buy.waitForExistence(timeout: 10))
        shot("market-item-good")
        buy.tap()
        XCTAssertTrue(text(containing: "결제할게요").waitForExistence(timeout: 10))
        shot("market-checkout")
        app.buttons["결제하기"].tap()
        XCTAssertTrue(text(containing: "확인해 주세요").waitForExistence(timeout: 10))
        shot("market-order")
        app.buttons["티켓 받았어요"].tap()
        XCTAssertTrue(text(containing: "거래가 끝났어요").waitForExistence(timeout: 10))
        shot("market-order-done")
        // 즐겨찾기 탭·알림 스위치
        app.buttons["뒤로"].tap()
        app.descendants(matching: .any).matching(NSPredicate(format: "label BEGINSWITH %@", "즐겨찾기 탭")).firstMatch.tap()
        XCTAssertTrue(app.switches["정가 이하 매물 알림"].waitForExistence(timeout: 10))
        shot("market-favorites")
    }

    // 로그인 유지(APP-025): 가입 후 앱을 완전히 종료·재실행해도 전체 탭에 같은 닉네임이 보여야 한다(키체인 토큰 복원).
    func testSessionRestoreD2() throws {
        app.activate()
        XCTAssertTrue(text(containing: "찾고 계세요?").waitForExistence(timeout: 30))
        let more = anyEl("전체 탭")
        more.tap()
        let entry = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "로그인하기")).firstMatch
        if entry.waitForExistence(timeout: 3) {
            entry.tap()
            anyEl("가입").tap()
            let nick = "keep\(Int.random(in: 100...999))"
            let name = app.textFields["닉네임"]
            XCTAssertTrue(name.waitForExistence(timeout: 10))
            name.tap(); name.typeText(nick)
            let pw = app.secureTextFields["비밀번호"]
            pw.tap(); pw.typeText("demo-pass-1")
            app.buttons["가입하고 시작하기"].tap()
            allowNotificationsIfAsked()
        }
        anyEl("전체 탭").tap()
        let account = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", "알림 켜짐")).firstMatch
        XCTAssertTrue(account.waitForExistence(timeout: 10), "가입 후 계정 줄이 보여야 함")
        let nick = account.label.components(separatedBy: ",").first ?? account.label
        app.terminate()
        app.launch()
        XCTAssertTrue(text(containing: "찾고 계세요?").waitForExistence(timeout: 30))
        // 홈은 시작 연출(필기체 로고) 아래에서 먼저 그려진다. 연출 중 탭은 '건너뛰기'로 처리되므로 끝날 때까지 기다린다.
        sleep(6)
        anyEl("전체 탭").tap()
        let restored = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@ AND label CONTAINS %@", nick, "알림")).firstMatch
        XCTAssertTrue(restored.waitForExistence(timeout: 15), "재실행 후 같은 계정으로 복원돼야 함")
        shot("session-restored")
    }

    // MARK: - 사용자 동작 도우미

    // 첫 가입 시 iOS 알림 권한 창(앱 밖 SpringBoard)이 뜨면 허용한다.
    private func allowNotificationsIfAsked() {
        // 가입 요청·권한 확인 뒤에 뜨므로 넉넉히 기다린다(로컬 서명 빌드에서 실제로 뜸).
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        let allow = springboard.buttons.matching(NSPredicate(format: "label IN %@", ["허용", "Allow"])).firstMatch
        // iOS '암호를 저장하겠습니까?'(자동완성) 창이 먼저 뜰 수 있다 → '지금 안 함'.
        for _ in 0..<2 {
            let notNow = app.buttons["지금 안 함"].exists ? app.buttons["지금 안 함"] : springboard.buttons["지금 안 함"]
            if notNow.waitForExistence(timeout: 4) { notNow.tap() }
            if allow.waitForExistence(timeout: 4) { allow.tap() }
        }
    }

    // 탭·탭 목록 항목(accessibilityRole="tab")은 버튼이 아니라서 종류와 상관없이 이름으로 찾는다.
    private func anyEl(_ label: String) -> XCUIElement {
        app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", label)).firstMatch
    }

    // 이전 실행의 로그인(키체인 복원)이 남아 있으면 로그아웃해서 처음 상태로 시작한다.
    private func ensureLoggedOut() {
        anyEl("전체 탭").tap()
        let logout = app.buttons["로그아웃"]
        if logout.waitForExistence(timeout: 3) { logout.tap() }
        anyEl("홈 탭").tap()
        XCTAssertTrue(app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "로그인하고 즐겨찾기를")).firstMatch.waitForExistence(timeout: 10))
    }

    private func openCheckFlow() {
        let more = anyEl("전체 탭")
        XCTAssertTrue(more.waitForExistence(timeout: 30), "하단 '전체' 탭이 보이지 않음")
        more.tap()
        let entry = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "다른 곳 판매글 확인하기")).firstMatch
        XCTAssertTrue(entry.waitForExistence(timeout: 10))
        entry.tap()
    }

    private func element(label: String) -> XCUIElement {
        app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", label)).firstMatch
    }

    private func text(containing s: String) -> XCUIElement {
        app.descendants(matching: .any).matching(NSPredicate(format: "label CONTAINS %@", s)).firstMatch
    }

    private func tapButton(_ label: String) {
        let e = app.buttons.matching(NSPredicate(format: "label == %@", label)).firstMatch
        XCTAssertTrue(e.waitForExistence(timeout: 10), "버튼 '\(label)' 없음")
        scrollIntoView(e)
        e.tap()
    }

    // 웹식 선택 칸: 칸(이름 + ' 선택')을 눌러 시트를 연 뒤 선택지를 고른다.
    private func choose(_ field: String, _ option: String) {
        let f = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "\(field) 선택")).firstMatch
        XCTAssertTrue(f.waitForExistence(timeout: 10), "선택 칸 '\(field)' 없음")
        scrollIntoView(f)
        f.tap()
        let o = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", option))
        let last = o.element(boundBy: max(0, o.count - 1))
        XCTAssertTrue(last.waitForExistence(timeout: 5), "선택지 '\(option)' 없음")
        last.tap()
    }

    private func chip(_ label: String) {
        let e = element(label: label)
        XCTAssertTrue(e.waitForExistence(timeout: 10), "선택지 '\(label)' 없음")
        scrollIntoView(e)
        e.tap()
    }

    private func field(_ label: String) -> XCUIElement {
        app.textFields.matching(NSPredicate(format: "label BEGINSWITH %@", label)).firstMatch
    }

    private func typeNumber(into label: String, _ digits: String) {
        let field = field(label)
        XCTAssertTrue(field.waitForExistence(timeout: 10), "입력칸 '\(label)' 없음")
        scrollIntoView(field)
        field.tap()
        field.typeText(digits)
        dismissKeyboard()
    }

    private func replaceNumber(in label: String, _ digits: String) {
        let field = field(label)
        XCTAssertTrue(field.waitForExistence(timeout: 10), "입력칸 '\(label)' 없음")
        scrollIntoView(field)
        field.tap()
        let current = (field.value as? String) ?? ""
        field.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue, count: max(current.count, 12)))
        field.typeText(digits)
        dismissKeyboard()
    }

    private func scrollIntoView(_ e: XCUIElement) {
        var tries = 0
        while !e.isHittable && tries < 12 {
            app.swipeUp(velocity: .slow)
            tries += 1
        }
        tries = 0
        while !e.isHittable && tries < 12 {
            app.swipeDown(velocity: .slow)
            tries += 1
        }
    }

    private func dismissKeyboard() {
        guard app.keyboards.count > 0 else { return }
        // 숫자 키패드에는 완료 키가 없으므로 화면 제목을 탭해 키보드를 닫는다.
        app.navigationBars.firstMatch.tap()
    }

    private func allowPasteIfAsked() {
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        for label in ["Allow Paste", "붙여넣기 허용"] {
            let b = springboard.buttons[label]
            if b.waitForExistence(timeout: 2) { b.tap(); return }
        }
    }

    // 개발 빌드의 경고 알림(LogBox)이 하단 버튼을 덮으면 닫는다. 앱 화면 요소가 아니다.
    private func dismissDevWarningToast() {
        let toast = text(containing: "Open debugger to view warnings")
        guard toast.exists else { return }
        let frame = toast.frame
        // 알림 오른쪽 끝의 닫기(원형) 버튼 위치를 누른다.
        app.coordinate(withNormalizedOffset: .zero)
            .withOffset(CGVector(dx: frame.maxX - 20, dy: frame.midY)).tap()
    }

    private func attachTree(_ name: String) {
        let a = XCTAttachment(string: app.debugDescription)
        a.name = name
        a.lifetime = .keepAlways
        add(a)
    }

    // 캡처는 테스트 결과(xcresult) 첨부로 남기고, 실행 스크립트가 evidence/screenshots 로 꺼낸다.
    private func shot(_ name: String) {
        step += 1
        let png = XCUIScreen.main.screenshot().pngRepresentation
        let a = XCTAttachment(data: png, uniformTypeIdentifier: "public.png")
        a.name = String(format: "ios-ui-%02d-%@", step, name)
        a.lifetime = .keepAlways
        add(a)
    }
}
