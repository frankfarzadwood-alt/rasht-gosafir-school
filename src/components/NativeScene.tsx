import type { CSSProperties } from 'react';
import { mediaAsset } from '@/lib/content/pilot';
import type { NativeScene as Scene } from '@/lib/content/evolve';
import { PositionScene } from './PositionScene';
import { CalendarScene } from './CalendarScene';
import { WeatherScene } from './WeatherScene';
import { DirectionScene, PracticeRoute } from './DirectionScene';
import { RuleSign } from './RuleSign';
import { BodyPartScene } from './BodyPartScene';
import { ClothingScene } from './ClothingScene';
import { DurationScene } from './DurationScene';
import { ObjectProblemScene } from './ObjectProblemScene';
import { DataChartScene } from './DataChartScene';

/** A tile from purpose-created art, rendered as an individual native game card. */
export function NativePhoto({ assetId, onLoad, onError, decorative = false }: { assetId: string; onLoad?: () => void; onError?: () => void; decorative?: boolean }) {
  const asset = mediaAsset(assetId);
  if (!asset) return <p role="alert">تصویر آماده نیست.</p>;
  const columns = Number(asset['atlas_columns'] ?? 1), tile = Number(asset['tile_index'] ?? 0);
  const raw = asset['native_crop'];
  const crop = Array.isArray(raw) && raw.length === 4 && raw.every(v => typeof v === 'number' && Number.isFinite(v)) && raw[0] >= 0 && raw[1] >= 0 && raw[2] > 0 && raw[3] > 0 && raw[0] + raw[2] <= 1 && raw[1] + raw[3] <= 1 ? raw as [number, number, number, number] : null;
  const style: CSSProperties = crop ? { position: 'absolute', width: `${100 / crop[2]}%`, maxWidth: 'none', height: `${100 / crop[3]}%`, left: `${-100 * crop[0] / crop[2]}%`, top: `${-100 * crop[1] / crop[3]}%` } : columns > 1 ? { position: 'absolute', width: `${columns * 100}%`, maxWidth: 'none', height: `${columns * 100}%`, left: `${-(tile % columns) * 100}%`, top: `${-Math.floor(tile / columns) * 100}%` } : { width: '100%', height: '100%', objectFit: 'cover' };
  return <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-secondary" dir="ltr"><img src={asset.url} style={style} alt={decorative ? '' : asset.alt} onLoad={onLoad} onError={onError} draggable={false} /></div>;
}

