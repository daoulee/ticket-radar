#!/usr/bin/env python3
"""Read-only terminal dashboard for the AID dispatcher; never starts workers."""
import argparse
import json
import shutil
import sys
import time
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LABELS = {'queued':'대기', 'running':'실행 기록 있음', 'review_pending':'Astra 검토 대기',
          'verified':'검증 완료', 'changes_requested':'수정 요청', 'failed':'실패', 'interrupted':'중단'}

def read_json(path, default=None):
    try: return json.loads(path.read_text())
    except (OSError, ValueError): return default

def clean(text):
    # Do not let worker-controlled terminal escape sequences execute.
    return ''.join(c if c in '\n\t' or not unicodedata.category(c).startswith('C') else ' ' for c in str(text)).replace('\t',' ')

def clip(text, width):
    out=''; used=0
    for c in clean(text).replace('\n',' '):
        size=2 if unicodedata.east_asian_width(c) in ('W','F') else 1
        if used+size>width-1:return out+'…'
        out+=c; used+=size
    return out

def tail(path):
    try:
        with path.open('rb') as f:
            f.seek(0,2);f.seek(max(0,f.tell()-16384))
            return f.read().decode('utf-8',errors='replace')
    except OSError:return ''

def latest_text(folder):
    result=read_json(folder/'result.json',{})
    if result.get('error'): return '오류: '+str(result['error'])
    if result.get('text'): return result['text']
    for line in reversed(tail(folder/'stdout.jsonl').splitlines()):
        try: event=json.loads(line)
        except ValueError:continue
        if not isinstance(event,dict):continue
        item=event.get('item',{})
        if isinstance(item,dict) and item.get('type')=='agent_message':return item.get('text','')
        if isinstance(event.get('result'),str):return event['result']
    err=tail(folder/'stderr.txt').strip()
    return err.splitlines()[-1] if err else '응답 대기 — CLI가 완료 시에만 답변을 기록할 수 있습니다.'

def render(base, now=None, width=100):
    now=time.time() if now is None else now
    width=max(30,width)
    config=read_json(base/'team.json',{})
    tasks=[]; broken=0
    for path in (base/'tasks').glob('*.json'):
        job=read_json(path)
        if not isinstance(job,dict):broken+=1;continue
        tasks.append(job)
    states={t.get('id'):t.get('status') for t in tasks}
    lines=['AID · Astra 팀 모니터',time.strftime('%Y-%m-%d %H:%M:%S',time.localtime(now)),
           '표시 전용 · 자동 작업 세션만 표시 · Ctrl+C는 모니터만 종료',
           '검증 완료는 해당 작업 범위 기준이며 제품 전체 완료가 아닙니다.', '']
    for role,title in [('sol','Sol'),('web','Opus Web'),('app','Opus App')]:
        title=config.get('roles',{}).get(role,{}).get('display_name',title)
        candidates=[t for t in tasks if t.get('role')==role]
        # An active job should remain visible even if a newer job is queued.
        active=[t for t in candidates if t.get('status')=='running']
        job=max(active or candidates,key=lambda t:t.get('id',''),default=None)
        lines.append('─'*min(width,90))
        requested=config.get('roles',{}).get(role,{}).get('model','미설정')
        if not job:
            lines += [f'{title} | 작업 없음 | 요청 모델: {requested}'];continue
        status=job.get('status','unknown')
        elapsed=''
        if job.get('started_at'):
            # Ignore timestamps belonging to a previous attempt while queued.
            end=now if status=='running' else job.get('finished_at',now)
            if status!='queued': elapsed=f" | {max(0,int(end-job['started_at']))}초"
        lines += [f"{title} | {LABELS.get(status,status)}{elapsed}",
                  f"작업: {job.get('id')} | 시도: {job.get('attempts',0)} | 요청 모델: {requested}"]
        metadata=read_json(base/'runs'/job['id']/str(job.get('attempts',0))/'command.json',{})
        recorded=job.get('requested_model') or metadata.get('requested_model','미기록')
        lines.append('해당 작업 요청 모델: '+recorded)
        models=job.get('actual_models',[])
        lines.append('실행 응답 모델: '+(', '.join(models) if models else '응답 메타데이터 미제공'))
        deps=[d for d in job.get('depends_on',[]) if states.get(d)!='verified']
        if deps:lines.append('선행 검증 대기: '+', '.join(deps))
        if status=='running':lines.append('파일에 기록된 상태입니다. 프로세스 생존 여부는 별도 확인 필요.')
        lines.append('지시: '+str(job.get('prompt','')))
        if job.get('attempts',0):
            folder=base/'runs'/job['id']/str(job['attempts'])
            lines.append('최근 응답: '+latest_text(folder))
            lines.append('기록: '+str(folder))
        if job.get('error'):lines.append('실행 오류: '+str(job['error']))
    lines += ['', f"총 {len(tasks)}건 | 대기 {sum(t.get('status')=='queued' for t in tasks)} | 검토 대기 {sum(t.get('status')=='review_pending' for t in tasks)}"]
    if broken:lines.append(f'읽을 수 없는 상태 파일 {broken}개 — 다음 갱신에서 재확인')
    return '\n'.join(clip(line,width) for line in lines)

def main():
    p=argparse.ArgumentParser();p.add_argument('--once',action='store_true');p.add_argument('--interval',type=float,default=2)
    args=p.parse_args()
    if not .2<=args.interval<=60:p.error('interval은 0.2~60초')
    try:
        while True:
            output=render(ROOT/'automation',width=shutil.get_terminal_size((100,40)).columns)
            if sys.stdout.isatty() and not args.once:print('\033[2J\033[H',end='')
            print(output,flush=True)
            if args.once or not sys.stdout.isatty():break
            time.sleep(args.interval)
    except KeyboardInterrupt:print('\n모니터 종료. 담당 작업은 중단하지 않았습니다.')
if __name__=='__main__':main()
