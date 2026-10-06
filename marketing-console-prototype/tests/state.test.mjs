import test from 'node:test';
import assert from 'node:assert/strict';
import {newCampaign,defaultBrief,seedState,transition,restore,validateBrief,audiences,approveReady} from '../state.js';
const prepare=c=>{assert.equal(transition(c,'startPrep').ok,true);for(let i=0;i<4;i++)transition(c,'prepTick');assert.equal(c.status,'review');};
const approve=c=>assert.equal(transition(c,'approve',{facts:true,consent:true}).ok,true);
test('brief requires name, product, offer and valid future window',()=>{
  const b=defaultBrief();assert.deepEqual(validateBrief(b),{});
  const e=validateBrief({...b,name:' ',productIds:[],discount:0,code:'a',start:'2020-01-01T12:00',end:'2019-01-01T12:00'});
  for(const key of ['name','products','discount','code','start','end'])assert.ok(e[key]);
});
test('unapproved or stale versions cannot schedule or send',()=>{
  const c=newCampaign('c1');assert.equal(transition(c,'startSend').ok,false);prepare(c);
  assert.equal(transition(c,'startSend').ok,false);assert.equal(transition(c,'schedule').ok,false);
  assert.equal(transition(c,'approve',{facts:true,consent:false}).ok,false);approve(c);c.revision++;
  assert.equal(approveReady(c),false);assert.equal(transition(c,'startSend').ok,false);
});
test('stock validation fails visibly, corrected brief can prepare',()=>{
  const c=newCampaign('c1',{...defaultBrief(),productIds:['p3']});transition(c,'startPrep');transition(c,'prepTick');
  assert.equal(c.status,'prep_error');assert.match(c.prep.error,/no stock/);
  assert.equal(transition(c,'editBrief',{brief:{...c.brief,productIds:['p2']}}).ok,true);prepare(c);
  assert.match(c.content.body,/Vela K75 · Cloud/);assert.doesNotMatch(c.content.body,/Graphite/);
});
test('preparation pause and refresh resume at the saved step without duplication',()=>{
  let c=newCampaign('c1');transition(c,'startPrep');transition(c,'prepTick');
  const s=seedState();s.campaigns=[c];c=restore(JSON.stringify(s)).campaigns[0];assert.equal(c.status,'prep_paused');assert.equal(c.prep.step,1);
  assert.equal(transition(c,'prepTick').ok,false);transition(c,'startPrep');for(let i=0;i<3;i++)transition(c,'prepTick');
  assert.equal(c.prep.step,4);assert.equal(c.audit.filter(x=>x.type==='Validate Source Data').length,1);
});
test('saving a revision cancels approval and reservation',()=>{
  const c=newCampaign('c1');prepare(c);approve(c);transition(c,'schedule');
  transition(c,'saveContent',{content:{...c.content,subject:'Revised subject'}});
  assert.equal(c.revision,2);assert.equal(c.approvedRevision,null);assert.equal(c.status,'review');assert.equal(transition(c,'startSend').ok,false);approve(c);assert.equal(c.approvedRevision,2);
});
test('return for revision requires a note and a newly saved version',()=>{
  const c=newCampaign('c1');prepare(c);approve(c);
  assert.equal(transition(c,'return',{note:' '}).ok,false);transition(c,'return',{note:'Clarify the offer.'});
  assert.equal(transition(c,'approve',{facts:true,consent:true}).ok,false);
  transition(c,'saveContent',{content:{...c.content,headline:'A clearer offer'}});approve(c);assert.equal(c.revision,2);
});
test('repeated schedule/start/retry/reconcile clicks cannot duplicate outcomes',()=>{
  const c=newCampaign('c1');prepare(c);approve(c);assert.equal(transition(c,'schedule').ok,true);assert.equal(transition(c,'schedule').ok,false);
  transition(c,'startSend');const run=c.delivery.runId;assert.equal(transition(c,'startSend').ok,false);
  for(let i=0;i<3;i++)transition(c,'sendTick');assert.deepEqual([c.delivery.sent,c.delivery.failed,c.delivery.unknown],[760,60,40]);
  transition(c,'retry');assert.equal(transition(c,'retry').ok,false);assert.equal(transition(c,'retryTick').ok,false);
  c.delivery.retryAt=Date.now()-1;transition(c,'retryTick');assert.deepEqual([c.delivery.sent,c.delivery.failed,c.delivery.unknown],[820,0,40]);assert.equal(transition(c,'retry').ok,false);
  transition(c,'reconcile');assert.equal(transition(c,'reconcile').ok,false);assert.equal(c.delivery.sent,860);assert.equal(c.delivery.runId,run);assert.equal(c.status,'completed');
});
test('reconcile can precede safe retry without including uncertain records',()=>{
  const c=newCampaign('c1');prepare(c);approve(c);transition(c,'startSend');for(let i=0;i<3;i++)transition(c,'sendTick');
  transition(c,'reconcile');assert.equal(c.delivery.sent,800);assert.equal(c.delivery.failed,60);assert.equal(c.delivery.unknown,0);
  transition(c,'retry');c.delivery.retryAt=0;transition(c,'retryTick');assert.equal(c.delivery.sent,c.delivery.total);assert.equal(c.status,'completed');
});
test('execution refresh pauses and preserves run identity and batch cursor',()=>{
  const c=newCampaign('c1');prepare(c);approve(c);transition(c,'startSend');transition(c,'sendTick');
  const s=seedState();s.campaigns=[c];const restored=restore(JSON.stringify(s)).campaigns[0];
  assert.equal(restored.status,'delivery_paused');assert.equal(restored.delivery.stage,1);assert.equal(restored.delivery.sent,418);
  transition(restored,'resumeSend');transition(restored,'sendTick');assert.equal(restored.delivery.sent,760);
  assert.equal(restored.audit.filter(e=>e.type==='Batch 01 acknowledged').length,1);
});
test('campaign state is isolated and execution snapshots reject edits',()=>{
  const s=seedState(),before=structuredClone(s.campaigns[1]);prepare(s.campaigns[0]);approve(s.campaigns[0]);transition(s.campaigns[0],'startSend');
  assert.equal(transition(s.campaigns[0],'editBrief',{brief:defaultBrief()}).ok,false);assert.equal(transition(s.campaigns[0],'saveContent',{content:s.campaigns[0].content}).ok,false);
  assert.deepEqual(s.campaigns[1],before);
});
test('all audience segments preserve aggregate record conservation',()=>{
  for(const [key,a] of Object.entries(audiences)){
    assert.equal(a.base-a.unsubscribed-a.duplicates-a.frequency,a.eligible);
    const c=newCampaign(key,{...defaultBrief(),audience:key});prepare(c);approve(c);transition(c,'startSend');for(let i=0;i<3;i++)transition(c,'sendTick');
    const d=c.delivery;assert.equal(d.sent+d.failed+d.unknown+d.queued,d.total);transition(c,'retry');d.retryAt=0;transition(c,'retryTick');transition(c,'reconcile');assert.equal(d.sent,a.eligible);
  }
});
test('corrupted storage resets and valid storage retains revisions',()=>{assert.equal(restore('bad JSON').campaigns.length,3);const s=seedState();s.campaigns[0].revision=7;assert.equal(restore(JSON.stringify(s)).campaigns[0].revision,7);});
