export type BodyPart='forehead'|'eye'|'nose'|'ear'|'neck'|'shoulder'|'elbow'|'wrist'|'hand'|'chest'|'stomach'|'knee'|'ankle'|'foot';
const points:Record<BodyPart,[number,number]>={forehead:[120,30],eye:[110,35],nose:[120,42],ear:[146,39],neck:[120,70],shoulder:[99,84],elbow:[84,127],wrist:[77,165],hand:[72,180],chest:[120,105],stomach:[120,145],knee:[104,247],ankle:[101,286],foot:[96,306]};
/** Original clothed figure; no textbook bitmap or anatomical photo. */
export function BodyPartScene({part}:{part:BodyPart}){
 const [x,y]=points[part];
 return <figure dir="ltr" className="mx-auto mb-3 w-full max-w-44 rounded-2xl bg-secondary/30 p-2"><svg viewBox="55 7 125 315" role="img" aria-label={`Body diagram highlighting the ${part}`} className="mx-auto h-64 max-w-full rounded-xl bg-card">
  <g stroke="#4c6472" strokeWidth="2.5" strokeLinejoin="round">
   <ellipse cx="94" cy="39" rx="5" ry="9" fill="#e7c3a0"/><ellipse cx="146" cy="39" rx="5" ry="9" fill="#e7c3a0"/>
   <path d="M111 58V80H129V58" fill="#e7c3a0"/><circle cx="120" cy="37" r="24" fill="#efd2b3"/>
   <path d="M98 30Q96 11 119 12Q143 11 144 29L134 22Q115 30 105 23Z" fill="#695349"/>
   <path d="M99 84L84 124L77 167M141 84L156 124L164 167" fill="none" stroke="#e7c3a0" strokeWidth="15" strokeLinecap="round"/>
   <ellipse cx="73" cy="180" rx="8" ry="15" fill="#efd2b3"/><ellipse cx="168" cy="180" rx="8" ry="15" fill="#efd2b3"/>
   <path d="M104 210L101 290M136 210L139 290" fill="none" stroke="#e7c3a0" strokeWidth="18" strokeLinecap="round"/>
   <path d="M93 287Q103 282 110 291V312H83Q83 304 93 299ZM131 291Q138 283 147 289V300L157 306V312H131Z" fill="#e7c3a0"/>
   <path d="M99 78L88 98L101 106L101 169H139V106L152 98L141 78L130 74Q120 84 110 74Z" fill="#b4d4c9"/>
   <path d="M101 167H139L146 222H125L120 189L115 222H94Z" fill="#8da3bc"/>
  </g>
  <circle cx="110" cy="35" r="2" fill="#2d3b46"/><circle cx="130" cy="35" r="2" fill="#2d3b46"/><path d="M120 37L118 43H122M113 49Q120 53 127 49" fill="none" stroke="#765e50" strokeWidth="1.5"/>
  <circle cx={x} cy={y} r="8" fill="#f6bb6c" fillOpacity=".35" stroke="#bd572d" strokeWidth="2.5"/><circle cx={x} cy={y} r="2.5" fill="#bd572d"/>
 </svg></figure>;
}
