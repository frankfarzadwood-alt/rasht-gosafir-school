import type { NativeScene } from '@/lib/content/evolve';

/** Original vector diagrams: side views for support/containment, marked front direction for plan views. */
export function PositionScene({relation}:{relation:Extract<NativeScene,{kind:'position'}>['relation']}) {
  const top=['in front of','behind','opposite'].includes(relation);
  const box=(x:number,y:number,w=100,h=70)=><rect x={x} y={y} width={w} height={h} rx="8" fill="#f4bc72" stroke="#92501d" strokeWidth="4"/>;
  const ball=(x:number,y:number)=><circle cx={x} cy={y} r="23" fill="#3889c7" stroke="#185380" strokeWidth="4"/>;
  return <figure dir="ltr" className="mx-auto w-full max-w-64 rounded-2xl bg-secondary/40 p-3"><figcaption className="mb-2 text-center text-sm font-bold">Blue ball and orange box{relation==='between'?'es':''}</figcaption><svg viewBox="0 0 360 250" role="img" aria-label={`Diagram: the blue ball is ${relation} the orange box${relation==='between'?'es':''}. ${top?'Top view; the front direction is towards the bottom.':'Side view.'}`} className="w-full rounded-xl bg-card">
    <text x="180" y="24" textAnchor="middle" fontSize="20" fill="currentColor">{top?'Top view · front ↓':'Side view'}</text>
    {relation==='in'&&<>{box(120,65,120,130)}<rect x="130" y="75" width="100" height="110" rx="5" fill="#fff5e3"/>{ball(180,130)}</>}
    {relation==='on'&&<>{box(125,125,110,80)}{ball(180,100)}</>}
    {relation==='under'&&<>{box(120,55,120,65)}{ball(180,180)}</>}
    {relation==='next to'&&<>{box(85,100)}{ball(260,135)}</>}
    {relation==='between'&&<>{box(30,100,85)}{box(245,100,85)}{ball(180,135)}</>}
    {relation==='in front of'&&<>{box(130,65)}{ball(180,190)}</>}
    {relation==='behind'&&<>{box(130,130)}{ball(180,75)}</>}
    {relation==='opposite'&&<>{box(130,45,100,55)}<rect x="15" y="118" width="330" height="35" fill="#d8dee4"/><path d="M15 136H345" stroke="#fff" strokeWidth="3" strokeDasharray="12 9"/>{ball(180,200)}</>}
  </svg></figure>;
}
