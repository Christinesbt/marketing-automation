// British English throughout the UI; prices are explicitly in US dollars.
export const number=n=>new Intl.NumberFormat('en-GB').format(Number(n||0));
export const currency=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
export const count=(n,singular,plural=singular+'s')=>`${number(n)} ${n===1?singular:plural}`;
export function shortDate(value){
  if(!value)return '—';
  const date=new Date(value.endsWith('Z')?value:value+'Z');
  if(Number.isNaN(date.getTime()))return 'Invalid date';
  return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'UTC'}).format(date);
}
