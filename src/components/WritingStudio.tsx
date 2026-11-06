import { useEffect, useState, type ReactNode } from 'react';
import { Button } from './ui/button';
import { evolveUnitNumbers } from '@/lib/content/evolve';
import { EVOLVE_ADDED_WRITING } from '@/lib/content/evolve-series';
import { PROJECT_GUIDES, projectWritingUnits } from '@/lib/content/project-series';
import { IELTS_GUIDES,ieltsWritingUnits } from '@/lib/content/ielts-series';
import type { Question } from '@/lib/bank';
import { fa } from '@/lib/fa';

const tasks = [
  { title: 'My profile', prompt: 'Write a short profile for a new English class. Introduce yourself or an invented character. Include a name, a country, a nationality, a job and a school.', checks: ['I introduced the person with I’m / My name is.', 'I included a country and nationality.', 'I used capital letters for names and countries.', 'I ended complete sentences with punctuation.'] },
  { title: 'Great people', prompt: 'Introduce a friend, family member or an invented band. Describe the people, their ages and their relationships.', checks: ['I used he / she / they with the correct form of be.', 'I included family words or jobs.', 'I used adjectives to describe people.', 'I checked names, ages and punctuation.'] },
  { title: 'Welcome to my home', prompt: 'Write a home-share advertisement for a real or imagined home. Describe the rooms, furniture and what a visitor can use.', checks: ['I named rooms and furniture.', 'I used a / an and singular or plural forms.', 'I made ownership clear with my / our / their.', 'My advertisement gives useful information.'] },
  { title: 'A product review', prompt: 'Write a short review of a phone, app or other piece of technology. Say what you have, what you use it for, and what you like or dislike.', checks: ['I used the simple present.', 'I included an affirmative and a negative statement.', 'I put adjectives before nouns.', 'I explained at least one opinion.'] },
  { title: 'A happy routine', prompt: 'Describe a balanced day for an invented student. Include morning, afternoon and evening activities, times and free time.', checks: ['I gave times for activities.', 'I used the simple present with the correct verb endings.', 'I included frequency words such as usually.', 'I included both work and play.'] },
  { title: 'My neighborhood', prompt: 'Describe a neighborhood and give directions from one place to another. You can use the map in this unit or invent your own place.', checks: ['I named places in a town.', 'I used there is / there are accurately.', 'I included turn left / turn right or go straight.', 'My route has a clear start and destination.'] },
  { title: 'What is happening now?', prompt: 'Imagine a busy café or a street scene. Write what different people are doing right now.', checks: ['I used am / is / are + verb-ing.', 'I described more than one person.', 'I included an affirmative and a negative sentence.', 'I distinguished now from a usual routine.'] },
  { title: 'The right person', prompt: 'Write a short application for a job or a club. Describe what you can do, what you cannot do yet, and why you want to join.', checks: ['I used can / can’t with the base verb.', 'I included at least three abilities.', 'I connected ideas with and / but.', 'I gave a reason for applying.'] },
  { title: 'A great destination', prompt: 'Recommend a place to visit. Describe things a visitor can do, what they need to take, and why you like it.', checks: ['I included travel vocabulary.', 'I used want to / need to + base verb.', 'I gave useful recommendations.', 'I checked this / that / these / those.'] },
  { title: 'Let’s meet', prompt: 'Write an invitation and a reply. Arrange a day, time and place. Describe what you are going to do and what clothes suit the weather.', checks: ['I used going to for plans.', 'I included a clear place, day and time.', 'I accepted the invitation or suggested another plan politely.', 'I included weather or clothing vocabulary.'] },
  { title: 'A colorful memory', prompt: 'Describe a meaningful object or an old photo. Explain where you were, who was there, and why the memory is important.', checks: ['I used was / were correctly.', 'I described people or objects with adjectives.', 'I made it / them refer clearly to a noun.', 'I explained why the memory matters.'] },
  { title: 'A hotel or restaurant review', prompt: 'Write about an imagined or real visit to a hotel or restaurant. Say what you did, ate or liked, and describe one problem.', checks: ['I used simple past forms.', 'I included positive and negative comments.', 'I used food, hotel or restaurant vocabulary.', 'I gave details that help another visitor.'] },
];

