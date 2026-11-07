import { webkit, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const url=process.argv[2];
if(!url || new URL(url).protocol!=='https:')throw new Error('Provide deployed HTTPS URL');
const browser=await webkit.launch({headless:true});
const results=[];
try {
 for(const [name,width,height]of [['desktop',1280,900],['wide',1440,960],['tablet',768,1024],['mobile',390,844],['small',360,800]]){
  const page=await browser.newPage({viewport:{width,height}});
  const errors=[];const apiRequests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/\/(checks|events)(\?|$)/.test(r.url()))apiRequests.push(r.url())});
  const response=await page.goto(url,{waitUntil:'networkidle'});
  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading',{name:'티켓레이더',exact:true})).toBeVisible();
  // WEB-007 새 메인: 작은 모드 배지(연결 방식은 title)와 실제 목록의 공연 요약이 보여야 한다
  await expect(page.getByRole('note', { name: '시연 모드 · 합성 데이터' })).toBeVisible();
  await expect(page.getByRole('note')).toHaveAttribute('title',/실제 API 미연결/);
  await expect(page.getByRole('heading',{name:/정말 이 조건이 맞을까요/})).toBeVisible();
  await page.screenshot({path:`evidence/deployment/${name}-home.png`,fullPage:true});
  await page.getByRole('button',{name:/서비스 체험하러 가기/}).click();
  await expect(page.getByRole('heading',{name:'1. 공연 선택'})).toBeVisible();
  await page.screenshot({path:`evidence/deployment/${name}-events.png`,fullPage:true});
  await page.getByRole('button',{name:/레이더 라이브/}).click();
  await page.screenshot({path:`evidence/deployment/${name}-listing.png`,fullPage:true});
  await page.locator('details.samples summary').click(); // 시연 예시는 접혀 있다
  await page.getByRole('button',{name:'예시 1 · 가격 차이와 캡처 전달'}).click();
  await page.getByRole('button',{name:'판매글에서 정보 추출'}).click();
  await expect(page.getByRole('heading',{name:'3. 추출 정보 확인·수정'})).toBeVisible();
  await page.getByLabel('선택한 공연에 대한 판매글인가요?').selectOption('demo-radar-live');
  await page.getByLabel('가격 기준').selectOption('per_ticket');
  await page.getByLabel('수수료 포함 여부').selectOption('ticket_only');
  await page.getByLabel('할인 여부').selectOption('standard');
  await page.screenshot({path:`evidence/deployment/${name}-review.png`,fullPage:true});
  await page.getByRole('button',{name:'이 값으로 공식 자료와 대조'}).click();
  await expect(page.getByText('+76,000원')).toBeVisible();
  await expect(page.getByRole('link',{name:'공식 근거 (시연용 예시 링크)'}).first()).toBeVisible();
  await page.screenshot({path:`evidence/deployment/${name}-result.png`,fullPage:true});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);expect(errors).toEqual([]);expect(apiRequests).toEqual([]);
  results.push({name,width,httpStatus:response.status(),demoLabel:true,fixtureFlow:'passed',horizontalOverflow:overflow,errors,apiRequests});
  await page.close();
 }
 await fs.writeFile('evidence/deployment/live-smoke.json',JSON.stringify({url,checkedAt:new Date().toISOString(),scope:'Public static demo, fixture results; no runtime AI/API',results},null,2)+'\n');
 console.log(JSON.stringify(results,null,2));
}finally{await browser.close()}
