import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {inspectSavedLanguage,appendLanguageBackup,hasNonEnglishText} from '../language.js';
import {number,currency,count,shortDate} from '../format.js';
import {seedState,validateBrief,parseUtcInput,transition} from '../state.js';

test('legacy CJK edits are flagged without changing the original workspace',()=>{
  const s=seedState();s.campaigns[0].brief.name='\u65b0\u54c1\u6d3b\u52a8';
  s.campaigns[1].content.subject='My saved draft \u8349\u7a3f';
  s.campaigns[1].approvedRevision=1;
  const raw=JSON.stringify(s),before=structuredClone(s),result=inspectSavedLanguage(raw);
  assert.equal(result.blocked,true);assert.equal(result.raw,raw);assert.deepEqual(s,before);
  assert.equal(inspectSavedLanguage(JSON.stringify(seedState())).blocked,false);
});
test('backup append keeps all prior snapshots and exact original text',()=>{
  const raw=JSON.stringify({name:'\u4e2d\u6587',draft:'Retain every edit',approvedRevision:3});
  const prior=JSON.stringify([{at:'2026-10-01T00:00:00Z',raw:'older workspace'}]);
  const backup=JSON.parse(appendLanguageBackup(raw,prior,'2026-10-06T00:00:00Z'));
  assert.equal(backup.length,2);assert.equal(backup[0].raw,'older workspace');assert.equal(backup[1].raw,raw);
  assert.equal(JSON.parse(appendLanguageBackup(raw,'unreadable prior backup'))[0].raw,'unreadable prior backup');
});
test('new Chinese names, content and revision notes are rejected without mutation',()=>{
  const s=seedState(),c=s.campaigns[1];assert.equal(validateBrief({...s.campaigns[0].brief,name:'\u65b0\u54c1'}).name,'Use English text for the campaign name.');
  const before=structuredClone(c);
  assert.equal(transition(c,'saveContent',{content:{...c.content,subject:'\u65b0\u54c1'}}).ok,false);
  assert.deepEqual(c,before);
  assert.equal(transition(c,'return',{note:'\u4fee\u6539'}).ok,false);assert.deepEqual(c,before);
});
test('UTC input rejects impossible or ambiguous calendar dates',()=>{
  assert.equal(parseUtcInput('2026-10-07T08:30'),Date.parse('2026-10-07T08:30Z'));
  for(const value of ['2026-02-31T08:30','2026-10-07T24:00','07/10/2026 08:30','',null])assert.ok(Number.isNaN(parseUtcInput(value)));
});
test('British English display uses explicit USD, four-digit year and singular counts',()=>{
  assert.equal(number(1240),'1,240');assert.equal(currency(129),'US$129');
  assert.equal(shortDate('2026-10-07T08:30'),'7 Oct 2026, 08:30');
  assert.equal(count(1,'product'),'1 product');assert.equal(count(2,'product'),'2 products');
});
test('all shipped UI source, SVG text and seed state are free of CJK/full-width text',()=>{
  const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const files=['app.js','state.js','format.js','language.js','index.html','styles.css','keyboard-styles.css','assets/create-keyboards.mjs','assets/keyboard-graphite.svg','assets/keyboard-cloud.svg','assets/keyboard-moss.svg'];
  for(const file of files)assert.equal(hasNonEnglishText(fs.readFileSync(path.join(root,file),'utf8')),false,file);
  assert.equal(hasNonEnglishText(seedState()),false);
});