/** Personal responses stay unscored. Drafts have a separate storage key and never award objective mastery. */
export function WritingStudio({ pool, back }: { pool: Question[]; back: ReactNode }) {
  const book = Number(pool.flatMap(q => q.placements ?? []).map(p => p.node_id.match(/^evolve-([1-6])\./)?.[1]).find(Boolean) ?? 1);
  const project = PROJECT_GUIDES.find(g=>pool.some(q=>q.placements?.some(p=>p.node_id.startsWith(g.id+'.'))));
  const ielts = IELTS_GUIDES.find(g=>pool.some(q=>q.placements?.some(p=>p.node_id.startsWith(g.id+'.'))));
  const units = ielts ? ieltsWritingUnits(pool,ielts.id) : project ? projectWritingUnits(pool,project.book) : evolveUnitNumbers(pool, true, book);
  const [unit, setUnit] = useState(units[0] ?? 1), [draft, setDraft] = useState(''), [checks, setChecks] = useState<number[]>([]), [saved, setSaved] = useState(false);
  const bookTasks = ielts ? ielts.writing : project ? project.writing : book === 1 ? tasks : EVOLVE_ADDED_WRITING[book] ?? [];
  const task = units.length ? bookTasks[unit-1] : undefined;
  const key = ielts ? `english-quest-writing-${ielts.id}-unit-${unit}` : project ? `english-quest-writing-${project.id}-unit-${unit}` : `english-quest-writing-evolve-${book}-unit-${unit}`;
  useEffect(() => { try { setDraft(localStorage.getItem(key) ?? ''); } catch { setDraft(''); } setChecks([]); setSaved(false); }, [key]);
  if(!task)return <section className="card-soft space-y-3 p-5"><p>تمرین نوشتاری این بخش در حال آماده‌سازی است.</p>{back}</section>;
  return <section className="card-soft space-y-5 p-5">
    <p className="text-sm text-muted-foreground">نوشتن آزاد با بازبینی خودت؛ این تمرین نمرهٔ خودکار، امتیاز یا تسلط ثبت نمی‌کند.</p>
    {units.length > 1 && <label className="block space-y-2"><span className="font-bold">درس</span><select value={unit} onChange={e => setUnit(Number(e.target.value))} className="h-12 w-full rounded-xl border border-input bg-card px-3">{units.map(n => <option key={n} value={n}>{fa(n)} · {bookTasks[n-1]!.title}</option>)}</select></label>}
    <div dir="ltr" lang="en" className="space-y-2 text-left"><h2 className="text-xl font-extrabold">{task.title}</h2><p className="leading-relaxed">{task.prompt}</p></div>
    <label className="block space-y-2"><span className="font-bold">متن تو</span><textarea value={draft} onChange={e => { setDraft(e.target.value); setSaved(false); }} maxLength={6000} rows={8} dir="ltr" lang="en" spellCheck className="en w-full resize-y rounded-2xl border-2 border-input bg-card p-4 text-left leading-relaxed focus:border-primary" /></label>
    <p className="text-xs text-muted-foreground">{fa(draft.trim() ? draft.trim().split(/\s+/).length : 0)} کلمه</p>
    <fieldset className="space-y-2"><legend className="mb-2 font-bold">متنت را بازبینی کن</legend>{task.checks.map((text,i) => <label key={text} className="flex min-h-11 items-start gap-3 rounded-xl bg-secondary/50 p-3"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={checks.includes(i)} onChange={() => setChecks(c => c.includes(i) ? c.filter(n => n!==i) : [...c,i])} /><span dir="ltr" lang="en" className="flex-1 text-left text-sm">{text}</span></label>)}</fieldset>
    <Button onClick={() => { try { localStorage.setItem(key,draft); setSaved(true); } catch { setSaved(false); } }}>ذخیرهٔ پیش‌نویس</Button>
    {saved && <p role="status" className="text-sm text-teal">پیش‌نویس روی همین مرورگر ذخیره شد.</p>}{back}
  </section>;
}
