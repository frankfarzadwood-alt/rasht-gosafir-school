/** A fixed fictional reference date keeps duration exercises independent of the real clock. */
export function DurationScene({startYear,endYear}:{startYear:number;endYear:number}){
 return <figure dir="ltr" className="mx-auto mb-3 w-full max-w-md rounded-2xl border border-border bg-secondary/30 p-3"><figcaption className="mb-2 text-center text-xs font-bold">Fictional timeline · reference date: 1 January {endYear}</figcaption><svg viewBox="0 0 420 100" role="img" aria-label={`A continuing period from 1 January ${startYear} to 1 January ${endYear}`} className="w-full">
  <path d="M35 45H385" stroke="#347f7a" strokeWidth="6" strokeLinecap="round"/>{[35,385].map(x=><circle key={x} cx={x} cy="45" r="8" fill="#bf643f"/>)}
  <text x="35" y="25" textAnchor="middle" fontSize="14" fill="currentColor">Start</text><text x="385" y="25" textAnchor="middle" fontSize="14" fill="currentColor">Now</text><text x="35" y="76" textAnchor="middle" fontSize="14" fill="currentColor">{startYear}</text><text x="385" y="76" textAnchor="middle" fontSize="14" fill="currentColor">{endYear}</text>
 </svg></figure>;
}
