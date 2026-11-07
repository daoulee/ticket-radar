import type { TicketRadarApi } from './client';
import { createDemoApi, type DemoApi } from './demoApi';
import { createHttpApi } from './httpApi';

// EXPO_PUBLIC_API_BASE_URL 이 있으면 실제 API, 없으면 시연 데이터를 사용한다. 화면 상단에 현재 모드를 표시한다.
// 실기기에서는 localhost가 기기 자신을 가리키므로 같은 LAN의 Mac 주소나 HTTPS 주소가 필요하다.
export function createApiFromEnvironment(): TicketRadarApi {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (baseUrl) return createHttpApi(baseUrl);
  return createDemoApi();
}

export function isDemoApi(api: TicketRadarApi): api is DemoApi {
  return api.mode === 'demo' && typeof (api as DemoApi).failNext === 'function';
}
