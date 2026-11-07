// 추출 정확도 정답표 평가(기획 명세 9절 '추출 정확성'). 서버 .env 의 제공자로 실제 호출한다(비용 발생).
// 사용: node --env-file=.env scripts/eval-extraction.ts  → eval/results-<시각>.json 저장, 표 출력.
// 근거 검증(validateGroundedExtraction)에 걸리면 그 사례의 모든 항목을 오류로 센다(화면에 후보가 안 나오므로).
import { readFileSync, writeFileSync } from 'node:fs';
import { FIELD_KEYS } from '../../shared/index.ts';
import { catalog } from '../src/catalog.ts';
import { providerFromEnv, validateGroundedExtraction } from '../src/extraction.ts';

type Expect = string | number | boolean | null | { ambiguous: (string | number)[] };
const { cases } = JSON.parse(readFileSync(new URL('../eval/extraction-cases.json', import.meta.url), 'utf8')) as { cases: { id: string; text: string; expect: Record<string, Expect> }[] };
const provider = providerFromEnv(process.env);
if (!provider) throw new Error('EXTRACTION_PROVIDER 가 설정되지 않았습니다.');
const entry = catalog[0];
const timeout = Number(process.env.AI_TIMEOUT_MS ?? 30000);
const modelOf = (signal: AbortSignal) => provider.modelFor?.(signal) ?? provider.model;

const rows: any[] = [];
const fieldStats = Object.fromEntries(FIELD_KEYS.map(k => [k, { correct: 0, total: 0 }]));
for (const c of cases) {
  const t = Date.now(); const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), timeout);
  let fields: any = null, error: string | null = null;
  try { fields = validateGroundedExtraction(await provider.extract(c.text, entry, ctrl.signal), c.text, entry); }
  catch (e: any) { error = e?.code ?? String(e); }
  finally { clearTimeout(timer); }
  const ms = Date.now() - t;
  const misses: string[] = [];
  for (const k of FIELD_KEYS) {
    const exp = c.expect[k]; const got = fields?.[k];
    let ok = false;
    if (got) {
      if (exp === null) ok = got.status === 'unknown';
      else if (typeof exp === 'object') ok = got.status === 'ambiguous' && exp.ambiguous.every(v => got.candidates.includes(v));
      else ok = got.status === 'extracted' && got.value === exp;
    }
    fieldStats[k].total++; if (ok) fieldStats[k].correct++;
    else misses.push(`${k}: 정답 ${JSON.stringify(exp)} / 결과 ${got ? `${got.status}:${JSON.stringify(got.value ?? got.candidates)}` : error}`);
  }
  rows.push({ id: c.id, ms, model: modelOf(ctrl.signal), error, correct: FIELD_KEYS.length - misses.length, total: FIELD_KEYS.length, misses });
  console.log(`${c.id.padEnd(20)} ${error ? `오류 ${error}` : `${FIELD_KEYS.length - misses.length}/${FIELD_KEYS.length}`}  ${ms}ms  ${modelOf(ctrl.signal)}`);
  for (const m of misses) console.log(`    - ${m}`);
}
const all = rows.reduce((a, r) => ({ c: a.c + r.correct, t: a.t + r.total }), { c: 0, t: 0 });
console.log(`\n항목 정확도 ${all.c}/${all.t} = ${(100 * all.c / all.t).toFixed(1)}% · 오류 사례 ${rows.filter(r => r.error).length}/${rows.length}`);
for (const [k, s] of Object.entries(fieldStats)) console.log(`  ${k.padEnd(20)} ${s.correct}/${s.total}`);
const out = { at: new Date().toISOString(), provider: provider.name, model: provider.model, cases: rows.length, fieldAccuracy: fieldStats,
  overall: { correct: all.c, total: all.t }, rows, note: '합성 사례 12건 1회 실행. 표본이 작아 일반 성능으로 확대 해석하지 않는다.' };
const file = new URL(`../eval/results-${out.at.replace(/[:.]/g, '-')}.json`, import.meta.url);
writeFileSync(file, JSON.stringify(out, null, 2));
console.log(`저장: ${file.pathname}`);
