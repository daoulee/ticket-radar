#!/usr/bin/env python3
"""Build, install, launch and capture the requested D2 simulator Release."""
import fcntl,json,os,subprocess,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DEVICE='90702C37-ABCF-4D77-B4DF-65E1AE024B0A'
BUNDLE='dev.aid.ticketradar'
DERIVED=Path('/private/tmp/aid-d2-release')
def run(args,**kw):
 return subprocess.run(args,cwd=ROOT,check=True,**kw)
def main():
 stamp=time.strftime('%Y%m%d-%H%M%S')
 folder=ROOT/'evidence'/'releases'/stamp;folder.mkdir(parents=True)
 with (ROOT/'evidence'/'release-d2.lock').open('a') as lock:
  fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
  devices=json.loads(subprocess.check_output(['xcrun','simctl','list','devices','--json']))['devices']
  found=[d for ds in devices.values() for d in ds if d['udid']==DEVICE]
  if len(found)!=1 or found[0]['name']!='iPhone 18 Pro (D2)' or not found[0].get('isAvailable'):
   raise SystemExit('D2 identity/availability verification failed; no other target will be used')
  if found[0]['state']!='Booted':run(['xcrun','simctl','boot',DEVICE])
  run(['xcrun','simctl','bootstatus',DEVICE,'-b'])
  for label,cmd in [('typecheck',['npm','run','typecheck']),('lint',['npm','run','lint']),('tests',['npm','test','--','--runInBand'])]:
   print('Preflight:',label,flush=True)
   with (folder/(label+'.log')).open('w') as log:run(cmd,stdout=log,stderr=subprocess.STDOUT)
  # 기본은 시연 데이터. AID_RELEASE_API=http://127.0.0.1:3001 을 주면 실서버(서버의 AI 설정 사용) 모드로 굽는다. 키는 앱에 넣지 않는다.
  api=os.environ.get('AID_RELEASE_API','').strip()
  env={**os.environ,'EXPO_PUBLIC_API_BASE_URL':api,'EXPO_NO_DOTENV':'1'}
  # 시뮬레이터 로컬 임시 서명(ad-hoc '-'): 키체인(로그인 유지)·알림 권한 엔타이틀먼트가 들어가야 동작한다(APP-025, -34018 해결). 실기기 서명 아님.
  build=['xcodebuild','-workspace','ios/app.xcworkspace','-scheme','app','-configuration','Release','-sdk','iphonesimulator','-destination',f'id={DEVICE}','-derivedDataPath',str(DERIVED),'CODE_SIGNING_ALLOWED=YES','CODE_SIGNING_REQUIRED=YES','CODE_SIGN_IDENTITY=-','DEVELOPMENT_TEAM=','build']
  print('Building D2 Release; log:',folder/'build.log',flush=True)
  with (folder/'build.log').open('w') as log:run(build,env=env,stdout=log,stderr=subprocess.STDOUT)
  app=DERIVED/'Build/Products/Release-iphonesimulator/app.app'
  if not (app/'main.jsbundle').is_file():raise SystemExit('No embedded JS bundle')
  run(['xcrun','simctl','install',DEVICE,str(app)])
  subprocess.run(['xcrun','simctl','terminate',DEVICE,BUNDLE],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  launch=run(['xcrun','simctl','launch',DEVICE,BUNDLE],capture_output=True,text=True)
  time.sleep(3)
  run(['xcrun','simctl','io',DEVICE,'screenshot',str(folder/'home.png')])
  record={'target':found[0]['name'],'udid':DEVICE,'configuration':'Release','data_mode':('live-api '+api) if api else 'fixture-demo','build':'passed','install':'passed','launch':launch.stdout.strip(),'screenshot':str(folder/'home.png'),'visual_review':'pending','physical_device':False,'store_submission':False}
  (folder/'release.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
  (ROOT/'evidence'/'latest-release.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
  print(json.dumps(record,ensure_ascii=False,indent=2),flush=True)
if __name__=='__main__':main()
