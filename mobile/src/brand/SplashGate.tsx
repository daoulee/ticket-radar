import { createContext, useContext } from 'react';

// 시작 브랜드 연출이 끝났는지. 첫 화면은 데이터 조회를 먼저 시작하되, 등장 효과는 연출이 걷힌 뒤에 보이도록 기다린다.
// 레이아웃 밖(테스트 등)에서는 기본값 true — 곧바로 내용 표시.
export const SplashDoneContext = createContext(true);
export const useSplashDone = () => useContext(SplashDoneContext);
