import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

test('Pages artifact contains only the frontend and commit evidence with relative asset paths',()=>{
  const repo=path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
  execFileSync(process.execPath,[path.join(repo,'scripts/build-pages.mjs')],{cwd:repo,env:{...process.env,BUILD_SHA:'0'.repeat(40)}});
  const out=path.join(repo,'dist/pages');
  const files=fs.readdirSync(out,{recursive:true}).map(String).filter(f=>fs.statSync(path.join(out,f)).isFile());
  assert.equal(files.length,12);
  assert.equal(files.some(f=>/\.py$|\.env|server|README|test|create-keyboards|\.git/i.test(f)),false);
  const info=JSON.parse(fs.readFileSync(path.join(out,'build-info.json'),'utf8'));
  assert.equal(info.commit,'0'.repeat(40));assert.equal(Object.keys(info.files).length,10);
  const html=fs.readFileSync(path.join(out,'index.html'),'utf8');
  assert.match(html,/href="styles.css"/);assert.match(html,/src="app.js"/);
  assert.doesNotMatch(html,/(?:src|href)="\//);
});
