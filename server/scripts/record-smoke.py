"""Record synthetic/manual local API smoke responses, with no AI request."""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from datetime import datetime
from zoneinfo import ZoneInfo
import hashlib
import json
import re

root = Path(__file__).resolve().parents[2]
out = root / 'evidence/logs'
test_log = (out / 'sol-core-tests-20261029.txt').read_text()
assert re.search(r'ℹ fail 0\b', test_log), 'Latest recorded tests must pass before recording completion.'
test_count = int(re.search(r'ℹ tests (\d+)', test_log).group(1))
cases = [
    ('events', 'GET', '/events', None, 200),
    ('official-context', 'GET', '/events/akmu-daegu-20261121/official-context', None, 200),
    ('model-unconfigured', 'POST', '/checks', 'model-request.json', 503),
    ('manual-check', 'POST', '/checks', 'manual-request.json', 200),
]
runs = []
with urlopen('http://127.0.0.1:3001/health', timeout=10) as res:
    health = json.load(res)
if health.get('aiConfigured') is not False:
    raise SystemExit('Stop: this smoke requires an explicitly unconfigured server; no extraction request sent.')
for name, method, path, filename, expected in cases:
    data = (root / 'shared/examples' / filename).read_bytes() if filename else None
    req = Request('http://127.0.0.1:3001' + path, method=method, data=data,
                  headers={'Content-Type': 'application/json'})
    try:
        with urlopen(req, timeout=10) as res:
            code, body = res.status, json.load(res)
    except HTTPError as error:
        code, body = error.code, json.load(error)
    assert code == expected, (name, code)
    if name == 'model-unconfigured':
        assert body['code'] == 'AI_NOT_CONFIGURED'
    if name == 'manual-check':
        assert body['extraction']['method'] == 'manual'
        assert body['extraction']['actualModelCall'] is False
        assert body['isDemo'] and body['priceComparison']['diff'] == 74000
    output = f'sol-core-http-{name}.json'
    (out / output).write_text(json.dumps({'httpStatus': code, 'body': body}, ensure_ascii=False, indent=2) + '\n')
    runs.append({'method': method, 'path': path, 'status': code, 'evidence': output})
    print(name, code)

report = {
    'task': 'CORE-002',
    'recordedAt': datetime.now(ZoneInfo('Asia/Seoul')).isoformat(timespec='seconds'),
    'author': 'Sol / environment-declared GPT-6 based Codex; exact runtime ID unavailable',
    'checks': [
        {'command': 'npm run typecheck', 'cwd': 'server', 'exitCode': 0},
        {'command': 'npm test', 'cwd': 'server', 'exitCode': 0, 'tests': test_count,
         'scope': 'Core/schema/provider tests and 9 local HTTP integration tests. AI mocked.',
         'log': 'sol-core-tests-20261029.txt'},
        {'command': 'npm run examples', 'cwd': 'server', 'exitCode': 0,
         'scope': 'explicit manual synthetic examples, no model call'},
    ],
    'httpSmoke': runs,
    'initialFailures': [
        {'cause': 'invalid Infinity test input pre-parsed by helper, before rejection assertion',
         'fix': 'construct invalid raw request; rejection expectation unchanged; final tests pass'},
        {'cause': 'Python cross-process local HTTP smoke hit sandbox EPERM',
         'fix': 'request escalation for the same local smoke, without using a different network route'},
        {'cause': 'redirected final Node HTTP test run hit sandbox listen EPERM',
         'fix': 'preserved sandbox failure log; reran same command with approved escalation'},
    ],
    'notVerified': ['real model call and extraction accuracy', 'UI shared package imports/builds',
                    'web browser/API flow', 'app/device interaction', 'deployment', 'submission'],
    'officialSnapshot': {
        'sha256': hashlib.sha256((root / 'docs/official/demo-event-akmu.json').read_bytes()).hexdigest(),
        'verifiedDate': '2026-10-29', 'precision': 'date', 'newSourceVerificationBySol': False,
    },
    'fileSha256': {
        str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest()
        for folder in ('shared', 'server') for p in (root / folder).rglob('*')
        if p.is_file() and 'node_modules' not in p.parts and '__pycache__' not in p.parts
    },
}
(out / 'sol-core-20261029.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print('Evidence saved. Actual model calls: none.')
