import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('monitor',Path(__file__).resolve().parents[2]/'scripts/aid_monitor.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class MonitorTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.base=Path(self.temp.name);(self.base/'tasks').mkdir()
 def tearDown(self):self.temp.cleanup()
 def job(self,id,**kw):
  data={'id':id,'role':'web','status':'queued','attempts':0,'prompt':'test',**kw}
  (self.base/'tasks'/f'{id}.json').write_text(json.dumps(data));return data
 def test_partial_json_does_not_crash(self):
  (self.base/'tasks'/'bad.json').write_text('{')
  self.assertIn('읽을 수 없는 상태 파일 1개',m.render(self.base))
 def test_latest_queued_visible(self):
  self.job('a',status='verified',started_at=10,finished_at=20)
  self.job('b',depends_on=['a'])
  self.assertIn('작업: b',m.render(self.base))
 def test_active_job_priority_and_timer(self):
  self.job('a',status='running',started_at=10)
  self.job('b')
  output=m.render(self.base,now=25)
  self.assertIn('실행 기록 있음 | 15초',output);self.assertIn('작업: a',output)
 def test_retry_does_not_show_previous_error(self):
  self.job('a',attempts=2,status='running',started_at=10)
  old=self.base/'runs'/'a'/'1';old.mkdir(parents=True);(old/'result.json').write_text('{"error":"OLD FAILURE"}')
  self.assertNotIn('OLD FAILURE',m.render(self.base))
 def test_failure_reason(self):
  self.job('a',attempts=1,status='failed')
  folder=self.base/'runs'/'a'/'1';folder.mkdir(parents=True);(folder/'result.json').write_text('{"error":"LOGIN REQUIRED"}')
  self.assertIn('LOGIN REQUIRED',m.render(self.base))
 def test_strip_terminal_controls(self):
  self.assertNotIn('\x1b',m.clip('hello\x1b[2J',100))
if __name__=='__main__':unittest.main()
