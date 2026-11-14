/* 티켓레이더 모바일 앱 — 모든 공연·거래는 가상 시연 데이터입니다. */
(() => {
  'use strict';

  // ---------- 아이콘 ----------
  const I = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    homeF: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    searchF: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/></svg>',
    swapF: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/></svg>',
    ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2.5a2.5 2.5 0 0 0 0 5V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2.5a2.5 2.5 0 0 0 0-5z"/><path d="M14 5v14" stroke-dasharray="2 2.5"/></svg>',
    ticketF: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2.5a2.5 2.5 0 0 0 0 5V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2.5a2.5 2.5 0 0 0 0-5z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0" stroke-linecap="round"/></svg>',
    userF: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4.5"/><path d="M3.5 21a8.5 8.5 0 0 1 17 0z"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 21h4" stroke-linecap="round"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7.5-4.5-9-9.5C2 6.5 5 4 8 4c1.8 0 3.2 1 4 2.3C12.8 5 14.2 4 16 4c3 0 6 2.5 5 6.5-1.5 5-9 9.5-9 9.5z"/></svg>',
    heartW: '<svg viewBox="0 0 24 24" fill="rgba(0,0,0,.15)" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7.5-4.5-9-9.5C2 6.5 5 4 8 4c1.8 0 3.2 1 4 2.3C12.8 5 14.2 4 16 4c3 0 6 2.5 5 6.5-1.5 5-9 9.5-9 9.5z"/></svg>',
    heartRed: '<svg viewBox="0 0 24 24" fill="#ff3b30" stroke="#ff3b30" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7.5-4.5-9-9.5C2 6.5 5 4 8 4c1.8 0 3.2 1 4 2.3C12.8 5 14.2 4 16 4c3 0 6 2.5 5 6.5-1.5 5-9 9.5-9 9.5z"/></svg>',
    heartBig: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7.5-4.5-9-9.5C2 6.5 5 4 8 4c1.8 0 3.2 1 4 2.3C12.8 5 14.2 4 16 4c3 0 6 2.5 5 6.5-1.5 5-9 9.5-9 9.5z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4A8 8 0 1 1 20 12z"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
    bookmarkF: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    verified: '<svg class="verified" viewBox="0 0 24 24"><path fill="#4a5bd4" d="M12 1.5l2.6 2 3.2-.3 1 3.1 2.8 1.6-.9 3.1 1.4 2.9-2.5 2-.4 3.2-3.2.5-1.9 2.6-3-1.2-3 1.2-1.9-2.6-3.2-.5-.4-3.2-2.5-2L2.4 11l-.9-3.1 2.8-1.6 1-3.1 3.2.3z"/><path d="M7.5 12l3 3 6-6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  // ---------- 가상 데이터 (원본 사이트의 시연 데이터 기반) ----------
  const OFFICIAL_NOTICE = '가상 공식 공지 (2026-10-28 확인)';
  const POLICIES = {
    identity: { title: '예매자 본인 확인', text: '공연 당일 예매자 본인의 신분증과 예매 내역을 확인한 뒤 입장합니다.' },
    transfer: { title: '양도 제한', text: '예매한 티켓은 제3자에게 양도·재판매할 수 없으며, 확인 시 예매가 취소될 수 있습니다. 예매처 공식 양도 기능을 이용하세요.' },
    pickup: { title: '모바일 티켓 표시', text: '모바일 티켓은 예매자 본인 휴대폰의 예매처 앱에서만 표시되며, 캡처 화면으로는 입장할 수 없습니다.' },
  };
  const GRADE_COLOR = { VIP: '#8b5cf6', R: '#e5484d', S: '#4a5bd4', A: '#10a36b', '스탠딩': '#f08c00', '일반': '#4a5bd4' };

  const EVENTS = [
    {
      id: 'demo-radar-live', title: '레이더 라이브 2026', category: '콘서트', venue: '가상 아레나', region: '서울',
      poster: '/images/demo/radar-live-poster.webp', hot: true,
      showtimes: [
        { id: 'demo-st-sat', label: '11월 21일(토) 19:00', date: '2026-11-21T19:00:00+09:00' },
        { id: 'demo-st-sun', label: '11월 22일(일) 17:00', date: '2026-11-22T17:00:00+09:00' },
      ],
      prices: [{ grade: 'VIP', price: 154000 }, { grade: 'R', price: 132000 }, { grade: 'S', price: 110000 }],
      policies: ['identity', 'transfer', 'pickup'], official: true,
      desc: '레이더 라이브 2026은 시연용 가상 공연입니다. 공식 가격·입장 규정 자료가 등록되어 있어 판매글과 대조할 수 있어요.',
    },
    {
      id: 'demo-compass', title: '뮤지컬 나침반', category: '뮤지컬', venue: '가상 극장', region: '서울',
      poster: '/images/demo/compass-poster.webp',
      showtimes: [{ id: 'demo-compass-1', label: '12월 5일(토) 14:00', date: '2026-12-05T14:00:00+09:00' }],
      prices: [{ grade: 'R', price: 140000 }, { grade: 'S', price: 110000 }, { grade: 'A', price: 80000 }],
      policies: [], official: false,
      desc: '뮤지컬 나침반은 공식 자료가 아직 등록되지 않은 가상 공연입니다. 예매 전 예매처 공지를 직접 확인하세요.',
    },
    {
      id: 'v-starlight', title: '별빛 캠핑 페스티벌', category: '페스티벌', venue: '가상 호수공원', region: '경기',
      gp: ['#ff7a59', '#ffb347', '🏕️', 'STARLIGHT FEST'],
      showtimes: [{ id: 'v-star-1', label: '12월 12일(토) 13:00', date: '2026-12-12T13:00:00+09:00' }, { id: 'v-star-2', label: '12월 13일(일) 13:00', date: '2026-12-13T13:00:00+09:00' }],
      prices: [{ grade: '일반', price: 99000 }], policies: ['identity', 'transfer'], official: true,
      desc: '이틀간 열리는 가상 야외 페스티벌. 1일권 기준 가격입니다.',
    },
    {
      id: 'v-jazz', title: '한밤의 재즈클럽', category: '콘서트', venue: '가상 홀', region: '부산',
      gp: ['#1f2a44', '#3b4f8a', '🎷', 'MIDNIGHT JAZZ'],
      showtimes: [{ id: 'v-jazz-1', label: '11월 28일(토) 20:00', date: '2026-11-28T20:00:00+09:00' }],
      prices: [{ grade: 'R', price: 88000 }, { grade: 'S', price: 66000 }], policies: ['pickup'], official: true,
      desc: '소극장에서 즐기는 가상 재즈 공연.',
    },
    {
      id: 'v-summer', title: '연극 여름의 끝', category: '연극', venue: '가상 소극장', region: '서울',
      gp: ['#2bb3a3', '#7be0c3', '🌊', 'END OF SUMMER'],
      showtimes: [{ id: 'v-sum-1', label: '12월 3일(목) 19:30', date: '2026-12-03T19:30:00+09:00' }, { id: 'v-sum-2', label: '12월 4일(금) 19:30', date: '2026-12-04T19:30:00+09:00' }],
      prices: [{ grade: '일반', price: 45000 }], policies: [], official: false,
      desc: '두 배우가 이끄는 가상 2인극.',
    },
    {
      id: 'v-esports', title: '레이더 컵 결승전', category: '스포츠', venue: '가상 돔', region: '서울',
      gp: ['#6d28d9', '#ec4899', '🏆', 'RADAR CUP FINAL'],
      showtimes: [{ id: 'v-esp-1', label: '12월 19일(토) 15:00', date: '2026-12-19T15:00:00+09:00' }],
      prices: [{ grade: 'VIP', price: 120000 }, { grade: 'R', price: 70000 }, { grade: 'S', price: 45000 }],
      policies: ['identity', 'transfer', 'pickup'], official: true,
      desc: '가상 e스포츠 리그 결승전.',
    },
  ];
  const CATEGORIES = ['전체', '콘서트', '뮤지컬', '연극', '페스티벌', '스포츠'];

  const POSTS = [
    { id: 'p1', user: 'radar_fan', color: '#4a5bd4', eventId: 'demo-radar-live', showtime: 'demo-st-sat', grade: 'VIP', qty: 1, price: 154000, time: '12분 전', likes: 128, text: '일정이 겹쳐서 예매처 공식 양도로 원가에 넘겨요. 수수료 별도 없음!' },
    { id: 'p2', user: 'musical_lover', color: '#e5484d', eventId: 'demo-compass', showtime: 'demo-compass-1', grade: 'R', qty: 2, price: 140000, time: '1시간 전', likes: 64, text: '연석 2장 원구매가 양도합니다. 공식 양도 기능으로 바로 보내드려요.' },
    { id: 'p3', user: 'camping.j', color: '#f08c00', eventId: 'v-starlight', showtime: 'v-star-2', grade: '일반', qty: 1, price: 99000, time: '3시간 전', likes: 41, text: '일요일 1일권. 원가 그대로, 예매처 앱에서 양도 신청할게요 🏕️' },
    { id: 'p4', user: 'jazz_night', color: '#1f2a44', eventId: 'v-jazz', showtime: 'v-jazz-1', grade: 'R', qty: 1, price: 88000, time: '어제', likes: 22, text: '앞쪽 R석이에요. 원구매가 영수증 인증 완료.' },
    { id: 'p5', user: 'cup_watcher', color: '#6d28d9', eventId: 'v-esports', showtime: 'v-esp-1', grade: 'S', qty: 2, price: 45000, time: '2일 전', likes: 87, text: '친구가 못 가게 돼서 2장 원가 양도합니다.' },
  ];

  const CHECK_EXAMPLES = [
    {
      id: 'A', label: '가격 차이 · 캡처 전달',
      report: { eventId: 'demo-radar-live', showtime: '11월 21일(토) 19:00', official: 154000, price: 230000, qty: 1 },
      text: '레이더 라이브 11/21(토) 저녁 공연 VIP석 1장 양도합니다. 230,000원이고 입금 먼저 해주시면 QR 캡처 바로 보내드려요. 캡처로 입장 가능합니다.',
      price: { status: 'matched', title: '공식 가격보다 높은 판매가', quote: '230,000원', official: 'VIP석 154,000원 (예매수수료 별도)', reason: '같은 공연·회차·좌석 등급의 공식 가격보다 76,000원(49.4%) 높아요. 판매자 동의 없이 상습·영업으로 산 가격보다 비싸게 팔면 개정 공연법상 부정판매에 해당할 수 있어요. 이 글 하나만으로 위법 여부를 판정하지는 않아요.' },
      findings: [
        { status: 'conflict', title: '전달 방식이 공식 입장 안내와 다름', quote: 'QR 캡처 바로 보내드려요. 캡처로 입장 가능합니다.', reason: '공식 안내는 캡처 화면으로 입장할 수 없다고 적고 있어요. 구매 전 예매처에 입장 방법을 확인하세요.' },
        { status: 'conflict', title: '양도 제한 안내와 다른 판매 방식', quote: '1장 양도합니다', reason: '공식 안내는 제3자 양도·재판매를 제한해요. 공식 양도 절차가 있는지 예매처에 확인하세요.' },
        { status: 'unverifiable', title: '예매자 본인 확인 여부 확인 불가', quote: null, reason: '판매글에 본인 확인에 대한 설명이 없어요. 공식 안내는 예매자 본인 신분증 확인 후 입장한다고 적고 있어요.' },
        { status: 'needs_check', title: '입금 시점', quote: '입금 먼저 해주시면', reason: '입금을 먼저 요구하는 문구가 있어요. 티켓 전달 시점과 환불 조건을 확인하세요.' },
      ],
    },
    {
      id: 'B', label: '좌석 등급이 모호한 글',
      report: { eventId: 'demo-radar-live', showtime: '11월 22일(일) 17:00', official: null, price: null, qty: 2 },
      text: '레이더 라이브 일요일 공연 2층 R석인지 S석인지 헷갈리는데 좋은 자리 2장 일괄 25만원에 팝니다. 공연장 앞에서 직접 만나서 티켓 드려요.',
      price: { status: 'comparison_held', title: '가격 비교 보류', quote: '2장 일괄 25만원', official: null, reason: '좌석 등급과 1매 가격이 확인되지 않았어요. 판매자에게 좌석 등급을 확인해 보세요.' },
      findings: [
        { status: 'needs_check', title: '현장 전달과 본인 확인', quote: '공연장 앞에서 직접 만나서 티켓 드려요.', reason: '현장에서 전달받더라도 공식 안내는 예매자 본인 확인 후 입장한다고 적고 있어요.' },
        { status: 'conflict', title: '양도 제한 안내와 다른 판매 방식', quote: '2장 일괄 25만원에 팝니다', reason: '공식 안내는 제3자 양도·재판매를 제한해요. 공식 양도 절차가 있는지 확인하세요.' },
        { status: 'unverifiable', title: '입금 시점', quote: null, reason: '입금 시점에 대한 문구를 찾지 못했어요. 거래 전 확인하세요.' },
      ],
    },
    {
      id: 'C', label: '가격이 없는 글',
      report: { eventId: 'demo-radar-live', showtime: '11월 21일(토) 19:00', official: null, price: null, qty: 1 },
      text: '레이더 라이브 토요일 공연 S석 1장 팝니다. 가격은 DM 주세요.',
      price: { status: 'comparison_held', title: '가격 비교 보류', quote: '가격은 DM 주세요', official: null, reason: '판매글에 가격이 없어요. 판매자에게 1매 가격을 확인하세요.' },
      findings: [
        { status: 'unverifiable', title: '전달 방식 확인 불가', quote: null, reason: '판매글에서 전달 방식을 찾지 못했어요. 공식 안내는 캡처 화면으로 입장할 수 없다고 적고 있어요.' },
        { status: 'conflict', title: '양도 제한 안내와 다른 판매 방식', quote: 'S석 1장 팝니다', reason: '공식 안내는 제3자 양도·재판매를 제한해요.' },
        { status: 'unverifiable', title: '예매자 본인 확인 여부 확인 불가', quote: null, reason: '판매글에 본인 확인에 대한 설명이 없어요.' },
      ],
    },
  ];
  const STATUS_LABEL = { conflict: '공식 안내와 다름', needs_check: '확인 필요', matched: '대조 완료', unverifiable: '확인 불가', comparison_held: '비교 보류' };

  // ---------- 저장소 ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('tr_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('tr_' + k, JSON.stringify(v)); } catch { /* 저장 불가 환경 */ } },
  };
  const state = {
    likes: new Set(store.get('likes', [])),
    postLikes: new Set(store.get('postLikes', [])),
    saved: new Set(store.get('saved', [])),
    tickets: store.get('tickets', []),
    notiRead: store.get('notiRead', false),
    settings: store.get('settings', { push: true, marketing: false }),
    installDismissed: store.get('installDismissed', false),
    recent: store.get('recent', []),
  };
  const persist = () => {
    store.set('likes', [...state.likes]); store.set('postLikes', [...state.postLikes]); store.set('saved', [...state.saved]);
    store.set('tickets', state.tickets); store.set('notiRead', state.notiRead); store.set('settings', state.settings);
    store.set('installDismissed', state.installDismissed); store.set('recent', state.recent);
  };

  // ---------- 유틸 ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const won = (n) => n.toLocaleString('ko-KR') + '원';
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ev = (id) => EVENTS.find((e) => e.id === id);
  const minPrice = (e) => Math.min(...e.prices.map((p) => p.price));
  const vibrate = (ms = 10) => { try { navigator.vibrate && navigator.vibrate(ms); } catch { /* 지원 안 함 */ } };

  function posterHTML(e, extra = '') {
    if (e.poster) return `<img src="${e.poster}" alt="${esc(e.title)} 포스터" loading="lazy" />${extra}`;
    const [a, b, emoji, top] = e.gp;
    return `<div class="gen-poster" style="background:linear-gradient(160deg,${a},${b})"><div class="gp-top">${top}</div><div class="gp-emoji">${emoji}</div><div class="gp-title">${esc(e.title)}</div></div>${extra}`;
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
  }

  // ---------- 바텀시트 ----------
  function openSheet(html, onMount) {
    closeSheet(true);
    const root = $('#sheet-root');
    root.innerHTML = `<div class="sheet-backdrop"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sheet-grab"></div>${html}</div>`;
    $('.sheet-backdrop', root).addEventListener('click', () => closeSheet());
    // 아래로 끌어서 닫기
    const sheet = $('.sheet', root);
    let startY = null, dy = 0;
    sheet.addEventListener('touchstart', (e) => { if (sheet.scrollTop <= 0) { startY = e.touches[0].clientY; dy = 0; } }, { passive: true });
    sheet.addEventListener('touchmove', (e) => {
      if (startY == null) return;
      dy = Math.max(0, e.touches[0].clientY - startY);
      sheet.style.transform = `translate(-50%, ${dy}px)`;
    }, { passive: true });
    sheet.addEventListener('touchend', () => {
      if (startY == null) return;
      if (dy > 110) closeSheet(); else sheet.style.transform = '';
      startY = null;
    });
    document.body.style.overflow = 'hidden';
    onMount && onMount(sheet);
    return sheet;
  }
  function closeSheet(instant) {
    const root = $('#sheet-root');
    if (!root.firstChild) return;
    document.body.style.overflow = '';
    if (instant) { root.innerHTML = ''; return; }
    $$('.sheet, .sheet-backdrop', root).forEach((n) => n.classList.add('closing'));
    setTimeout(() => { root.innerHTML = ''; }, 220);
  }

  // ---------- 라우터 ----------
  const TABS = [
    { id: 'home', label: '홈', icon: 'home' },
    { id: 'explore', label: '탐색', icon: 'search' },
    { id: 'market', label: '양도', icon: 'swap' },
    { id: 'tickets', label: '내 티켓', icon: 'ticket' },
    { id: 'my', label: 'MY', icon: 'user' },
  ];
  const navStack = [];
  let lastHash = null;

  function parse() {
    const h = location.hash.replace(/^#\/?/, '') || 'home';
    const [name, arg] = h.split('/');
    return { name, arg: arg ? decodeURIComponent(arg) : null, key: h };
  }
  const go = (path) => { location.hash = '#/' + path; };
  const back = () => { if (navStack.length > 1) history.back(); else go('home'); };

  function renderTabbar(active) {
    const unused = state.tickets.filter((t) => !t.used).length;
    $('#tabbar').innerHTML = TABS.map((t) => `
      <button class="tab ${t.id === active ? 'active' : ''}" data-go="${t.id}" aria-label="${t.label}">
        ${I[t.icon + (t.id === active ? 'F' : '')]}<span>${t.label}</span>
        ${t.id === 'tickets' && unused ? `<i class="count">${unused}</i>` : ''}
      </button>`).join('');
  }

  function topbar(cfg) {
    const tb = $('#topbar');
    tb.className = cfg.overlay ? 'overlay' : '';
    if (cfg.hidden) { tb.classList.add('hidden'); return; }
    const left = cfg.back
      ? `<button class="icon-btn" data-back aria-label="뒤로">${I.back}</button>`
      : '';
    const title = cfg.logo
      ? `<img class="tb-logo" src="/icons/wordmark.png" alt="티켓레이더" />`
      : `<div class="tb-title ${cfg.back ? 'center' : ''}">${esc(cfg.title || '')}</div>`;
    const spacer = cfg.back ? '<div style="margin-right:auto"></div>' : '';
    tb.innerHTML = left + title + spacer + (cfg.right || '');
  }
  const bellBtn = () => `<button class="icon-btn" data-go="noti" aria-label="알림">${I.bell}${state.notiRead ? '' : '<i class="badge-dot"></i>'}</button>`;

  function render() {
    const r = parse();
    // 방향 계산: 스택에 이미 있으면 뒤로
    const isTab = TABS.some((t) => t.id === r.name);
    const wasTab = lastHash != null && TABS.some((t) => t.id === lastHash.split('/')[0]);
    if (lastHash != null) scrollMemo[lastHash] = window.scrollY;
    let dir = 'fwd';
    const idx = navStack.lastIndexOf(r.key);
    if (idx !== -1 && idx === navStack.length - 2) { navStack.pop(); dir = 'back'; }
    else if (r.key !== lastHash) navStack.push(r.key);
    if (isTab) { navStack.length = 0; navStack.push(r.key); if (wasTab && dir !== 'back') dir = 'tab'; }
    const first = lastHash == null;
    const same = r.key === lastHash;
    lastHash = r.key;

    const view = $('#view');
    const page = PAGES[r.name] || PAGES.home;
    const update = () => {
      $('#tabbar').classList.toggle('hidden', !isTab);
      view.classList.toggle('no-tab', !isTab);
      closeSheet(true);
      view.innerHTML = '';
      page(view, r.arg);
      if (isTab) renderTabbar(r.name);
      // 뒤로 가기·탭 이동은 보던 위치로, 새 화면은 맨 위로
      const y = (dir === 'back' || dir === 'tab') ? (scrollMemo[r.key] || 0) : 0;
      window.scrollTo(0, y);
      onScroll();
    };

    if (first || same || reduceMotion.matches) { update(); return; }

    if (document.startViewTransition) {
      const root = document.documentElement;
      root.dataset.dir = dir;
      const t = document.startViewTransition(update);
      t.finished.finally(() => { delete root.dataset.dir; clearMorph(); });
      return;
    }
    // View Transitions 미지원 브라우저: CSS 애니메이션으로 대체
    update();
    view.classList.remove('page-enter', 'page-enter-back', 'page-fade');
    void view.offsetWidth;
    view.classList.add(dir === 'back' ? 'page-enter-back' : dir === 'tab' ? 'page-fade' : 'page-enter');
  }
  const scrollMemo = {};
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  // 포스터 → 상세 화면으로 이어지는 공유 요소 전환
  function clearMorph() { $$('[data-morph]').forEach((n) => { n.style.viewTransitionName = ''; delete n.dataset.morph; }); }
  function markMorph(fromEl, eventId) {
    if (!document.startViewTransition || !fromEl) return;
    const img = fromEl.querySelector('.poster, .list-thumb, .story-ring, .post-media') || null;
    if (img) { img.style.viewTransitionName = 'poster-' + eventId; img.dataset.morph = '1'; }
  }

  // ---------- 페이지 ----------
  const PAGES = {};

  PAGES.home = (v) => {
    topbar({ logo: true, right: `<button class="icon-btn" data-go="explore" aria-label="검색">${I.search}</button>${bellBtn()}` });
    const banners = [EVENTS[0], EVENTS[1], EVENTS[5]];
    v.innerHTML = `
      <button class="searchbar" data-go="explore">${I.search}<span>공연, 공연장, 아티스트 검색</span></button>
      <div class="banner-wrap">
        <div class="banner" id="banner">
          ${banners.map((e, i) => `
            <button class="banner-item" data-go="event/${e.id}" style="${e.gp ? `background:linear-gradient(135deg,${e.gp[0]},${e.gp[1]})` : ''}">
              ${e.poster ? `<img class="bg" src="${e.poster}" alt="" />` : `<div style="position:absolute;right:20px;top:14px;font-size:64px">${e.gp[2]}</div>`}
              <div class="eyebrow">${['지금 예매 가능', '원구매가 양도 오픈', '결승 티켓 오픈'][i]} · 가상</div>
              <h3>${esc(e.title)}<br/>${minPrice(e).toLocaleString()}원부터</h3>
            </button>`).join('')}
        </div>
        <div class="banner-count"><b id="bn-idx">1</b> / ${banners.length}</div>
      </div>
      <div class="quick">
        ${[
          ['🎫', '예매하기', 'explore'], ['🔁', '원가 양도', 'market'], ['🛡️', '판매글 확인', 'check'], ['🎟️', '내 티켓', 'tickets'],
          ['🎤', '콘서트', 'explore/콘서트'], ['🎭', '뮤지컬', 'explore/뮤지컬'], ['🏕️', '페스티벌', 'explore/페스티벌'], ['❤️', '찜한 공연', 'likes'],
        ].map(([ic, l, g], i) => `<button class="quick-item" data-go="${g}"><span class="quick-icon" style="background:${['#eef0fb', '#e9f8f1', '#fff2e6', '#fdeef3', '#f1edfd', '#fdecec', '#fff7df', '#ffeef0'][i]}">${ic}</span>${l}</button>`).join('')}
      </div>
      ${installBannerHTML()}
      <section class="section">
        <div class="section-head"><h2>🔥 지금 뜨는 공연</h2><button class="more" data-go="explore">전체보기</button></div>
        <div class="h-scroll">
          ${EVENTS.map((e, i) => posterCard(e, i + 1)).join('')}
        </div>
      </section>
      <div class="divider"></div>
      <section class="section">
        <div class="section-head"><h2>원구매가 양도 새 글</h2><button class="more" data-go="market">더보기</button></div>
        ${POSTS.slice(0, 3).map((p) => {
          const e = ev(p.eventId); const st = e.showtimes.find((s) => s.id === p.showtime);
          return `<button class="list-item" data-go="event/${e.id}">
            <div class="list-thumb">${posterHTML(e)}</div>
            <div class="list-body">
              <div class="t">${esc(e.title)} · ${p.grade}석 ${p.qty}매</div>
              <div class="s">${st.label} · ${esc(e.venue)}</div>
              <div class="p"><span class="price">${won(p.price)}</span><span class="tag-ok">✓ 원구매가</span></div>
              <div class="s">@${p.user} · ${p.time}</div>
            </div></button>`;
        }).join('')}
      </section>
      <div class="divider"></div>
      <section class="section" style="padding-left:0;padding-right:0">
        <button class="info-card" data-go="check">
          <div class="ic">🛡️</div>
          <div><b>양도 판매글, 사기 전에 확인하세요</b><span>공식 가격·입장 규정과 자동으로 대조해 드려요</span></div>
        </button>
      </section>
      <p class="footer-note">티켓레이더 앱의 모든 공연, 가격, 거래, 결제는 시연용 가상 데이터입니다. 실제 티켓이 발급되거나 결제되지 않아요.</p>
    `;
    // 배너 자동 슬라이드 + 인덱스
    const bn = $('#banner', v);
    let cur = 0;
    bn.addEventListener('scroll', () => {
      cur = Math.round(bn.scrollLeft / bn.clientWidth);
      const el = $('#bn-idx'); if (el) el.textContent = cur + 1;
    }, { passive: true });
    const timer = setInterval(() => {
      if (!document.body.contains(bn)) return clearInterval(timer);
      if (document.hidden) return;
      cur = (cur + 1) % banners.length;
      bn.scrollTo({ left: cur * (bn.clientWidth + 10) - 0, behavior: 'smooth' });
    }, 4000);
    bindInstallBanner(v);
  };

  function posterCard(e, rank) {
    const liked = state.likes.has(e.id);
    return `<button class="poster-card" data-go="event/${e.id}">
      <div class="poster">${posterHTML(e, `${rank ? `<span class="rank">${rank}</span>` : ''}<span class="heart-mini" data-like="${e.id}" role="button" aria-label="찜하기">${liked ? I.heartRed : I.heartW}</span>`)}</div>
      <div class="t">${esc(e.title)}</div>
      <div class="s">${esc(e.venue)} · ${e.showtimes[0].label.split(' ')[0]} ${e.showtimes[0].label.split(' ')[1]}</div>
      <div class="p"><span class="price">${minPrice(e).toLocaleString()}원~</span></div>
    </button>`;
  }

  PAGES.explore = (v, cat) => {
    topbar({ title: '탐색' });
    let active = CATEGORIES.includes(cat) ? cat : '전체';
    let q = '';
    v.innerHTML = `
      <div class="search-input-wrap"><input class="search-input" type="search" placeholder="공연명, 공연장, 지역 검색" aria-label="검색어" /></div>
      <div style="padding:0 16px"><div class="chip-row" id="cats">${CATEGORIES.map((c) => `<button class="chip ${c === active ? 'on' : ''}" data-cat="${c}">${c}</button>`).join('')}</div></div>
      ${state.recent.length ? `<div class="section" style="padding-top:16px"><div class="section-head"><h2 style="font-size:15px">최근 본 공연</h2><button class="more" id="clear-recent">지우기</button></div><div class="chip-row">${state.recent.map((id) => ev(id)).filter(Boolean).map((e) => `<button class="chip" data-go="event/${e.id}">${esc(e.title)}</button>`).join('')}</div></div>` : ''}
      <div id="results"></div>`;
    const draw = () => {
      const list = EVENTS.filter((e) => (active === '전체' || e.category === active) && (!q || (e.title + e.venue + e.region + e.category).toLowerCase().includes(q.toLowerCase())));
      $('#results', v).innerHTML = list.length
        ? `<div class="grid2">${list.map((e) => posterCard(e)).join('')}</div>`
        : `<div class="empty"><div class="e">🔍</div><b>검색 결과가 없어요</b>다른 검색어나 카테고리를 선택해 보세요</div>`;
    };
    $('#cats', v).addEventListener('click', (e) => {
      const b = e.target.closest('[data-cat]'); if (!b) return;
      active = b.dataset.cat; $$('.chip', $('#cats', v)).forEach((c) => c.classList.toggle('on', c === b)); draw();
    });
    $('.search-input', v).addEventListener('input', (e) => { q = e.target.value.trim(); draw(); });
    const cr = $('#clear-recent', v); if (cr) cr.addEventListener('click', () => { state.recent = []; persist(); render(); });
    draw();
  };

  PAGES.likes = (v) => {
    topbar({ back: true, title: '찜한 공연' });
    const list = EVENTS.filter((e) => state.likes.has(e.id));
    v.innerHTML = list.length ? `<div class="grid2">${list.map((e) => posterCard(e)).join('')}</div>`
      : `<div class="empty"><div class="e">🤍</div><b>아직 찜한 공연이 없어요</b>포스터의 하트를 눌러 찜해 보세요</div>`;
  };

  PAGES.market = (v) => {
    topbar({ title: '원가 양도', right: `<button class="icon-btn" data-go="check" aria-label="판매글 확인">${I.plus}</button>${bellBtn()}` });
    v.innerHTML = `
      <div class="stories">
        ${EVENTS.map((e, i) => `<button class="story" data-go="event/${e.id}"><div class="story-ring ${i > 3 ? 'seen' : ''}"><div>${e.poster ? `<img src="${e.poster}" alt="" />` : e.gp[2]}</div></div><span>${esc(e.title)}</span></button>`).join('')}
      </div>
      ${lawCardHTML(false)}
      ${POSTS.map(postHTML).join('')}
      <p class="footer-note">원가 양도 피드는 시연용 가상 글입니다. 실제 거래 전에는 예매처 공식 양도 기능을 이용하세요.</p>
      <button class="fab" data-go="check">${I.plus}판매글 확인</button>`;
    // 더블탭 좋아요
    $$('.post-media', v).forEach((m) => {
      let last = 0;
      m.addEventListener('click', () => {
        const now = Date.now();
        if (now - last < 300) { likePost(m.dataset.post, true); const h = $('.heart-burst', m); h.classList.remove('go'); void h.offsetWidth; h.classList.add('go'); vibrate(15); }
        last = now;
      });
    });
  };

  function postHTML(p) {
    const e = ev(p.eventId); const st = e.showtimes.find((s) => s.id === p.showtime);
    const liked = state.postLikes.has(p.id); const saved = state.saved.has(p.id);
    const official = e.prices.find((x) => x.grade === p.grade)?.price;
    return `<article class="post" data-pid="${p.id}">
      <div class="post-head">
        <div class="avatar" style="background:${p.color}">${p.user[0].toUpperCase()}</div>
        <div class="who"><b>${p.user} ${I.verified}</b><span>${esc(e.venue)} · ${st.label}</span></div>
        <button class="icon-btn" data-post-more="${p.id}" aria-label="더보기">${I.more}</button>
      </div>
      <div class="post-media" data-post="${p.id}">
        ${posterHTML(e)}
        <div class="heart-burst">${I.heartBig}</div>
        <div class="post-price-tag">${p.grade}석 ${p.qty}매 · <b class="price">${won(p.price)}</b></div>
      </div>
      <div class="post-actions">
        <button class="icon-btn ${liked ? 'liked' : ''}" data-plike="${p.id}" aria-label="좋아요">${I.heart}</button>
        <button class="icon-btn" data-go="event/${e.id}" aria-label="공연 보기">${I.chat}</button>
        <button class="icon-btn" data-share="${e.id}" aria-label="공유">${I.send}</button>
        <div class="spacer"></div>
        <button class="icon-btn" data-save="${p.id}" aria-label="저장">${saved ? I.bookmarkF : I.bookmark}</button>
      </div>
      <div class="post-body">
        <div class="likes">좋아요 ${(p.likes + (liked ? 1 : 0)).toLocaleString()}개</div>
        <b>${p.user}</b> ${esc(p.text)}
        <div><span class="cmp">✓ 공식가 ${official ? won(official) : '-'}과 동일 · 원구매가</span></div>
        <div class="time">${p.time}</div>
      </div>
    </article>`;
  }

  function likePost(id, forceOn) {
    const on = forceOn ? true : !state.postLikes.has(id);
    on ? state.postLikes.add(id) : state.postLikes.delete(id);
    persist();
    const art = $(`.post[data-pid="${id}"]`);
    if (art) {
      const p = POSTS.find((x) => x.id === id);
      const btn = $('[data-plike]', art); btn.classList.toggle('liked', on);
      $('.likes', art).textContent = `좋아요 ${(p.likes + (on ? 1 : 0)).toLocaleString()}개`;
    }
  }

  PAGES.event = (v, id) => {
    const e = ev(id);
    if (!e) return PAGES.home(v);
    state.recent = [id, ...state.recent.filter((x) => x !== id)].slice(0, 6); persist();
    topbar({ back: true, overlay: true, title: e.title, right: `<button class="icon-btn" data-share="${e.id}" aria-label="공유">${I.share}</button>` });
    const liked = state.likes.has(e.id);
    const bg = e.poster ? `background-image:url(${e.poster})` : `background:linear-gradient(160deg,${e.gp[0]},${e.gp[1]})`;
    const transfers = POSTS.filter((p) => p.eventId === e.id);
    v.innerHTML = `
      <div class="detail-hero"><div class="blur" style="${bg}"></div><div class="front" style="view-transition-name:poster-${e.id}">${posterHTML(e)}</div></div>
      <div class="detail-body">
        <span class="demo-tag">${e.category} · 가상 공연</span>
        <h1>${esc(e.title)}</h1>
        <div class="meta-row">${I.pin}${esc(e.venue)} · ${e.region}</div>
        <div class="meta-row">${I.cal}${e.showtimes.map((s) => s.label).join(' / ')}</div>
        <div class="section-head" style="margin-top:26px"><h2 style="font-size:17px">좌석 가격</h2><span class="small muted">예매수수료 별도</span></div>
        <div class="price-table">
          ${e.prices.map((p) => `<div class="row"><span><i class="grade-dot" style="background:${GRADE_COLOR[p.grade] || '#999'}"></i>${p.grade}석</span><b class="price">${won(p.price)}</b></div>`).join('')}
        </div>
        ${transfers.length ? `
          <div class="section-head" style="margin-top:26px"><h2 style="font-size:17px">원구매가 양도 ${transfers.length}건</h2><button class="more" data-go="market">피드 보기</button></div>
          ${transfers.map((p) => `<div class="list-item" style="padding:10px 0"><div class="avatar" style="background:${p.color}">${p.user[0].toUpperCase()}</div><div class="list-body"><div class="t" style="font-size:14px">${p.grade}석 ${p.qty}매 · ${won(p.price)}</div><div class="s">@${p.user} · ${p.time}</div></div><span class="tag-ok">원가</span></div>`).join('')}` : ''}
        <div style="margin-top:26px">
          <details class="accordion" open><summary>공연 소개</summary><p>${esc(e.desc)}</p></details>
          ${e.policies.length
            ? e.policies.map((k) => `<details class="accordion"><summary>${POLICIES[k].title}</summary><p>${POLICIES[k].text}<br/><span class="small">출처: ${OFFICIAL_NOTICE}</span></p></details>`).join('')
            : `<details class="accordion"><summary>입장·양도 규정</summary><p>공식 규정 자료가 아직 등록되지 않았어요. 예매처 공지를 직접 확인하세요.</p></details>`}
        </div>
      </div>
      <div class="cta-bar">
        <button class="heart-btn" data-like="${e.id}" aria-label="찜하기">${liked ? I.heartRed : I.heart}</button>
        <button class="btn btn-primary" id="book-btn">예매하기</button>
      </div>`;
    $('#book-btn', v).addEventListener('click', () => openBooking(e));
  };

  // ---------- 예매 플로우 ----------
  function openBooking(e) {
    const sel = { st: e.showtimes[0].id, grade: e.prices[0].grade, qty: 1, pay: 'card' };
    const draw = (sheet) => {
      const price = e.prices.find((p) => p.grade === sel.grade).price;
      const fee = 2000 * sel.qty;
      sheet.innerHTML = `<div class="sheet-grab"></div>
        <h3>${esc(e.title)}</h3><div class="small muted">가상 예매 · 실제 결제되지 않아요</div>
        <div class="step-label">회차 선택</div>
        <div class="opt-list">${e.showtimes.map((s) => `<button class="opt ${s.id === sel.st ? 'on' : ''}" data-st="${s.id}"><span>${s.label}</span><small>${esc(e.venue)}</small></button>`).join('')}</div>
        <div class="step-label">좌석 등급</div>
        <div class="opt-list">${e.prices.map((p) => `<button class="opt ${p.grade === sel.grade ? 'on' : ''}" data-grade="${p.grade}"><span><i class="grade-dot" style="background:${GRADE_COLOR[p.grade] || '#999'}"></i>${p.grade}석</span><b class="price">${won(p.price)}</b></button>`).join('')}</div>
        <div class="step-label" style="display:flex;justify-content:space-between;align-items:center">매수 <span class="stepper"><button data-qty="-1" ${sel.qty <= 1 ? 'disabled' : ''} aria-label="한 장 빼기">−</button><span>${sel.qty}</span><button data-qty="1" ${sel.qty >= 4 ? 'disabled' : ''} aria-label="한 장 더하기">+</button></span></div>
        <div class="step-label">결제 수단 (가상)</div>
        <div class="pay-methods">${[['card', '💳', '카드'], ['toss', '💙', '간편결제'], ['bank', '🏦', '계좌이체']].map(([k, ic, l]) => `<button class="opt ${sel.pay === k ? 'on' : ''}" data-pay="${k}"><span>${ic}</span>${l}</button>`).join('')}</div>
        <div class="total-row"><span class="muted">티켓 ${won(price)} × ${sel.qty} + 수수료 ${won(fee)}</span></div>
        <div class="total-row" style="margin-top:-8px"><b>총 결제금액</b><span class="price">${won(price * sel.qty + fee)}</span></div>
        <button class="btn btn-primary btn-block" id="pay-btn">${won(price * sel.qty + fee)} 가상 결제하기</button>`;
    };
    openSheet('', (sheet) => {
      draw(sheet);
      sheet.addEventListener('click', (evt) => {
        const b = evt.target.closest('button'); if (!b) return;
        if (b.dataset.st) sel.st = b.dataset.st;
        else if (b.dataset.grade) sel.grade = b.dataset.grade;
        else if (b.dataset.qty) sel.qty = Math.min(4, Math.max(1, sel.qty + Number(b.dataset.qty)));
        else if (b.dataset.pay) sel.pay = b.dataset.pay;
        else if (b.id === 'pay-btn') return pay(sheet);
        else if (b.id === 'see-ticket') { closeSheet(); return go('tickets'); }
        else if (b.id === 'close-done') return closeSheet();
        else return;
        vibrate(5); draw(sheet);
      });
    });
    function pay(sheet) {
      sheet.innerHTML = `<div class="sheet-grab"></div><div class="scanning"><div class="radar"></div><b>가상 결제 진행 중…</b><div class="small muted" style="margin-top:6px">실제 결제는 이루어지지 않아요</div></div>`;
      setTimeout(() => {
        const st = e.showtimes.find((s) => s.id === sel.st);
        const price = e.prices.find((p) => p.grade === sel.grade).price;
        const t = {
          id: 'T' + Date.now().toString(36).toUpperCase(), eventId: e.id, showtimeId: st.id, label: st.label, date: st.date,
          grade: sel.grade, qty: sel.qty, price, seat: `${sel.grade}구역 ${String.fromCharCode(65 + Math.floor(Math.random() * 8))}열 ${10 + Math.floor(Math.random() * 20)}번${sel.qty > 1 ? ` 외 ${sel.qty - 1}석` : ''}`,
          bookedAt: Date.now(), used: false,
        };
        state.tickets.unshift(t); state.notiRead = false; persist();
        vibrate([20, 40, 20]);
        sheet.innerHTML = `<div class="sheet-grab"></div><div class="done">
          <div class="check-anim">${I.check}</div>
          <h3>예매가 완료됐어요</h3>
          <p class="muted">${esc(e.title)}<br/>${st.label} · ${t.seat}</p>
          <div style="display:grid;gap:8px;margin-top:20px">
            <button class="btn btn-primary btn-block" id="see-ticket">내 티켓 보기</button>
            <button class="btn btn-ghost btn-block" id="close-done">닫기</button>
          </div></div>`;
      }, 1400);
    }
  }

  PAGES.tickets = (v, tab) => {
    topbar({ title: '내 티켓', right: bellBtn() });
    const mode = tab === 'past' ? 'past' : 'up';
    const list = state.tickets.filter((t) => (mode === 'past' ? t.used : !t.used));
    v.innerHTML = `
      <div class="seg"><button class="${mode === 'up' ? 'on' : ''}" data-go="tickets">예정된 공연 ${state.tickets.filter((t) => !t.used).length}</button><button class="${mode === 'past' ? 'on' : ''}" data-go="tickets/past">지난 공연</button></div>
      ${list.length ? list.map((t) => {
        const e = ev(t.eventId);
        const dday = Math.ceil((new Date(t.date) - Date.now()) / 86400000);
        return `<button class="ticket ${t.used ? 'used' : ''}" data-go="ticket/${t.id}">
          <div class="ticket-top">${e.poster ? `<img src="${e.poster}" alt="" />` : `<div style="width:64px;height:86px;border-radius:8px;overflow:hidden;flex:none">${posterHTML(e)}</div>`}
            <div><span class="demo-tag" style="background:rgba(255,255,255,.18);color:#fff">${t.used ? '사용 완료' : dday > 0 ? 'D-' + dday : dday === 0 ? 'D-DAY' : '지난 공연'}</span><div class="tt" style="margin-top:6px">${esc(e.title)}</div><div class="ts">${t.label}</div><div class="ts">${esc(e.venue)}</div></div></div>
          <div class="ticket-cut"></div>
          <div class="ticket-bottom"><div>좌석<b>${t.seat}</b></div><div style="text-align:right">매수<b>${t.qty}매</b></div></div>
        </button>`;
      }).join('') : `<div class="empty"><div class="e">🎟️</div><b>${mode === 'up' ? '예매한 티켓이 없어요' : '지난 공연이 없어요'}</b>${mode === 'up' ? '마음에 드는 공연을 예매해 보세요<div style="margin-top:18px"><button class="btn btn-primary" data-go="explore">공연 둘러보기</button></div>' : ''}</div>`}
    `;
  };

  PAGES.ticket = (v, id) => {
    const t = state.tickets.find((x) => x.id === id);
    if (!t) return go('tickets');
    const e = ev(t.eventId);
    topbar({ back: true, title: '모바일 티켓' });
    v.innerHTML = `
      <div class="ticket-full"><div class="card">
        <div class="head"><span class="demo-tag" style="background:rgba(255,255,255,.18);color:#fff">가상 티켓</span><h2>${esc(e.title)}</h2><div style="opacity:.85;font-size:14px">${t.label} · ${esc(e.venue)}</div></div>
        <div class="qr-box">
          <canvas class="qr" width="29" height="29" aria-label="입장 코드 (가상)"></canvas>
          <div class="watermark"><span>SAMPLE</span></div>
          <div class="timer-bar"><i style="width:100%"></i></div>
          <div class="small muted" id="qr-timer">30초마다 코드가 바뀌어요 · 캡처로는 입장할 수 없어요</div>
        </div>
        <div class="kv">
          <div>좌석<b>${t.seat}</b></div><div>등급 · 매수<b>${t.grade}석 · ${t.qty}매</b></div>
          <div>예매번호<b>${t.id}</b></div><div>결제금액<b>${won(t.price * t.qty + 2000 * t.qty)}</b></div>
        </div>
      </div>
      <div style="display:grid;gap:8px;margin-top:16px">
        <button class="btn btn-ghost btn-block" id="use-btn">${t.used ? '사용 취소 (시연)' : '입장 처리 (시연)'}</button>
        <button class="btn btn-ghost btn-block" id="del-btn" style="color:var(--bad)">예매 취소</button>
      </div></div>`;
    const cv = $('.qr', v);
    const drawQR = (seed) => {
      const c = cv.getContext('2d'); const n = 29;
      c.fillStyle = '#fff'; c.fillRect(0, 0, n, n);
      let s = 0; for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
      const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
      c.fillStyle = '#15171c';
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (rnd() > 0.52) c.fillRect(x, y, 1, 1);
      const finder = (x, y) => { c.fillStyle = '#fff'; c.fillRect(x - 1, y - 1, 9, 9); c.fillStyle = '#15171c'; c.fillRect(x, y, 7, 7); c.fillStyle = '#fff'; c.fillRect(x + 1, y + 1, 5, 5); c.fillStyle = '#15171c'; c.fillRect(x + 2, y + 2, 3, 3); };
      finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
    };
    let left = 30;
    const tick = () => {
      if (!document.body.contains(cv)) return clearInterval(iv);
      left--; if (left <= 0) { left = 30; drawQR(t.id + Date.now()); }
      const bar = $('.timer-bar i', v); if (bar) bar.style.width = (left / 30 * 100) + '%';
    };
    drawQR(t.id + Date.now());
    const iv = setInterval(tick, 1000);
    $('#use-btn', v).addEventListener('click', () => { t.used = !t.used; persist(); toast(t.used ? '입장 처리했어요 (시연)' : '사용 취소했어요'); back(); });
    $('#del-btn', v).addEventListener('click', () => {
      openSheet(`<h3>예매를 취소할까요?</h3><p class="muted" style="margin:8px 0 20px">가상 예매라 실제 환불은 없어요. 티켓이 목록에서 사라집니다.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button class="btn btn-ghost" id="no">아니요</button><button class="btn btn-primary" id="yes" style="background:var(--bad)">취소하기</button></div>`, (sh) => {
        $('#no', sh).onclick = () => closeSheet();
        $('#yes', sh).onclick = () => { state.tickets = state.tickets.filter((x) => x.id !== t.id); persist(); closeSheet(true); toast('예매를 취소했어요'); go('tickets'); };
      });
    });
  };

  // ---------- 법 안내 (2026.8.28 시행 개정 공연법·국민체육진흥법) ----------
  const lawCardHTML = (open) => `<details class="law-card" ${open ? 'open' : ''}>
    <summary>⚖️ 티켓 양도, 법적으로 괜찮을까?</summary>
    <ul>
      <li><b>내가 산 가격 이하로 양도</b>하는 건 부정판매가 아니에요. 매수(1장/2장)를 법으로 제한하지도 않아요.</li>
      <li>판매자(예매처·기획사) 동의 없이 <b>상습·영업으로 산 가격보다 비싸게</b> 팔거나 알선하면 부정판매예요.</li>
      <li>매크로 등으로 시스템을 우회해 <b>되팔 목적으로 사는 것</b>은 부정구매예요.</li>
      <li>위반하면 1년 이하 징역 또는 1천만 원 이하 벌금, 부정판매는 판매금액의 최대 50배 과징금까지 받을 수 있어요.</li>
      <li>법과 별개로 <b>공연마다 예매처 약관</b>이 양도를 막거나 매수·횟수를 제한할 수 있어요. 본인 확인 공연은 공식 양도 기능만 쓰세요.</li>
    </ul>
    <span class="small">2026년 8월 28일 시행 개정 공연법·국민체육진흥법 기준 요약이에요. 법률 자문이 아니에요.</span><br/>
    <a href="https://www.culture.go.kr/singo/" target="_blank" rel="noopener noreferrer">문화체육관광부 안내 보기 ↗</a>
  </details>`;

  // ---------- 신고 준비 ----------
  const REPORT_CENTERS = [
    ['공연·스포츠 통합 신고 안내', 'https://www.culture.go.kr/singo/', '🏛️'],
    ['공연 분야 신고센터', 'https://ent.kocca.kr/ticket/receive.do', '🎭'],
    ['스포츠 분야 신고센터', 'https://cleanpass.kspo.or.kr', '🏟️'],
  ];
  function reportText(info, link) {
    const e = ev(info.eventId);
    return [
      info.demo ? '[시연 데이터 · 실제 신고에 사용하지 마세요]' : '[신고 전 직접 확인할 내용]',
      `공연명: ${e.title}`,
      `공연일시: ${info.showtime || '확인 불가'}`,
      `공식 가격: ${info.official == null ? '확인 불가' : won(info.official)}`,
      `판매가(1매): ${info.price == null ? '확인 불가' : won(info.price)}`,
      `수량: ${info.qty == null ? '확인 불가' : info.qty + '매'}`,
      `판매글 링크: ${link.trim() || '직접 입력 필요'}`,
    ].join('\n');
  }
  function reportCardHTML(info) {
    return `<section class="report-card" aria-labelledby="report-title">
      <div class="rc-head"><span class="rc-ic">🚨</span><div><h3 id="report-title">신고 전 내용 정리</h3><p>확인한 사실을 직접 검토한 뒤 해당 기관에 신고해 주세요. 티켓레이더가 신고를 제출하지는 않아요.</p></div></div>
      ${info.demo ? '<div class="rc-warn">시연 결과는 실제 신고에 사용하지 마세요.</div>' : ''}
      <label class="rc-label">판매글 링크 (선택)<input class="rc-link" type="url" inputmode="url" placeholder="https://" /></label>
      <pre class="rc-preview"></pre>
      <div class="rc-actions">
        <button class="btn btn-primary" data-rc-copy>📋 신고 준비 내용 복사</button>
        <button class="btn btn-ghost" data-rc-print>🖨️ 인쇄·PDF</button>
      </div>
      <div class="rc-centers">
        ${REPORT_CENTERS.map(([l, u, ic]) => `<a class="menu-row" href="${u}" target="_blank" rel="noopener noreferrer"><span class="mi">${ic}</span><span class="label">${l}</span><span class="val">↗</span></a>`).join('')}
      </div>
      <p class="rc-note">신고 조건과 제출 후 변경 가능 여부는 각 신고센터에서 확인해 주세요. 복사한 내용에 개인정보가 없는지 살펴보세요.</p>
    </section>`;
  }
  function bindReport(root, info) {
    const link = $('.rc-link', root), pre = $('.rc-preview', root);
    const upd = () => { pre.textContent = reportText(info, link.value); };
    link.addEventListener('input', upd); upd();
    $('[data-rc-copy]', root).addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(reportText(info, link.value)); toast('신고 준비 내용을 복사했어요'); vibrate(10); }
      catch { toast('복사하지 못했어요. 클립보드 권한을 확인해 주세요.'); }
    });
    $('[data-rc-print]', root).addEventListener('click', () => {
      document.body.classList.add('printing-report');
      root.classList.add('print-target');
      const done = () => { document.body.classList.remove('printing-report'); root.classList.remove('print-target'); window.removeEventListener('afterprint', done); };
      window.addEventListener('afterprint', done);
      window.print();
      setTimeout(done, 1000);
    });
  }
  function openReportSheet(info) {
    openSheet(reportCardHTML(info), (sh) => bindReport(sh, info));
  }

  PAGES.check = (v) => {
    topbar({ back: true, title: '판매글 확인' });
    v.innerHTML = `
      <div class="check-wrap">
        <p class="muted" style="margin:4px 0 14px;font-size:14px;line-height:1.55">양도 판매글을 붙여넣으면 <b style="color:var(--text)">공식 가격·입장 규정</b>과 대조해 확인할 점을 알려드려요.</p>
        <div class="small muted" style="font-weight:700;margin-bottom:8px">예시 판매글로 해보기</div>
        <div class="chip-row" style="margin-bottom:12px">${CHECK_EXAMPLES.map((x) => `<button class="chip" data-ex="${x.id}">${x.label}</button>`).join('')}</div>
        <textarea id="listing" placeholder="예) 레이더 라이브 토요일 VIP석 1장 양도합니다…" aria-label="판매글"></textarea>
        <button class="btn btn-primary btn-block" id="run" style="margin-top:12px" disabled>확인하기</button>
        <div id="result"></div>
      </div>
      ${lawCardHTML(false)}`;
    const ta = $('#listing', v), run = $('#run', v);
    let picked = null;
    ta.addEventListener('input', () => { run.disabled = !ta.value.trim(); picked = CHECK_EXAMPLES.find((x) => x.text === ta.value.trim()) || null; });
    $$('[data-ex]', v).forEach((b) => b.addEventListener('click', () => {
      picked = CHECK_EXAMPLES.find((x) => x.id === b.dataset.ex);
      ta.value = picked.text; run.disabled = false;
      $$('[data-ex]', v).forEach((c) => c.classList.toggle('on', c === b));
    }));
    run.addEventListener('click', () => {
      const out = $('#result', v);
      out.innerHTML = `<div class="scanning"><div class="radar"></div><b>공식 자료와 대조 중…</b></div>`;
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        if (!picked) {
          out.innerHTML = `<div class="finding" style="margin-top:18px"><div class="ft"><span class="status st-unverifiable">시연 모드</span>직접 입력한 글</div><p>시연 모드에서는 예시 판매글에만 미리 준비된 결과가 있어요. 직접 입력한 글은 API 연결 후 분석됩니다. 위의 예시 판매글을 눌러 체험해 보세요.</p></div>`;
          return;
        }
        const all = [picked.price, ...picked.findings];
        const cnt = (s) => all.filter((f) => f.status === s).length;
        out.innerHTML = `
          <div class="summary-card">
            <div><b style="color:var(--bad)">${cnt('conflict')}</b>공식 안내와 다름</div>
            <div><b style="color:var(--warn)">${cnt('needs_check')}</b>확인 필요</div>
            <div><b>${cnt('unverifiable') + cnt('comparison_held')}</b>확인 불가·보류</div>
          </div>
          ${all.map((f) => `<div class="finding">
            <div class="ft"><span class="status st-${f.status}">${STATUS_LABEL[f.status]}</span>${esc(f.title)}</div>
            ${f.quote ? `<blockquote>“${esc(f.quote)}”</blockquote>` : ''}
            ${f.official ? `<p><b style="color:var(--text)">공식 자료</b> · ${esc(f.official)}</p>` : ''}
            <p>${esc(f.reason)}</p></div>`).join('')}
          <p class="footer-note" style="padding:16px 0 0">결과는 판매글과 공식 자료의 문구를 대조한 참고 정보예요. 티켓의 진위나 거래 안전을 보장하지 않아요.</p>
          ${reportCardHTML({ ...picked.report, demo: true })}`;
        bindReport($('.report-card', out), { ...picked.report, demo: true });
        vibrate(10);
      }, 1200);
    });
  };

  PAGES.noti = (v) => {
    topbar({ back: true, title: '알림' });
    const items = [
      ...state.tickets.slice(0, 3).map((t) => ['🎟️', '예매 완료', `${ev(t.eventId).title} ${t.label} 티켓이 발급됐어요.`, '방금']),
      ['🔁', '찜한 공연 양도 글', '레이더 라이브 2026 VIP석 원구매가 양도 글이 올라왔어요.', '12분 전'],
      ['🛡️', '판매글 확인 팁', '캡처 전달·선입금을 요구하는 글은 꼭 확인하세요.', '어제'],
      ['🎉', '티켓레이더 앱 오픈', '홈 화면에 추가하고 앱처럼 사용해 보세요.', '3일 전'],
    ];
    const wasUnread = !state.notiRead;
    state.notiRead = true; persist();
    v.innerHTML = items.map((n, i) => `<div class="noti ${wasUnread && i < 2 ? 'unread' : ''}"><div class="ic">${n[0]}</div><div><b>${n[1]}</b><p>${esc(n[2])}</p><span>${n[3]}</span></div></div>`).join('');
  };

  PAGES.my = (v) => {
    topbar({ title: 'MY', right: bellBtn() });
    const s = state.settings;
    v.innerHTML = `
      <div class="profile"><div class="avatar">🎧</div><div><b>게스트님</b><span>시연 계정 · 가상 데이터</span></div></div>
      <div class="stat-row">
        <button data-go="tickets"><b>${state.tickets.length}</b>예매</button>
        <button data-go="likes"><b>${state.likes.size}</b>찜</button>
        <button data-go="market"><b>${state.saved.size}</b>저장한 양도</button>
      </div>
      ${installBannerHTML(true)}
      <div class="menu-list">
        <div class="menu-group-title">서비스</div>
        <button class="menu-row" data-go="tickets"><span class="mi">🎟️</span><span class="label">예매 내역</span><span class="chev"></span></button>
        <button class="menu-row" data-go="likes"><span class="mi">❤️</span><span class="label">찜한 공연</span><span class="val">${state.likes.size}</span><span class="chev"></span></button>
        <button class="menu-row" data-go="check"><span class="mi">🛡️</span><span class="label">판매글 확인</span><span class="chev"></span></button>
        <div class="menu-group-title">설정</div>
        <button class="menu-row" data-toggle="push"><span class="mi">🔔</span><span class="label">공연 알림 받기</span><span class="switch ${s.push ? 'on' : ''}"></span></button>
        <button class="menu-row" data-toggle="marketing"><span class="mi">📣</span><span class="label">이벤트 소식 받기</span><span class="switch ${s.marketing ? 'on' : ''}"></span></button>
        <button class="menu-row" id="install-row"><span class="mi">📲</span><span class="label">홈 화면에 앱 추가</span><span class="val">${isStandalone() ? '설치됨' : ''}</span><span class="chev"></span></button>
        <div class="menu-group-title">정보</div>
        <a class="menu-row" href="https://ticketradar.month32.workers.dev/" target="_blank" rel="noopener"><span class="mi">🌐</span><span class="label">웹 버전 열기</span><span class="chev"></span></a>
        <button class="menu-row" id="reset-row"><span class="mi">🧹</span><span class="label">시연 데이터 초기화</span><span class="chev"></span></button>
        <div class="menu-row" style="color:var(--text-3);font-size:13px"><span class="mi">ℹ️</span><span class="label">버전 1.0.0</span></div>
      </div>
      <p class="footer-note">티켓레이더 앱은 시연용입니다. 모든 공연, 거래, 결제 정보는 가상이며 이 기기에만 저장돼요.</p>`;
    $$('[data-toggle]', v).forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.toggle; s[k] = !s[k]; persist(); $('.switch', b).classList.toggle('on', s[k]); vibrate(5);
    }));
    $('#install-row', v).addEventListener('click', promptInstall);
    $('#reset-row', v).addEventListener('click', () => {
      openSheet(`<h3>시연 데이터를 초기화할까요?</h3><p class="muted" style="margin:8px 0 20px">예매한 티켓, 찜, 저장 기록이 모두 지워져요.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button class="btn btn-ghost" id="no">취소</button><button class="btn btn-primary" id="yes">초기화</button></div>`, (sh) => {
        $('#no', sh).onclick = () => closeSheet();
        $('#yes', sh).onclick = () => {
          state.likes.clear(); state.postLikes.clear(); state.saved.clear(); state.tickets = []; state.recent = []; state.notiRead = false; persist();
          closeSheet(true); toast('초기화했어요'); render();
        };
      });
    });
    bindInstallBanner(v);
  };

  // ---------- 설치(PWA) ----------
  let deferredPrompt = null;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e;
    if (parse().name === 'home' && !$('.install-banner')) render();
  });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; toast('홈 화면에 추가됐어요!'); state.installDismissed = true; persist(); });

  function installBannerHTML(force) {
    if (isStandalone()) return '';
    if (!force && (state.installDismissed || !(deferredPrompt || isIOS))) return '';
    if (force && !(deferredPrompt || isIOS)) return '';
    return `<div class="install-banner"><img src="/icons/icon-192.png" alt="" />
      <div class="txt"><b>앱으로 더 편하게</b>홈 화면에 추가하면 앱처럼 열려요</div>
      <button class="btn btn-primary" data-install>설치</button>${force ? '' : '<button class="x" data-install-x aria-label="닫기">×</button>'}</div>`;
  }
  function bindInstallBanner(v) {
    $$('[data-install]', v).forEach((b) => b.addEventListener('click', promptInstall));
    $$('[data-install-x]', v).forEach((b) => b.addEventListener('click', () => { state.installDismissed = true; persist(); b.closest('.install-banner').remove(); }));
  }
  async function promptInstall() {
    if (isStandalone()) return toast('이미 앱으로 실행 중이에요');
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (outcome === 'accepted') { state.installDismissed = true; persist(); }
      return;
    }
    const ios = isIOS;
    openSheet(`<h3>홈 화면에 추가하기</h3>
      <div style="margin:14px 0 20px;font-size:15px;line-height:1.9">
        ${ios
          ? '1. Safari 하단의 <b>공유 버튼</b>(□↑)을 누르세요<br/>2. <b>홈 화면에 추가</b>를 선택하세요<br/>3. 오른쪽 위 <b>추가</b>를 누르면 끝!'
          : '1. 브라우저 메뉴(⋮)를 누르세요<br/>2. <b>앱 설치</b> 또는 <b>홈 화면에 추가</b>를 선택하세요<br/>3. 홈 화면의 티켓레이더 아이콘으로 실행하세요'}
      </div><button class="btn btn-primary btn-block" id="ok">확인</button>`, (sh) => { $('#ok', sh).onclick = () => closeSheet(); });
  }

  // ---------- 전역 이벤트 ----------
  document.addEventListener('click', async (e) => {
    const like = e.target.closest('[data-like]');
    if (like) {
      e.preventDefault(); e.stopPropagation();
      const id = like.dataset.like; const on = !state.likes.has(id);
      on ? state.likes.add(id) : state.likes.delete(id); persist(); vibrate(10);
      $$(`[data-like="${id}"]`).forEach((n) => { n.innerHTML = on ? I.heartRed : (n.classList.contains('heart-mini') ? I.heartW : I.heart); });
      toast(on ? '찜한 공연에 추가했어요' : '찜을 해제했어요');
      return;
    }
    const pl = e.target.closest('[data-plike]'); if (pl) { likePost(pl.dataset.plike); vibrate(10); return; }
    const sv = e.target.closest('[data-save]');
    if (sv) {
      const id = sv.dataset.save; const on = !state.saved.has(id);
      on ? state.saved.add(id) : state.saved.delete(id); persist(); sv.innerHTML = on ? I.bookmarkF : I.bookmark; toast(on ? '저장했어요' : '저장을 취소했어요');
      return;
    }
    const sh = e.target.closest('[data-share]');
    if (sh) {
      const evt = ev(sh.dataset.share); const url = location.origin + '/#/event/' + evt.id;
      try {
        if (navigator.share) await navigator.share({ title: evt.title + ' | 티켓레이더', url });
        else { await navigator.clipboard.writeText(url); toast('링크를 복사했어요'); }
      } catch { /* 공유 취소 */ }
      return;
    }
    const more = e.target.closest('[data-post-more]');
    if (more) {
      const p = POSTS.find((x) => x.id === more.dataset.postMore);
      openSheet(`<div class="menu-list" style="padding:0">
        <button class="menu-row" data-go="event/${p.eventId}"><span class="mi">🎫</span><span class="label">공연 정보 보기</span></button>
        <button class="menu-row" data-go="check"><span class="mi">🛡️</span><span class="label">판매글 확인하기</span></button>
        <button class="menu-row" id="report" style="color:var(--bad)"><span class="mi">🚨</span><span class="label">암표 의심 신고 준비</span></button></div>`, (s) => {
        $('#report', s).onclick = () => {
          const e = ev(p.eventId);
          openReportSheet({ eventId: p.eventId, showtime: e.showtimes.find((x) => x.id === p.showtime).label, official: e.prices.find((x) => x.grade === p.grade)?.price ?? null, price: p.price, qty: p.qty, demo: true });
        };
      });
      return;
    }
    if (e.target.closest('[data-back]')) { back(); return; }
    const g = e.target.closest('[data-go]');
    if (g) {
      e.preventDefault(); vibrate(5);
      const m = /^event\/(.+)$/.exec(g.dataset.go);
      if (m) markMorph(g, m[1]);
      go(g.dataset.go);
    }
  });

  let lastScrollY = 0;
  function onScroll() {
    const tb = $('#topbar');
    const y = window.scrollY;
    const fab = $('.fab');
    if (fab) {
      if (y > lastScrollY + 6 && y > 80) fab.classList.add('hide');
      else if (y < lastScrollY - 6 || y <= 80) fab.classList.remove('hide');
    }
    lastScrollY = y;
    tb.classList.toggle('scrolled', y > 4);
    if (tb.classList.contains('overlay')) {
      const solid = y > 260;
      tb.classList.toggle('solid', solid);
      const t = $('.tb-title', tb); if (t) t.style.opacity = solid ? 1 : 0;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('hashchange', render);

  // 안드로이드 뒤로가기: 시트가 열려 있으면 먼저 닫기
  window.addEventListener('popstate', () => { if ($('#sheet-root').firstChild) closeSheet(true); });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }

  render();
})();
