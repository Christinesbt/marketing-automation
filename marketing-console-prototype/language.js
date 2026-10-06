export const BACKUP_KEY='relay-tech300-keyboard-demo-v2-language-backups';
// Detect CJK text and full-width punctuation without changing saved user edits.
export const hasNonEnglishText=value=>typeof value==='string'?/[\u2e80-\u9fff\uf900-\ufaff\uff01-\uff60]/.test(value):Array.isArray(value)?value.some(hasNonEnglishText):value&&typeof value==='object'?Object.values(value).some(hasNonEnglishText):false;
export function inspectSavedLanguage(raw){
  if(!raw)return {blocked:false,raw:null};
  try{return {blocked:hasNonEnglishText(JSON.parse(raw)),raw};}
  catch{return {blocked:hasNonEnglishText(raw),raw};}
}
export function appendLanguageBackup(raw,previous,at=new Date().toISOString()){
  let backups=[];
  if(previous){try{const parsed=JSON.parse(previous);if(Array.isArray(parsed))backups=parsed;else backups=[{at:null,raw:previous}];}catch{backups=[{at:null,raw:previous}];}}
  return JSON.stringify([...backups,{at,raw}]);
}