const Person = ({ name, active = false }: { name: string; active?: boolean }) => <span className={`inline-flex min-h-10 items-center justify-center gap-1 rounded-xl border px-2 py-2 text-sm font-bold ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card'}`}><span aria-hidden>{['Helen','Margaret','Anna','Linda','Barbara','Annie'].includes(name) ? '👩' : '👨'}</span><span>{name}</span></span>;
function Family() {
  return <figure aria-label="Bill’s family tree" className="space-y-4 rounded-2xl bg-secondary/50 p-4" dir="ltr">
    <figcaption className="text-center text-sm font-bold">Bill’s family</figcaption>
    <div className="flex items-center justify-center gap-2"><Person name="Helen" /><span aria-label="married to">—</span><Person name="John" /></div>
    <p className="text-center text-xs text-muted-foreground">Helen and John’s children: Margaret and Peter</p>
    <div className="grid grid-cols-2 gap-2 border-t-2 border-primary/25 pt-3"><div className="flex flex-wrap items-center justify-center gap-1 rounded-xl bg-card/50 p-2"><Person name="Margaret" /><span aria-label="married to">＋</span><Person name="Paul" /></div><div className="flex flex-wrap items-center justify-center gap-1 rounded-xl bg-card/50 p-2"><Person name="Peter" /><span aria-label="married to">＋</span><Person name="Anna" /></div></div>
    <div className="space-y-2 border-t-2 border-primary/25 pt-3"><p className="text-center text-xs text-muted-foreground">Margaret and Paul’s children</p><div className="flex flex-wrap justify-center gap-2"><Person name="Bill" active /><Person name="Barry" /><Person name="Barbara" /></div></div>
    <div className="space-y-3 rounded-xl border border-primary/25 p-3"><div className="flex items-center justify-center gap-2"><Person name="Bill" active /><span aria-label="married to">＋</span><Person name="Linda" /></div><p className="text-center text-xs text-muted-foreground">Bill and Linda’s children</p><div className="flex justify-center gap-2"><Person name="Tommy" /><Person name="Annie" /></div></div>
  </figure>;
}
function Preferences() {
  const rows = [['Dan', 'Tea', 'No', '1', 'Yes'], ['Coco', 'Coffee', 'No', '0', 'No'], ['Dalia', 'Tea', 'Yes', '2', 'Yes']];
  return <div className="overflow-x-auto rounded-2xl border border-border" dir="ltr"><table className="w-full text-center text-sm"><caption className="bg-secondary p-3 font-bold">At the café</caption><thead><tr>{['Guest','Drink','Milk','Sugars','Cookie'].map(t => <th key={t} scope="col" className="border-b border-border p-2">{t}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row[0]}>{row.map((v, i) => i ? <td key={i} className="p-3">{v}</td> : <th key={i} scope="row" className="p-3">{v}</th>)}</tr>)}</tbody></table></div>;
}
function CityMap() {
  return <figure className="rounded-2xl border border-border bg-secondary/40 p-3" dir="ltr"><figcaption className="mb-2 text-sm font-bold">Find the zoo</figcaption><svg viewBox="0 0 600 350" className="w-full" role="img" aria-label="City map: You are at the south end of Third Street. City Street is the first crossing, Park Street the second, and Hill Street the third. The zoo is northwest of Park Street and Second Street.">
    <rect x="0" y="0" width="600" height="350" rx="20" fill="#e7eee6" />
    {[120,260,400,540].map(x => <path key={x} d={`M${x} 0V350`} stroke="#fff" strokeWidth="32" />)}
    {[65,160,255].map(y => <path key={y} d={`M0 ${y}H600`} stroke="#fff" strokeWidth="32" />)}
    {['First','Second','Third','Fourth'].map((n, i) => <text key={n} x={120+i*140} y="312" textAnchor="middle" fill="#345546" fontSize="12" transform={`rotate(-90 ${120+i*140} 312)`}>{n} Street</text>)}
    {['Hill Street','Park Street','City Street'].map((n, i) => <text key={n} x="328" y={70+i*95} textAnchor="middle" fill="#345546" fontSize="13" fontWeight="bold">{n}</text>)}
    <rect x="145" y="88" width="90" height="45" rx="10" fill="#bad9b3" /><text x="190" y="115" textAnchor="middle" fontSize="17">Zoo</text>
    <rect x="285" y="90" width="90" height="43" rx="10" fill="#d6c9b4" /><text x="330" y="115" textAnchor="middle" fontSize="13">Museum</text>
    <rect x="425" y="10" width="90" height="30" rx="8" fill="#d6c9b4" /><text x="470" y="30" textAnchor="middle" fontSize="11">Movie theater</text>
    <circle cx="400" cy="333" r="8" fill="#d15e40" /><text x="410" y="339" fill="#8e3625" fontSize="12">YOU ARE HERE ↑</text>
  </svg></figure>;
}
function Room() {
  return <figure className="rounded-2xl border border-border bg-secondary/40 p-3" dir="ltr"><figcaption className="mb-2 text-sm font-bold">Look around this room</figcaption><svg viewBox="0 0 480 260" className="w-full" role="img" aria-label="A study with a desk, a bookcase and two large windows. There is no shower or lamp.">
    <rect width="480" height="260" rx="20" fill="#f1e6d5" /><path d="M0 205H480V260H0Z" fill="#d1aa7a" />
    {[180,310].map(x => <g key={x}><rect x={x} y="30" width="105" height="115" rx="4" fill="#a6d9ee" stroke="#fff" strokeWidth="9" /><path d={`M${x+52} 30V145M${x} 86H${x+105}`} stroke="#fff" strokeWidth="6" /></g>)}
    <rect x="24" y="36" width="104" height="175" fill="#906c48" />{[75,115,155,200].map(y => <path key={y} d={`M25 ${y}H127`} stroke="#62492e" strokeWidth="6" />)}
    {[0,1,2].flatMap(row => [0,1,2,3,4].map(col => <rect key={`${row}-${col}`} x={32+col*17} y={43+row*40} width="12" height="30" rx="2" fill={['#68917d','#d48e69','#7e95ae'][col%3]} />))}
    <path d="M170 170H440V184H170ZM185 184H198V245H185ZM412 184H425V245H412Z" fill="#8b603c" /><rect x="260" y="148" width="78" height="21" rx="3" fill="#71877b" />
  </svg></figure>;
}
export function NativeScene({ scene }: { scene: Scene }) {
  if (scene.kind === 'data_chart') return <DataChartScene title={scene.title} unit={scene.unit} values={scene.values} maximum={scene.maximum}/>;
  if (scene.kind === 'object_problem') return <ObjectProblemScene problem={scene.problem}/>;
  if (scene.kind === 'body_part') return <BodyPartScene part={scene.part}/>;
  if (scene.kind === 'clothing') return <ClothingScene pattern={scene.pattern} sleeve={scene.sleeve}/>;
  if (scene.kind === 'duration') return <DurationScene startYear={scene.startYear} endYear={scene.endYear}/>;
  if (scene.kind === 'process_sequence') return <figure dir="ltr" className="mb-3 rounded-2xl border border-border bg-secondary/30 p-3"><figcaption className="mb-3 text-center text-sm font-bold">{scene.title}</figcaption><ol className="flex flex-wrap items-center justify-center gap-2">{scene.steps.map((step,i)=><li key={i} className="flex items-center gap-2"><span className="rounded-xl border border-border bg-card p-3 text-sm"><b>{i+1}.</b> {step}</span>{i<scene.steps.length-1&&<span aria-hidden>→</span>}</li>)}</ol></figure>;
  if (scene.kind === 'direction_arrow') return <DirectionScene turn={scene.turn}/>;
  if (scene.kind === 'practice_route') return <PracticeRoute/>;
  if (scene.kind === 'rule_sign') return <RuleSign symbol={scene.symbol}/>;
  if (scene.kind === 'calendar') return <CalendarScene scene={scene}/>;
  if (scene.kind === 'weather') return <WeatherScene condition={scene.condition}/>;
  if (scene.kind === 'position') return <PositionScene relation={scene.relation}/>;
  if (scene.kind === 'clock') {
    const minuteAngle=scene.minute*6, hourAngle=(scene.hour%12)*30+scene.minute/2;
    return <figure className="mx-auto max-w-64 rounded-3xl bg-secondary/50 p-4" dir="ltr"><svg viewBox="0 0 240 240" role="img" aria-label={`Analogue clock showing ${scene.hour}:${String(scene.minute).padStart(2,'0')}`} className="w-full"><circle cx="120" cy="120" r="114" fill="var(--card)" stroke="var(--primary)" strokeWidth="5" />{Array.from({length:60},(_,i)=><path key={i} d={`M120 ${i%5===0?14:11}V${i%5===0?23:15}`} transform={`rotate(${i*6} 120 120)`} stroke="var(--foreground)" strokeWidth={i%5===0?2.5:1} />)}{Array.from({length:12},(_,i)=>{const a=(i+1)*Math.PI/6;return <text key={i} x={120+80*Math.sin(a)} y={126-80*Math.cos(a)} textAnchor="middle" fill="var(--foreground)" fontSize="17" fontWeight="bold">{i+1}</text>;})}<path d="M120 120V67" transform={`rotate(${hourAngle} 120 120)`} stroke="var(--primary)" strokeWidth="9" strokeLinecap="round" /><path d="M120 120V39" transform={`rotate(${minuteAngle} 120 120)`} stroke="var(--foreground)" strokeWidth="4" strokeLinecap="round" /><circle cx="120" cy="120" r="7" fill="var(--primary)" /></svg></figure>;
  }
  if (scene.kind === 'colour_mix') return <figure aria-label={`Mix ${scene.colours.join(' and ')}`} className="flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-secondary/40 p-5" dir="ltr">{scene.colours.map((c,i)=><span key={`${c}:${i}`} className="contents">{i>0&&<span aria-hidden className="text-3xl">＋</span>}<span className="inline-flex h-20 w-20 items-center justify-center rounded-full border-4 border-card shadow" style={{backgroundColor:c}} aria-label={c} /></span>)}<span aria-hidden className="text-3xl">＝ ?</span></figure>;
  if (scene.kind === 'table') return <div className="overflow-x-auto rounded-2xl border border-border" dir="ltr"><table className="w-full text-left text-sm"><caption className="bg-secondary p-3 text-left font-bold">{scene.title}</caption><thead><tr>{scene.columns.map(c=><th key={c} scope="col" className="border-b border-border p-3">{c}</th>)}</tr></thead><tbody>{scene.rows.map((r,i)=><tr key={i} className="even:bg-secondary/30">{r.map((c,j)=>j?<td key={j} className="p-3">{c}</td>:<th key={j} scope="row" className="p-3">{c}</th>)}</tr>)}</tbody></table>{scene.note&&<p className="border-t border-border p-3 text-xs">{scene.note}</p>}</div>;
  if (scene.kind === 'family') return <Family />;
  if (scene.kind === 'preferences') return <Preferences />;
  if (scene.kind === 'map') return <CityMap />;
  if (scene.kind === 'room') return <Room />;
  if (scene.kind === 'sentence_cue') return <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-secondary p-4 text-base" dir="ltr">{[scene.subject,scene.verb,scene.object].map((t,i)=><span key={i} className="rounded-xl bg-card px-3 py-2 font-bold">{t}</span>)}<span className="rounded-full bg-card px-3 py-2" aria-label={scene.polarity}>{scene.polarity === 'positive' ? '＋' : '−'}</span></div>;
  if (scene.kind === 'quote') return <blockquote dir="ltr" lang="en" className="rounded-2xl border-l-4 border-teal bg-secondary p-4 text-left leading-relaxed">{scene.text}</blockquote>;
  return null;
}
