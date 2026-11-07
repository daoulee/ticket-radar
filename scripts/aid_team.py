#!/usr/bin/env python3
"""Bounded sequential CLI dispatcher. No daemon or automatic approval."""
import argparse, contextlib, fcntl, json, os, signal, subprocess, sys, time, uuid
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'automation'

def read(path, default=None):
    return json.loads(path.read_text()) if path.exists() else default

def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix('.tmp')
    tmp.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')
    tmp.replace(path)

@contextlib.contextmanager
def locked():
    BASE.mkdir(exist_ok=True)
    with (BASE/'runner.lock').open('a') as f:
        try: fcntl.flock(f, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError: raise SystemExit('다른 팀 실행기가 실행 중입니다.')
        yield

def command(role, job):
    model = role['model']
    if not model: raise ValueError('모델 미확정')
    if role['cli'] == 'claude':
        argv=['claude','-p','--model',model,'--output-format','stream-json','--verbose',
              '--permission-mode','dontAsk','--strict-mcp-config',
              '--mcp-config','{"mcpServers":{}}','--tools','Read,Glob,Grep',
              '--allowedTools','Read,Glob,Grep']
        # Edits are proposed as patches; Astra applies them after scope review.
        if role.get('session_id'): argv += ['--resume', role['session_id']]
        return argv
    if role.get('session_id'):
        return ['codex','exec','-c','sandbox_mode="read-only"','-c','approval_policy="never"',
                'resume','--skip-git-repo-check','--model',model,'--json',role['session_id'],'-']
    return ['codex','exec','--skip-git-repo-check','--sandbox','read-only',
            '--model',model,'--json','-C',str(ROOT),'-']

def prompt(role, job):
    return f'''You are the {role.get('display_name', job['role'])} worker in the AID Ticket Radar team. Astra is coordinator and final reviewer.
Actual requested model: {role['model']}. Do not invent runtime model identity.
Read AGENTS.md, newest Communicate.md and relevant specs before project work.
For any UI/UX task read docs/design/DESIGN_SPEC.md, REFERENCE_GUIDE.md, tokens.json and IMPLEMENTATION_TASKS.md. Include D01-D12 compliance and reference IDs in the response.
Read-only worker: NEVER change files or start services, call product AI, deploy, submit, install, or delegate.
Owner paths for any proposed changes: {', '.join(role['paths'])}.
For implementation tasks return a unified diff and validation instructions; Astra will scope-check and apply it.
Do not append Communicate.md; the coordinator owns integration records.
Distinguish code, tests, API, UI, device, deployment and submission. State unverified claims.
Return concise Korean findings with file references. Do not read credentials or private unrelated files.
Task ID: {job['id']}
{job['prompt']}
'''

def parse_result(cli, content):
    events=[]
    for line in content.splitlines():
        try: events.append(json.loads(line))
        except ValueError: pass
    result={'session_id':None,'actual_models':[], 'text':'', 'error':None}
    for e in events:
        if cli=='claude':
            result['session_id']=e.get('session_id', result['session_id'])
            result['actual_models']=list(e.get('modelUsage',{})) or result['actual_models']
            if 'result' in e: result['text']=e['result']
            if e.get('is_error'): result['error']=e.get('result',e.get('subtype','CLI error'))
            if e.get('permission_denials'): result['error']='Permission denied; inspect worker result'
        else:
            if e.get('type')=='thread.started':result['session_id']=e.get('thread_id')
            item=e.get('item',{})
            if item.get('type')=='agent_message':result['text']=item.get('text','')
            if e.get('type') in ('error','turn.failed'):result['error']=e.get('message',str(e.get('error')))
    if not result['text'] and not result['error']:result['error']='No final response found'
    return result

def run_job(config, job):
    role=dict(config['roles'][job['role']])
    sessions=read(BASE/'sessions.json',{})
    previous=sessions.get(job['role'],{})
    if previous.get('requested_model') == role['model']:
        role['session_id']=previous.get('session_id')
    folder=BASE/'runs'/job['id']/str(job['attempts']+1)
    folder.mkdir(parents=True, exist_ok=True)
    job.update(status='running',attempts=job['attempts']+1,started_at=time.time(),requested_model=role['model'])
    save(BASE/'tasks'/f"{job['id']}.json",job)
    argv=command(role,job)
    (folder/'prompt.txt').write_text(prompt(role,job))
    save(folder/'command.json', {'argv':argv,'requested_model':role['model'],'cwd':str(ROOT)})
    try:
        with (folder/'stdout.jsonl').open('w') as out, (folder/'stderr.txt').open('w') as err:
            process=subprocess.Popen(argv,cwd=ROOT,stdin=subprocess.PIPE,stdout=out,stderr=err,text=True,start_new_session=True)
            try: process.communicate(prompt(role,job),timeout=config['timeout_seconds'])
            except (subprocess.TimeoutExpired, KeyboardInterrupt):
                os.killpg(process.pid,signal.SIGTERM)
                try:process.wait(timeout=5)
                except subprocess.TimeoutExpired:os.killpg(process.pid,signal.SIGKILL);process.wait()
                raise
        parsed=parse_result(role['cli'],(folder/'stdout.jsonl').read_text())
        parsed['exit_code']=process.returncode
        save(folder/'result.json',parsed)
        (folder/'result.md').write_text(parsed['text'])
        job.update(status='review_pending' if process.returncode==0 and not parsed['error'] else 'failed',
                   result=str((folder/'result.json').relative_to(ROOT)),session_id=parsed['session_id'],actual_models=parsed['actual_models'])
        if job['status']=='review_pending' and parsed['session_id']:
            sessions[job['role']]={'session_id':parsed['session_id'],'requested_model':role['model'],'actual_models':parsed['actual_models']}
            save(BASE/'sessions.json',sessions)
    except (subprocess.TimeoutExpired,KeyboardInterrupt): job.update(status='interrupted')
    except Exception as e:job.update(status='failed',error=str(e))
    job['finished_at']=time.time()
    save(BASE/'tasks'/f"{job['id']}.json",job)
    print(json.dumps({'id':job['id'],'role':job['role'],'status':job['status'],'result':job.get('result')},ensure_ascii=False),flush=True)

def jobs():return [read(p) for p in sorted((BASE/'tasks').glob('*.json'))] if (BASE/'tasks').exists() else []
def ready(job, all_jobs):
    states={j['id']:j['status'] for j in all_jobs}
    return job['status']=='queued' and all(states.get(d)=='verified' for d in job['depends_on'])

def main():
    p=argparse.ArgumentParser()
    sub=p.add_subparsers(dest='action',required=True)
    a=sub.add_parser('add');a.add_argument('role',choices=['sol','terra','web','app']);a.add_argument('--prompt',required=True);a.add_argument('--after',nargs='*',default=[])
    a=sub.add_parser('run');a.add_argument('--limit',type=int,default=1)
    sub.add_parser('status')
    a=sub.add_parser('review');a.add_argument('id');a.add_argument('--decision',choices=['verified','changes_requested'],required=True);a.add_argument('--evidence',required=True)
    a=sub.add_parser('retry');a.add_argument('id');a.add_argument('--feedback',required=True)
    args=p.parse_args()
    with locked():
        config=read(BASE/'team.json')
        if args.action=='add':
            known={j['id'] for j in jobs()}
            if not set(args.after)<=known:raise SystemExit('존재하지 않는 선행 작업')
            job={'id':time.strftime('%Y%m%d-%H%M%S')+'-'+uuid.uuid4().hex[:6],'role':('sol' if args.role=='terra' else args.role),'prompt':args.prompt,'depends_on':args.after,'status':'queued','attempts':0}
            save(BASE/'tasks'/f"{job['id']}.json",job);print(job['id'])
        elif args.action=='status':
            for j in jobs(): print(json.dumps(j,ensure_ascii=False))
        elif args.action=='run':
            if not 1<=args.limit<=config['max_jobs_per_run']:raise SystemExit('실행 건수 제한 초과')
            for _ in range(args.limit):
                all_jobs=jobs();job=next((j for j in all_jobs if ready(j,all_jobs)),None)
                if job is None:print('실행 가능한 작업 없음');break
                run_job(config,job)
                if job['status']!='review_pending':break
        else:
            if not all(c.isalnum() or c=='-' for c in args.id):raise SystemExit('잘못된 작업 ID')
            path=BASE/'tasks'/f'{args.id}.json';job=read(path)
            if not job:raise SystemExit('작업 없음')
            if args.action=='review':
                if job['status']!='review_pending':raise SystemExit('검토 대기 작업만 판정 가능')
                job.update(status=args.decision,evidence=args.evidence)
            else:
                if job['status'] not in ('failed','interrupted','changes_requested'):raise SystemExit('재작업 가능한 상태가 아님')
                if job['attempts']>=config['max_attempts']:raise SystemExit('재시도 한도 도달')
                job['prompt']+='\nAstra feedback:\n'+args.feedback;job['status']='queued'
            save(path,job)
if __name__=='__main__':main()
