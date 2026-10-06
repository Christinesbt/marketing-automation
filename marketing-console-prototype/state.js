import {hasNonEnglishText} from './language.js';
import {shortDate,number} from './format.js';
export const STORAGE_KEY='relay-tech300-keyboard-demo-v2';
export const products=[
  {id:'p1',name:'Vela K75 · Graphite',sku:'VEL-K75-GR',price:129,stock:180,category:'75% mechanical keyboard',facts:['75% compact layout','Hot-swappable switches','USB-C wired connection'],color:'graphite',image:'assets/keyboard-graphite.svg'},
  {id:'p2',name:'Vela K75 · Cloud',sku:'VEL-K75-CL',price:129,stock:220,category:'75% mechanical keyboard',facts:['75% compact layout','Hot-swappable switches','USB-C wired connection'],color:'cloud',image:'assets/keyboard-cloud.svg'},
  {id:'p3',name:'Vela K75 · Moss',sku:'VEL-K75-MS',price:129,stock:0,category:'75% mechanical keyboard',facts:['75% compact layout','Hot-swappable switches','USB-C wired connection'],color:'moss',image:'assets/keyboard-moss.svg'}
];
export const audiences={
  engaged:{name:'Engaged subscribers',base:1240,unsubscribed:180,duplicates:60,frequency:140,eligible:860,note:'Opened an email in the last 90 days; consent recorded.'},
  vip:{name:'Returning customers',base:620,unsubscribed:80,duplicates:20,frequency:40,eligible:480,note:'Two or more orders; active marketing consent.'},
  winback:{name:'Customers to re-engage',base:920,unsubscribed:140,duplicates:40,frequency:100,eligible:640,note:'No purchase in 120 days; active marketing consent.'}
};
export const preparationSteps=[
  {title:'Validate Source Data',note:'Check stock, product facts, offer and campaign dates.'},
  {title:'Build the Eligible Audience',note:'Exclude unsubscribed, duplicate and frequency-capped records.'},
  {title:'Prepare Content and Artwork',note:'Prepare a K75 launch email and match the selected product artwork.'},
  {title:'Review Factual Claims',note:'Match price, offer and attributes to the product catalogue.'}
];
export const lockedStatuses=['running','delivery_paused','retry_wait','needs_attention','completed'];
const time=()=>new Date().toISOString();
function future(hours){const d=new Date(Date.now()+hours*3600000);return d.toISOString().slice(0,16);}
export function defaultBrief(){return {name:'K75 Launch · Early Access',productIds:['p1','p2'],goal:'Product discovery',audience:'engaged',discount:15,code:'K75LAUNCH',start:future(24),end:future(24*8)};}
export function contentFor(c){const names=c.brief.productIds.map(id=>products.find(p=>p.id===id)?.name).filter(Boolean).join(' and ');return {subject:`Meet the K75. Find your rhythm — ${c.brief.discount}% off`,preheader:`A compact keyboard for your everyday desk. Use ${c.brief.code}.`,headline:'Your desk. Your rhythm.',body:`Meet ${names||'the Vela K75'}. A 75% compact layout keeps your desk focused, with hot-swappable switches and a USB-C wired connection. Choose the colour that feels like you. Enjoy ${c.brief.discount}% off with code ${c.brief.code} during this campaign. `,cta:'Discover Vela K75',artwork:'slate'};}
export function event(c,type,detail){c.audit.unshift({id:`${c.id}-e${c.audit.length+1}`,at:time(),type,detail});}
export function newCampaign(id,brief=defaultBrief()){return {id,brief:{...brief,productIds:[...brief.productIds]},status:'draft',revision:0,approvedRevision:null,content:null,prep:{step:0,error:null},delivery:null,returned:false,audit:[{id:`${id}-e1`,at:time(),type:'Draft created',detail:'Local fictional campaign. No external action.'}],created:time()};}
export function seedState(){
  const a=newCampaign('c-autumn');
  const b=newCampaign('c-welcome',{...defaultBrief(),name:'K75 · Welcome Collection',productIds:['p2'],discount:10,code:'WELCOME10',audience:'vip',start:future(-72),end:future(-24)});
  b.status='completed';b.prep.step=4;b.revision=1;b.content=contentFor(b);b.approvedRevision=1;
  b.delivery={sent:480,failed:0,unknown:0,queued:0,total:480,stage:4,attempt:1,retryAt:null,runId:'SIM-WELCOME',reconciled:true};
  event(b,'Sample execution completed','Seeded fictional result: 480 simulated deliveries. Not a production outcome.');
  const c=newCampaign('c-ritual',{...defaultBrief(),name:'Cloud Edition · Desk Refresh',productIds:['p2'],audience:'winback',discount:12,code:'CLOUD12'});
  c.status='review';c.prep.step=4;c.revision=1;c.content=contentFor(c);event(c,'Sample content prepared','Local sample template v1 is ready for human review.');
  return {schema:2,campaigns:[a,c,b],guide:null,serial:4};
}
export function parseUtcInput(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))return NaN;const d=new Date(value+'Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,16)===value?d.getTime():NaN;}
export function validateBrief(b,now=Date.now()){
  const e={};if(!b.name?.trim())e.name='Enter a campaign name.';
  if(b.name?.length>80)e.name='Keep the name under 80 characters.';
  if(!b.productIds?.length||b.productIds.some(id=>!products.some(p=>p.id===id)))e.products='Select at least one catalogue product.';
  if(!['Product discovery','Repeat purchase','Re-engagement'].includes(b.goal))e.goal='Choose a campaign goal.';
  if(!audiences[b.audience])e.audience='Choose an audience.';
  if(!Number.isFinite(Number(b.discount))||Number(b.discount)<1||Number(b.discount)>50)e.discount='Use an offer between 1% and 50%.';
  if(!/^[A-Z0-9_-]{3,20}$/.test(b.code||''))e.code='Use 3–20 uppercase letters, numbers, _ or -.';
  if(hasNonEnglishText(b.name))e.name='Use English text for the campaign name.';
  const start=parseUtcInput(b.start),end=parseUtcInput(b.end);
  if(!Number.isFinite(start)||start<=now)e.start='Enter a future UTC start time as YYYY-MM-DD HH:mm.';
  if(!Number.isFinite(end)||end<=start)e.end='Enter a valid UTC end time after the start (YYYY-MM-DD HH:mm).';
  return e;
}
export function approveReady(c){return c.content&&c.prep.step===4&&!c.returned&&c.revision===c.approvedRevision;}
export function transition(c,action,payload={}){
  const fail=message=>({ok:false,message});
  const pass=message=>({ok:true,message});
  switch(action){
    case 'editBrief':{
      if(lockedStatuses.includes(c.status))return fail('This execution is locked. Duplicate it to create a new campaign.');
      const e=validateBrief(payload.brief);if(Object.keys(e).length)return fail(Object.values(e)[0]);
      const approved=c.approvedRevision!==null;c.brief={...payload.brief,productIds:[...payload.brief.productIds]};c.status='draft';c.content=null;c.prep={step:0,error:null};c.approvedRevision=null;c.returned=false;
      event(c,'Brief updated',approved?'Prior approval and reservation cancelled. Preparation is required again.':'Preparation reset to reflect the new brief.');return pass('Brief saved.');
    }
    case 'startPrep':
      if(!['draft','prep_error','prep_paused'].includes(c.status))return fail('Preparation is already started or complete.');
      if(Object.keys(validateBrief(c.brief)).length)return fail('Update the brief before preparing: campaign dates must be in the future.');
      c.status='preparing';c.prep.error=null;event(c,'Preparation started','Local scripted checks only; no model or platform calls.');return pass('Preparing sample campaign…');
    case 'prepTick':{
      if(c.status!=='preparing')return fail('Preparation is not running.');
      if(c.prep.step===0){const p=products.find(p=>c.brief.productIds.includes(p.id)&&p.stock===0);if(p){c.status='prep_error';c.prep.error=`${p.name} has no stock in the sample catalogue. Remove it from the brief and prepare again.`;event(c,'Data check blocked',c.prep.error);return pass('Source validation needs attention.');}}
      const step=c.prep.step;c.prep.step++;event(c,preparationSteps[step].title,step===1?`${number(audiences[c.brief.audience].eligible)} eligible aggregate records; no personal data.`:preparationSteps[step].note);
      if(c.prep.step===4){c.content=contentFor(c);c.revision++;c.status='review';c.approvedRevision=null;event(c,'Review requested',`Sample content v${c.revision} requires human approval.`);}return pass('Preparation step complete.');
    }
    case 'pausePrep':if(c.status!=='preparing')return fail('Nothing to pause.');c.status='prep_paused';event(c,'Preparation paused','Progress preserved locally; resume explicitly.');return pass('Preparation paused.');
    case 'saveContent':{
      if(!['review','approved','scheduled'].includes(c.status))return fail('Content is not editable in this stage.');
      if(['subject','preheader','headline','body','cta'].some(k=>!payload.content?.[k]?.trim()))return fail('Complete every content field.');
      if(!['slate','horizon'].includes(payload.content.artwork))return fail('Choose a sample artwork.');
      if(hasNonEnglishText(payload.content))return fail('Use English text in every content field. Your draft has not been saved.');
      const approved=c.approvedRevision!==null;c.content={...payload.content};c.revision++;c.approvedRevision=null;c.status='review';c.returned=false;
      event(c,'Content revised',`v${c.revision} saved. ${approved?'Old approval and reservation cancelled.':'A new human approval is required.'}`);return pass('Revision saved. Approval required again.');
    }
    case 'approve':
      if(c.status!=='review'||!c.content||c.returned||c.prep.step!==4)return fail('Save revised content and complete preparation before approval.');
      if(!payload.facts||!payload.consent)return fail('Confirm the facts and audience checks before approving.');
      c.approvedRevision=c.revision;c.status='approved';event(c,'Human approval recorded',`Approved content v${c.revision}; approval applies to this exact version.`);return pass(`Content v${c.revision} approved.`);
    case 'return':
      if(!['review','approved','scheduled'].includes(c.status))return fail('Content is not available for review.');
      if(!payload.note?.trim())return fail('Add a revision note.');
      if(hasNonEnglishText(payload.note))return fail('Use English text for the revision note.');
      c.approvedRevision=null;c.status='review';c.returned=true;event(c,'Returned for revision',payload.note.trim());return pass('Returned. Save a revision before approval.');
    case 'schedule':
      if(c.status!=='approved'||!approveReady(c))return fail('Current content must be approved first.');
      if(Date.parse(c.brief.start+'Z')<=Date.now())return fail('The start time has passed. Update the brief.');
      c.status='scheduled';event(c,'Reservation simulated',`Reserved ${shortDate(c.brief.start)} UTC. No background sender exists; explicit simulation required.`);return pass('Simulation reserved. No real email is scheduled.');
    case 'cancelSchedule':if(c.status!=='scheduled')return fail('No reservation to cancel.');c.status='approved';event(c,'Reservation cancelled','The content approval remains valid.');return pass('Reservation cancelled.');
    case 'startSend':{
      if(!['approved','scheduled'].includes(c.status)||!approveReady(c))return fail('Sending is blocked until the current version is approved.');
      const total=audiences[c.brief.audience].eligible;c.delivery={sent:0,failed:0,unknown:0,queued:total,total,stage:0,attempt:0,retryAt:null,runId:`SIM-${c.id.toUpperCase()}-V${c.revision}`,reconciled:false};
      c.status='running';event(c,'Simulation started',`${c.delivery.runId}; frozen version v${c.revision}; ${total} aggregate records.`);return pass('Delivery simulation started.');
    }
    case 'sendTick':{
      if(c.status!=='running')return fail('Delivery is not running.');const d=c.delivery;
      const failed=Math.round(d.total*60/860),unknown=Math.round(d.total*40/860),sent=d.total-failed-unknown,first=Math.round(sent*0.55);
      if(d.stage===0){d.sent=first;d.queued=d.total-first;event(c,'Batch 01 acknowledged',`${first} simulated receipts. Stable batch key ${d.runId}:01.`);}
      if(d.stage===1){d.sent=sent;d.queued=d.total-sent;event(c,'Batch 02 acknowledged',`${sent-first} simulated receipts. Stable batch key ${d.runId}:02.`);}
      if(d.stage===2){d.failed=failed;d.unknown=unknown;d.queued=0;c.status='needs_attention';event(c,'Simulated rate limit & timeout',`${failed} retryable failures (429); ${unknown} uncertain outcomes. Uncertain batches cannot be retried.`);}
      d.stage++;return pass('Execution updated.');
    }
    case 'pauseSend':if(c.status!=='running')return fail('Execution is not running.');c.status='delivery_paused';event(c,'Simulation paused','Acknowledged progress saved. Resume preserves the same run and batch keys.');return pass('Simulation paused.');
    case 'resumeSend':if(c.status!=='delivery_paused')return fail('No paused execution.');c.status='running';event(c,'Simulation resumed','Continuing from the saved batch cursor.');return pass('Simulation resumed.');
    case 'retry':
      if(c.status!=='needs_attention'||!c.delivery?.failed)return fail('No retryable failed batch. Unknown outcomes must be reconciled.');
      c.delivery.attempt++;c.delivery.retryAt=Date.now()+3000;c.status='retry_wait';event(c,'Retry backoff started',`Attempt ${c.delivery.attempt}: 3-second simulated backoff; original batch keys retained. ${c.delivery.unknown} uncertain records excluded.`);return pass('Backoff started. Only failed records are eligible.');
    case 'retryTick':
      if(c.status!=='retry_wait'||Date.now()<c.delivery.retryAt)return fail('Backoff is still active.');
      c.delivery.sent+=c.delivery.failed;c.delivery.failed=0;c.delivery.retryAt=null;c.status=c.delivery.unknown?'needs_attention':'completed';event(c,'Safe retry acknowledged','Failed batch recovered using original idempotency key. No duplicate simulated receipt.');return pass('Failed batch recovered.');
    case 'reconcile':
      if(!['needs_attention'].includes(c.status)||!c.delivery?.unknown)return fail('No uncertain receipt batch to reconcile.');
      c.delivery.sent+=c.delivery.unknown;c.delivery.unknown=0;c.delivery.reconciled=true;c.status=c.delivery.failed?'needs_attention':'completed';event(c,'Receipts reconciled','Sample receipt lookup confirms all uncertain records were already accepted. No resend performed.');return pass('Uncertain outcomes reconciled.');
    default:return fail('Unknown action.');
  }
}
export function restore(raw){
  try {const s=typeof raw==='string'?JSON.parse(raw):structuredClone(raw);if(s.schema!==2||!Array.isArray(s.campaigns)||!s.campaigns.length||s.campaigns.some(c=>!c.id||!c.brief||!Array.isArray(c.audit)))return seedState();
    for(const c of s.campaigns){if(c.status==='preparing'){c.status='prep_paused';event(c,'Refresh interrupted preparation','Resume explicitly from the saved step.');}if(c.status==='running'){c.status='delivery_paused';event(c,'Refresh interrupted simulation','Saved batch cursor retained. Resume explicitly.');}}
    return s;
  }catch{return seedState();}
}
