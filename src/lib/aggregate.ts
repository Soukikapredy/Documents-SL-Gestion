import { db } from "@/db";
import { versements, caEntries, depenses, pointages, settings } from "@/db/schema";
import { gte } from "drizzle-orm";

export interface DayRow { date: string; label: string; versements: number; ca: number; prelevement: number; depenses: number; pannes: number; present: number; total: number; }
export interface PeriodRow { key: string; label: string; versements: number; ca: number; prelevement: number; depenses: number; pannes: number; present: number; total: number; days: number; }
export interface BilanMonth { key: string; label: string; ca: number; vers: number; prelev: number; dep: number; pannes: number; net: number; marge: number; }
export interface JournalEntry { id: number; kind: "versement" | "ca" | "depense" | "pointage"; designation: string; date: string; amount: number; category?: string; present?: number; total?: number; }
export interface DashboardData {
  kpi: { caWeek: number; caWeekDelta: number | null; versMonth: number; versMonthDelta: number | null; prelevMonth: number; depMonth: number; depMonthDelta: number | null; pannesMonth: number; pannesMonthDelta: number | null; };
  spark: { ca: number[]; vers: number[]; dep: number[]; pannes: number[]; };
  caSeries: { date: string; label: string; ca: number; avg7: number }[];
  charges: { op: number; prelev: number; pannes: number };
  expensesByMonth: { label: string; total: number }[];
  recent: { id: number; designation: string; category: string; amount: number; date: string }[];
  daily: DayRow[];
  weekly: PeriodRow[];
  monthly: PeriodRow[];
  bilans: BilanMonth[];
  objectifs: { objective: number; realized: number; remaining: number; pct: number; monthsLeft: number; };
  settings: { currency: "EUR" | "USD" | "XOF"; ratePct: number; staffTotal: number; };
  journal: JournalEntry[];
  personnel: { series: { label: string; rate: number; present: number; total: number }[]; avgRate: number; lowDays: number; staffTotal: number; };
  netByMonth: { label: string; net: number }[];
  dailyByMonth: Record<string, DayRow[]>;
  pannesStats: { count: number; cost: number; avg: number; maxAmount: number; maxLabel: string; prevCount: number; };
  mom: { vers: { cur: number; prev: number }; ca: { cur: number; prev: number }; dep: { cur: number; prev: number }; net: { cur: number; prev: number }; };
}
const dkey = (d: Date) => d.toISOString().slice(0, 10);
const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
export const monthLabel = (key: string) => { const [y,m]=key.split("-").map(Number); return `${MONTHS_FR[m-1]} ${y}`; };
function addDays(d: Date, n: number) { const r = new Date(d); r.setUTCDate(r.getUTCDate() + n); return r; }
function mondayOf(d: Date) { const r = new Date(d); const day = (r.getUTCDay() + 6) % 7; r.setUTCDate(r.getUTCDate() - day); return r; }
const shortLabel = (iso: string) => { const [,m,d]=iso.split("-"); return `${d}/${m}`; };
export async function getDashboardData(): Promise<DashboardData> {
  const today = new Date(); today.setUTCHours(0,0,0,0); const start = addDays(today,-420);
  const [vRows,cRows,dRows,pRows,setRows] = await Promise.all([
    db.select().from(versements).where(gte(versements.date,start)),
    db.select().from(caEntries).where(gte(caEntries.date,start)),
    db.select().from(depenses).where(gte(depenses.date,start)),
    db.select().from(pointages).where(gte(pointages.date,start)),
    db.select().from(settings).where(gte(settings.id,1)).limit(1),
  ]);
  const num=(x:string|number)=>Number(x??0);
  const setRow=setRows[0]; const ratePct=setRow?num(setRow.prelevRate)||2:2; const rate=ratePct/100; const cur=setRow?.defaultCurrency; const defaultCurrency: "EUR"|"USD"|"XOF"=cur==="USD"||cur==="XOF"?cur:"EUR"; const staffTotal=setRow?Math.round(num(setRow.staffTotal))||25:25;
  const perDay=new Map<string,{vers:number;ca:number;op:number;pannesCost:number;pannesN:number;present:number;total:number}>();
  const day=(k:string)=>{let e=perDay.get(k); if(!e){e={vers:0,ca:0,op:0,pannesCost:0,pannesN:0,present:0,total:0}; perDay.set(k,e);} return e;};
  for(const r of vRows) day(dkey(r.date)).vers += num(r.amount);
  for(const r of cRows) day(dkey(r.date)).ca += num(r.amount);
  for(const r of dRows){const e=day(dkey(r.date)); if(r.category==="panne"){e.pannesCost+=num(r.amount); e.pannesN+=1;} else e.op+=num(r.amount);} 
  for(const r of pRows){const e=day(dkey(r.date)); e.present+=r.present; e.total+=r.total;}
  const sumRange=(from:Date,to:Date,pick:(e:{vers:number;ca:number;op:number;pannesCost:number;pannesN:number;present:number;total:number})=>number)=>{let s=0; for(let d=new Date(from); d<=to; d=addDays(d,1)){const e=perDay.get(dkey(d)); if(e) s+=pick(e);} return s;};
  const depOf=(e:{op:number;pannesCost:number})=>e.op+e.pannesCost;
  const weekEnd=today; const weekStart=addDays(today,-6); const prevWeekEnd=addDays(weekStart,-1); const prevWeekStart=addDays(prevWeekEnd,-6); const monthStart=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),1)); const prevMonthEnd=addDays(monthStart,-1); const prevMonthStart=new Date(Date.UTC(prevMonthEnd.getUTCFullYear(),prevMonthEnd.getUTCMonth(),1));
  const caWeek=sumRange(weekStart,weekEnd,e=>e.ca); const caWeekPrev=sumRange(prevWeekStart,prevWeekEnd,e=>e.ca); const versMonth=sumRange(monthStart,today,e=>e.vers); const versMonthPrev=sumRange(prevMonthStart,prevMonthEnd,e=>e.vers); const prelevMonth=versMonth*rate; const depMonth=sumRange(monthStart,today,depOf); const depMonthPrev=sumRange(prevMonthStart,prevMonthEnd,depOf); const pannesMonth=sumRange(monthStart,today,e=>e.pannesN); const pannesMonthPrev=sumRange(prevMonthStart,prevMonthEnd,e=>e.pannesN);
  const delta=(cur:number,prev:number):number|null=>prev>0?((cur-prev)/prev)*100:null;
  const spark={ca:[] as number[], vers:[] as number[], dep:[] as number[], pannes:[] as number[]}; for(let i=13;i>=0;i--){const e=perDay.get(dkey(addDays(today,-i))); spark.ca.push(e?.ca??0); spark.vers.push(e?.vers??0); spark.dep.push(e?depOf(e):0); spark.pannes.push(e?.pannesN??0);}
  const caSeries: DashboardData["caSeries"]=[]; for(let i=29;i>=0;i--){const d=addDays(today,-i); const k=dkey(d); const ca=perDay.get(k)?.ca??0; let s=0,n=0; for(let j=0;j<7;j++){const e=perDay.get(dkey(addDays(d,-j))); if(e){s+=e.ca;n++;}} caSeries.push({date:k,label:shortLabel(k),ca,avg7:n?s/n:0});}
  const recent=[...dRows].sort((a,b)=>b.date.getTime()-a.date.getTime()||b.createdAt.getTime()-a.createdAt.getTime()).slice(0,6).map(r=>({id:r.id,designation:r.designation,category:r.category,amount:num(r.amount),date:dkey(r.date)}));
  const withTs=[...vRows.map(r=>({ts:r.createdAt.getTime(),e:{id:r.id,kind:"versement" as const,designation:r.designation,date:dkey(r.date),amount:num(r.amount)}})),...cRows.map(r=>({ts:r.createdAt.getTime(),e:{id:r.id,kind:"ca" as const,designation:r.designation,date:dkey(r.date),amount:num(r.amount)}})),...dRows.map(r=>({ts:r.createdAt.getTime(),e:{id:r.id,kind:"depense" as const,designation:r.designation,date:dkey(r.date),amount:num(r.amount),category:r.category}})),...pRows.map(r=>({ts:r.createdAt.getTime(),e:{id:r.id,kind:"pointage" as const,designation:"Pointage du personnel",date:dkey(r.date),amount:0,present:r.present,total:r.total}}))].sort((a,b)=>b.e.date.localeCompare(a.e.date)||b.ts-a.ts).slice(0,20).map(x=>x.e);
  const journal: JournalEntry[] = withTs;
  const personnelSeries=[] as {label:string;rate:number;present:number;total:number}[]; let prSum=0,ttSum=0,lowDays=0; for(let i=13;i>=0;i--){const d=addDays(today,-i); const e=perDay.get(dkey(d)); const present=e?.present??0; const total=e?.total??0; const rate=total>0?(present/total)*100:0; if(total>0){prSum+=present;ttSum+=total;if(rate<90) lowDays++;} personnelSeries.push({label:shortLabel(dkey(d)),rate,present,total});} const avgRate=ttSum>0?(prSum/ttSum)*100:0;
  const pannesCur=dRows.filter(r=>r.category==="panne"&&r.date>=monthStart); const pannesPrev=dRows.filter(r=>r.category==="panne"&&r.date>=prevMonthStart&&r.date<monthStart); let pCost=0,pMax=0,pMaxLabel=""; for(const r of pannesCur){const a=num(r.amount); pCost+=a; if(a>pMax){pMax=a;pMaxLabel=r.designation;}} const pannesStats={count:pannesCur.length,cost:pCost,avg:pannesCur.length?pCost/pannesCur.length:0,maxAmount:pMax,maxLabel:pMaxLabel,prevCount:pannesPrev.length};
  const charges={op:sumRange(monthStart,today,e=>e.op),prelev:prelevMonth,pannes:sumRange(monthStart,today,e=>e.pannesCost)};
  const expensesByMonth=[] as {label:string;total:number}[]; for(let i=5;i>=0;i--){const m=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth()-i,1)); const mEnd=addDays(new Date(Date.UTC(m.getUTCFullYear(),m.getUTCMonth()+1,1)),-1); expensesByMonth.push({label:MONTHS_FR[m.getUTCMonth()].slice(0,3),total:sumRange(m,mEnd,depOf)});}
  const buildDay=(isoS:string):DayRow=>{const e=perDay.get(isoS); return {date:isoS,label:`${shortLabel(isoS)}/${isoS.slice(0,4)}`,versements:e?.vers??0,ca:e?.ca??0,prelevement:(e?.vers??0)*rate,depenses:e?depOf(e):0,pannes:e?.pannesN??0,present:e?.present??0,total:e?.total??0};};
  const daily:DayRow[]=[]; for(let i=0;i<7;i++) daily.push(buildDay(dkey(addDays(today,-i))));
  const weekly:PeriodRow[]=[]; const curMonday=mondayOf(today); for(let w=7;w>=0;w--){const ws=addDays(curMonday,-7*w); const we=addDays(ws,6); const agg={vers:0,ca:0,op:0,pc:0,pn:0,pr:0,tt:0,days:0}; for(let d=new Date(ws);d<=we;d=addDays(d,1)){const e=perDay.get(dkey(d)); if(!e) continue; agg.vers+=e.vers; agg.ca+=e.ca; agg.op+=e.op; agg.pc+=e.pannesCost; agg.pn+=e.pannesN; agg.pr+=e.present; agg.tt+=e.total; if(e.vers||e.ca) agg.days++; } weekly.push({key:dkey(ws),label:`${shortLabel(dkey(ws))} → ${shortLabel(dkey(we))}`,versements:agg.vers,ca:agg.ca,prelevement:agg.vers*rate,depenses:agg.op+agg.pc,pannes:agg.pn,present:agg.pr,total:agg.tt,days:agg.days});}
  const monthly:PeriodRow[]=[]; const bilans:BilanMonth[]=[]; const dailyByMonth:Record<string,DayRow[]>={}; for(let i=5;i>=0;i--){const m=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth()-i,1)); const mEnd=addDays(new Date(Date.UTC(m.getUTCFullYear(),m.getUTCMonth()+1,1)),-1); const agg={vers:0,ca:0,op:0,pc:0,pn:0,pr:0,tt:0,days:0}; for(let d=new Date(m);d<=mEnd;d=addDays(d,1)){const e=perDay.get(dkey(d)); if(!e) continue; agg.vers+=e.vers; agg.ca+=e.ca; agg.op+=e.op; agg.pc+=e.pannesCost; agg.pn+=e.pannesN; agg.pr+=e.present; agg.tt+=e.total; if(e.vers||e.ca) agg.days++;} const key=`${m.getUTCFullYear()}-${String(m.getUTCMonth()+1).padStart(2,"0")}`; const prelev=agg.vers*rate; const dep=agg.op+agg.pc; const net=agg.vers-prelev-dep; const days:DayRow[]=[]; for(let d=new Date(m);d<=mEnd;d=addDays(d,1)){if(d>today) break; days.push(buildDay(dkey(d)));} dailyByMonth[key]=days; monthly.push({key,label:`${MONTHS_FR[m.getUTCMonth()].slice(0,3)} ${m.getUTCFullYear()}`,versements:agg.vers,ca:agg.ca,prelevement:prelev,depenses:dep,pannes:agg.pn,present:agg.pr,total:agg.tt,days:agg.days}); bilans.push({key,label:monthLabel(key),ca:agg.ca,vers:agg.vers,prelev,dep,pannes:agg.pn,net,marge:agg.vers>0?(net/agg.vers)*100:0});}
  const year=today.getUTCFullYear(); const yearStart=new Date(Date.UTC(year,0,1)); const realized=sumRange(yearStart,today,e=>e.ca); const objective=setRows[0]?num(setRows[0].objectiveCa):2500000; const remaining=Math.max(0,objective-realized); const pct=objective>0?Math.min(100,(realized/objective)*100):0; const monthsLeft=12-(today.getUTCMonth()+1);
  const caMonth=sumRange(monthStart,today,e=>e.ca); const caMonthPrev=sumRange(prevMonthStart,prevMonthEnd,e=>e.ca); const netCur=versMonth-prelevMonth-depMonth; const netPrev=versMonthPrev-versMonthPrev*rate-depMonthPrev; const mom={vers:{cur:versMonth,prev:versMonthPrev},ca:{cur:caMonth,prev:caMonthPrev},dep:{cur:depMonth,prev:depMonthPrev},net:{cur:netCur,prev:netPrev}};
  return {kpi:{caWeek,caWeekDelta:delta(caWeek,caWeekPrev),versMonth,versMonthDelta:delta(versMonth,versMonthPrev),prelevMonth,depMonth,depMonthDelta:delta(depMonth,depMonthPrev),pannesMonth,pannesMonthDelta:delta(pannesMonth,pannesMonthPrev)},spark,caSeries,charges,expensesByMonth,recent,daily,weekly,monthly,bilans,objectifs:{objective,realized,remaining,pct,monthsLeft},settings:{currency:defaultCurrency,ratePct,staffTotal},journal,personnel:{series:personnelSeries,avgRate,lowDays,staffTotal},netByMonth:bilans.map(b=>({label:b.label.split(" ")[0],net:b.net})),dailyByMonth,pannesStats,mom};
}
