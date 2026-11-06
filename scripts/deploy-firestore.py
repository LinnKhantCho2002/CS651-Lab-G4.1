"""Publish G4.1 rules and indexes to its named Native database using gcloud login."""
import concurrent.futures, json, pathlib, subprocess, urllib.error, urllib.request
PROJECT = 'cs651-n33-lcho-20261014'
TOKEN = subprocess.check_output(['gcloud', 'auth', 'print-access-token'], text=True).strip()
def api(url, data=None, method=None):
    request = urllib.request.Request(url, data=json.dumps(data).encode() if data is not None else None,
        method=method, headers={'Authorization': 'Bearer ' + TOKEN, 'x-goog-user-project': PROJECT, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(request) as response: return json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(str(error.code) + ': ' + error.read().decode()) from error
ruleset = api(f'https://firebaserules.googleapis.com/v1/projects/{PROJECT}/rulesets',
    {'source': {'files': [{'name': 'firestore.rules', 'content': pathlib.Path('firestore.rules').read_text()}]}})
release = {'name': f'projects/{PROJECT}/releases/cloud.firestore/friendlyeats', 'rulesetName': ruleset['name']}
try:
    api(f'https://firebaserules.googleapis.com/v1/projects/{PROJECT}/releases', release)
except RuntimeError as error:
    if not str(error).startswith('409:'): raise
    api('https://firebaserules.googleapis.com/v1/' + release['name'], {'release': release}, 'PATCH')
print('Published rules:', release['name'])
base = f'https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/friendlyeats/collectionGroups/restaurants/indexes'
existing = api(base).get('indexes', [])
def signature(index):
    return [(field['fieldPath'], field.get('order')) for field in index['fields'] if field['fieldPath'] != '__name__']
def create(index):
    if any(signature(index) == signature(old) for old in existing): return 'Already exists'
    body = {key: value for key, value in index.items() if key != 'collectionGroup'}
    result = api(base, body)
    return result['name']
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    for result in executor.map(create, json.loads(pathlib.Path('firestore.indexes.json').read_text())['indexes']):
        print('Index:', result)
