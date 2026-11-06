export function ClothingScene({pattern,sleeve}:{pattern:'plain'|'striped'|'checked';sleeve:'short'|'long'}){
 const patternId=`shirt-pattern-${pattern}-${sleeve}`;
 const shape=sleeve==='short'?'M85 36L52 49L26 98L63 116L78 91V199H182V91L197 116L234 98L208 49L175 36L153 27Q130 43 107 27Z':'M85 36L52 49L18 164L51 176L78 91V199H182V91L209 176L242 164L208 49L175 36L153 27Q130 43 107 27Z';
 return <figure dir="ltr" className="mx-auto mb-3 w-full max-w-56 rounded-2xl bg-secondary/30 p-2"><svg viewBox="0 0 260 220" role="img" aria-label={`Blue ${pattern} ${sleeve}-sleeved shirt`} className="w-full rounded-xl bg-card">
  <defs><pattern id={patternId} width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#5d91ae"/>{pattern==='striped'&&<path d="M0 8H20" stroke="#e4edf2" strokeWidth="6"/>}{pattern==='checked'&&<><path d="M0 10H20M10 0V20" stroke="#ddeaf0" strokeWidth="5"/><path d="M0 0H20M0 0V20" stroke="#294f69" strokeWidth="2"/></>}</pattern></defs>
  <path d={shape} fill={`url(#${patternId})`} stroke="#294f69" strokeWidth="4" strokeLinejoin="round"/>
  <path d="M107 27L130 54L153 27M130 55V199" fill="none" stroke="#294f69" strokeWidth="3"/>
  {[77,103,129,155,181].map(y=><circle key={y} cx="132" cy={y} r="2.5" fill="#f2f5f7"/>)}
 </svg></figure>;
}
