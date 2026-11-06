import type { NativeScene } from '@/lib/content/evolve';

export function DirectionScene({turn}:{turn:Extract<NativeScene,{kind:'direction_arrow'}>['turn']}) {
  const paths={left:'M160 160V90Q160 60 130 60H55',right:'M80 160V90Q80 60 110 60H185',straight:'M120 160V35',round:'M120 165V136C65 136 61 45 120 45C179 45 175 128 136 136'};
  return <figure dir="ltr" className="mx-auto mb-3 w-full max-w-64 rounded-2xl bg-secondary/40 p-2"><svg viewBox="0 0 240 190" role="img" aria-label={`Direction diagram: start at the dot facing up; ${turn==='round'?'follow the arrow around the island':turn==='straight'?'continue upwards':`turn towards the ${turn}`}`} className="w-full rounded-xl bg-card">
    <defs><marker id={`route-arrow-${turn}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#287c78"/></marker></defs>
    {turn==='round'&&<circle cx="120" cy="90" r="26" fill="#d8e8cc"/>}
    <path d={paths[turn]} fill="none" stroke="#287c78" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" markerEnd={`url(#route-arrow-${turn})`}/>
    <circle cx={turn==='left'?160:turn==='right'?80:120} cy={turn==='round'?165:160} r="9" fill="#c66c48"/>
  </svg></figure>;
}

export function PracticeRoute() {
  return <figure dir="ltr" className="mx-auto mb-3 w-full max-w-md rounded-2xl border border-border bg-secondary/30 p-2"><figcaption className="mb-1 text-center text-xs font-bold">Imaginary town · Start facing north ↑</figcaption><svg viewBox="0 0 500 270" role="img" aria-label="Imaginary town. Start facing north at the bottom. Lime Road is the first crossing, with Café west and Library east. Oak Road is the second crossing, with Museum west and Park east." className="w-full rounded-xl">
    <rect width="500" height="270" fill="#e8eee6"/><path d="M250 0V270M0 80H500M0 180H500" stroke="#fff" strokeWidth="30"/>
    <path d="M250 6V245" stroke="#b3bfba" strokeWidth="2" strokeDasharray="8 7"/>
    {[['Museum',90,26],['Park',340,26],['Café',90,125],['Library',340,125]].map(([name,x,y])=><g key={name}><rect x={Number(x)-37} y={Number(y)} width="105" height="35" rx="8" fill="#c4d8d0"/><text x={Number(x)+15} y={Number(y)+23} textAnchor="middle" fontSize="16" fill="#183f3b">{name}</text></g>)}
    <text x="420" y="85" textAnchor="middle" fontSize="13" fill="#34564d">Oak Road</text><text x="420" y="185" textAnchor="middle" fontSize="13" fill="#34564d">Lime Road</text>
    <path d="M250 251V221" stroke="#bc623b" strokeWidth="7"/><path d="M239 232L250 216L261 232Z" fill="#bc623b"/><text x="278" y="250" fontSize="14" fill="#823c22">Start · N ↑</text>
  </svg></figure>;
}
