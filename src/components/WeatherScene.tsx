import type { NativeScene } from '@/lib/content/evolve';

/** Original vector clues, with temperature cues kept separate from sky conditions. */
export function WeatherScene({condition}:{condition:Extract<NativeScene,{kind:'weather'}>['condition']}) {
  const temperature=condition==='hot'||condition==='cold',colour=condition==='hot'?'#d25b38':'#247ab6';
  const cloud=<path d="M72 105C39 103 43 64 76 65C80 25 135 22 151 57C188 35 224 62 215 91C244 103 221 125 199 120H80C69 120 61 114 62 105Z" fill="#b8c7d5" stroke="#4b657c" strokeWidth="5"/>;
  return <figure dir="ltr" className="mx-auto mb-3 w-full max-w-56 rounded-2xl bg-secondary/40 p-3"><svg viewBox="0 0 280 190" role="img" aria-label={temperature?`Thermometer: ${condition==='hot'?'38':'−5'} degrees Celsius`:`Weather diagram: ${condition}`} className="w-full rounded-xl bg-card">
    {condition==='sunny'&&<><circle cx="140" cy="95" r="40" fill="#f5c553" stroke="#a86713" strokeWidth="4"/>{Array.from({length:12},(_,i)=><path key={i} d="M140 25V9" transform={`rotate(${i*30} 140 95)`} stroke="#d49721" strokeWidth="6" strokeLinecap="round"/>)}</>}
    {['cloudy','raining','snowing'].includes(condition)&&cloud}
    {condition==='raining'&&[90,125,160,195].map((x,i)=><path key={x} d={`M${x} ${133+i%2*8}l-10 21`} stroke="#277bb5" strokeWidth="6" strokeLinecap="round"/>)}
    {condition==='snowing'&&[87,140,193].map(x=><g key={x} stroke="#3985ab" strokeWidth="3"><path d={`M${x} 134V164M${x-13} 142l26 14M${x-13} 156l26-14`}/></g>)}
    {condition==='windy'&&<><path d="M36 62H180C220 62 211 20 184 32M22 98H226C265 98 254 55 229 66M43 137H157C196 137 192 175 164 166" fill="none" stroke="#4e7f96" strokeWidth="7" strokeLinecap="round"/><path d="M224 145Q253 116 259 137Q254 164 224 145Z" fill="#5d9372"/></>}
    {condition==='foggy'&&<><path d="M48 155V95H98V155M178 155V70H230V155" fill="#d4ddd7"/><path d="M20 68H247M37 101H263M17 135H241" stroke="#8799a6" strokeWidth="13" strokeLinecap="round" opacity=".75"/></>}
    {temperature&&<><rect x="76" y="25" width="28" height="123" rx="14" fill="#edf4f7" stroke="#526c7e" strokeWidth="4"/><circle cx="90" cy="151" r="24" fill={colour} stroke="#526c7e" strokeWidth="4"/><path d={`M90 150V${condition==='hot'?44:125}`} stroke={colour} strokeWidth="13" strokeLinecap="round"/>{[49,70,91,112].map(y=><path key={y} d={`M108 ${y}h12`} stroke="#526c7e" strokeWidth="3"/>)}<text x="184" y="105" textAnchor="middle" fontSize="37" fontWeight="bold" fill="currentColor">{condition==='hot'?'38°C':'−5°C'}</text></>}
  </svg></figure>;
}
