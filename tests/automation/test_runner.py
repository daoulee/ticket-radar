import importlib.util
import unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('runner',Path(__file__).resolve().parents[2]/'scripts/aid_team.py')
r=importlib.util.module_from_spec(spec);spec.loader.exec_module(r)
class RunnerTests(unittest.TestCase):
 def test_unverified_dependency_blocks(self):
  j={'status':'queued','depends_on':['a']}
  self.assertFalse(r.ready(j,[{'id':'a','status':'review_pending'}]))
  self.assertFalse(r.ready(j,[]))
  self.assertTrue(r.ready(j,[{'id':'a','status':'verified'}]))
 def test_claude_error_is_not_success(self):
  a=r.parse_result('claude','{"is_error":true,"result":"Not logged in","session_id":"x"}')
  self.assertEqual(a['error'],'Not logged in')
 def test_actual_model_from_runtime_only(self):
  a=r.parse_result('claude','{"result":"OK","modelUsage":{"claude-opus-test":{}},"session_id":"x"}')
  self.assertEqual(a['actual_models'],['claude-opus-test'])
  self.assertIsNone(a['error'])
 def test_empty_output_fails(self):
  self.assertIsNotNone(r.parse_result('codex','')['error'])
 def test_codex_events(self):
  a=r.parse_result('codex','{"type":"thread.started","thread_id":"x"}\n{"type":"item.completed","item":{"type":"agent_message","text":"OK"}}')
  self.assertEqual(a['session_id'],'x');self.assertEqual(a['text'],'OK')
 def test_permissions_not_bypassed(self):
  for cli in ['codex','claude']:
   args=r.command({'cli':cli,'model':'example'},{})
   self.assertFalse(any('bypass' in s for s in args))
   self.assertIn('read-only' if cli=='codex' else 'dontAsk',args)
if __name__=='__main__':unittest.main()
