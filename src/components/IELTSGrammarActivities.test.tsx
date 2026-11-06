import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,describe,expect,it,vi} from 'vitest';
import type {ReactNode} from 'react';
import {IELTS_GRAMMAR_NATIVE as pack} from '@/lib/content/ielts-grammar65';
import {nodeById} from '@/lib/learning';
import {assessmentSession} from '@/lib/scope';
import {BOOK_CONTENT} from '@/lib/content/pilot';
import {contextById,type Question} from '@/lib/bank';
import {getProgress} from '@/lib/progress';
import {IELTSGuide} from './IELTSGuide';
import {ScopePractice} from './LearningHub';
import {WritingStudio} from './WritingStudio';
import {SpeakingStudio} from './SpeakingStudio';
import {ListeningLab} from './ListeningLab';
import {GameRunner} from './GameRunner';
import {FixedAssessment} from './FixedAssessment';
import {NativeScene} from './NativeScene';
import {QuestionView} from './QuestionView';
vi.mock('@tanstack/react-router',()=>({Link:({children,params,search}:{children:ReactNode;params?:{nodeId?:string};search?:{scope?:string;selection?:string}})=><a href={`/practice/${params?.nodeId??''}?scope=${search?.scope??''}&selection=${search?.selection??''}`}>{children}</a>}));
const qs=pack.questions as unknown as Question[],unit=(n:number)=>qs.filter(q=>q.placements?.some(p=>p.node_id.startsWith(`ielts-grammar-65.u${String(n).padStart(3,'0')}.`)));
afterEach(()=>{cleanup();vi.useRealTimers();});
describe('IELTS Grammar native interactions',()=>{
 it('shows the grammar course, source-specific targets and book-scope fixed-review links',()=>{
  const view=render(<IELTSGuide node={nodeById('ielts-grammar-65')!}/>);expect(screen.getByRole('heading',{name:'ساختار را بفهم، دقیق‌تر بیان کن'})).toBeInTheDocument();expect(view.container.textContent).toContain('۳۲ فایل شنیداری');view.rerender(<IELTSGuide node={nodeById('ielts-grammar-65.u025.s2')!}/>);expect(screen.getByText('Actions and qualities as nouns')).toBeInTheDocument();view.unmount();render(<ScopePractice node={nodeById('ielts-grammar-65')!}/>);const reviews=screen.getAllByRole('link',{name:'آزمون تمرینی · ۵۰ سؤال'});expect(reviews).toHaveLength(2);for(const r of reviews)expect(r.getAttribute('href')).toContain('scope=whole_book');expect(screen.getByRole('link',{name:/استودیوی گفتار/})).toBeInTheDocument();
 });
 it('keeps IELTS drafts separate from Project and Evolve and avoids writing in listening-only pools',()=>{
  localStorage.setItem('english-quest-writing-project-5-unit-1','Project draft.');localStorage.setItem('english-quest-writing-evolve-1-unit-1','Evolve draft.');const before=localStorage.getItem('english-quest-progress-v1'),view=render(<WritingStudio pool={unit(25)} back={<span>Back</span>}/>);expect(screen.getByRole('heading',{name:'Reporting change with noun phrases'})).toBeInTheDocument();fireEvent.change(screen.getByRole('textbox'),{target:{value:'There was an increase of fifteen in participation.'}});fireEvent.click(screen.getByRole('button',{name:'ذخیرهٔ پیش‌نویس'}));expect(localStorage.getItem('english-quest-writing-ielts-grammar-65-unit-25')).toBe('There was an increase of fifteen in participation.');expect(localStorage.getItem('english-quest-writing-project-5-unit-1')).toBe('Project draft.');expect(localStorage.getItem('english-quest-writing-evolve-1-unit-1')).toBe('Evolve draft.');expect(localStorage.getItem('english-quest-progress-v1')).toBe(before);view.rerender(<WritingStudio pool={qs.filter(q=>q.assets.audio==='ieltsg.native.audio.2')} back={<span>Back</span>}/>);expect(screen.queryByRole('textbox')).toBeNull();
 });
 it('offers all 32 tracks with distinct present-perfect parts and reported-speech labels',()=>{
  const view=render(<ListeningLab pool={qs} back={<span>Back</span>}/>),options=screen.getAllByRole('option');expect(options).toHaveLength(32);expect(options[3]).toHaveTextContent('بخش اول');expect(options[4]).toHaveTextContent('بخش دوم');expect(options[18]).toHaveTextContent('مصاحبه');expect(options[19]).toHaveTextContent('گزارش');fireEvent.change(screen.getByRole('combobox',{name:'فایل شنیداری'}),{target:{value:'ieltsg.native.audio.6'}});expect(view.container.querySelector('audio')).toHaveAttribute('src','/assets/ielts-grammar65-native/track-06.mp3');expect(screen.getByText('What reading approach does Sue recommend in this part?')).toBeInTheDocument();expect(screen.queryByText(/I find the best approach/)).toBeNull();
 });
 it('gates required audio, preserves its element and unlocks the correct part’s script after dependent answers',async()=>{
  const pool=qs.filter(q=>q.assets.audio==='ieltsg.native.audio.6').slice(0,2),before=getProgress().attempts.length,view=render(<GameRunner items={pool.map(q=>({q,kind:'auto'}))} grade={null} term={null} mode="listening_lab" scope="ieltsg-part2-check"/>);let audio=view.container.querySelector('audio')!;expect(screen.getAllByRole('radio').every(b=>(b as HTMLButtonElement).disabled)).toBe(true);fireEvent.error(audio);expect(getProgress().attempts).toHaveLength(before);fireEvent.click(screen.getByRole('button',{name:'تلاش دوباره'}));audio=view.container.querySelector('audio')!;fireEvent.loadedMetadata(audio);await waitFor(()=>expect(screen.getByRole('radio',{name:'Read sections needed for the question'})).toBeEnabled());fireEvent.click(screen.getByRole('radio',{name:'Read sections needed for the question'}));expect(screen.queryByText(/I find the best approach/)).toBeNull();fireEvent.click(await screen.findByRole('button',{name:'ادامه ←'}));expect(view.container.querySelector('audio')).toBe(audio);fireEvent.click(screen.getByRole('radio',{name:'In the library'}));expect(screen.getByText(/I find the best approach/)).toBeInTheDocument();
 });
 it('renders and grades original data diagrams with an optional accessible values table',()=>{
  const q=qs.find(q=>q.id==='ieltsg.native.visual.comparisons.1')!,submit=vi.fn(),view=render(<><NativeScene scene={q.native_scene!}/><QuestionView item={{q,kind:'auto'}} locked={false} onSubmit={submit}/></>);expect(screen.getByRole('img',{name:/Fictional workshop attendance/})).toBeInTheDocument();expect(screen.queryByRole('table')).toBeNull();fireEvent.click(screen.getByRole('button',{name:'نمایش جدول داده‌ها'}));expect(screen.getByRole('table')).toHaveTextContent('Design · Spring');fireEvent.click(screen.getByRole('radio',{name:'twice'}));expect(submit).toHaveBeenCalledWith('twice',true);expect(view.container.querySelector('img')).toBeNull();
 });
 it('starts a complete fifty-question fixed review without truncating to a short practice exam',async()=>{
  const session=assessmentSession(BOOK_CONTENT,pack.assessments[0]!,contextById),before=getProgress().attempts.length;render(<FixedAssessment session={session} back={<span>Back</span>}/>);const start=screen.getByRole('button',{name:'شروع آزمون کامل'});await waitFor(()=>expect(start).toBeEnabled());fireEvent.click(start);expect(screen.getByText(/۱\/۵۰/)).toBeInTheDocument();expect(screen.getByRole('radio',{name:'walks'})).toBeInTheDocument();expect(getProgress().attempts).toHaveLength(before);
 });
 it('runs an unscored cue-card timer and saves separate speaking notes without objective rewards',()=>{
  vi.useFakeTimers();const before=localStorage.getItem('english-quest-progress-v1'),view=render(<SpeakingStudio pool={unit(7)} back={<span>Back</span>}/>);expect(screen.getByRole('heading',{name:'Describe a useful room'})).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'شروع آماده‌سازی · ۶۰ ثانیه'}));expect(screen.getByLabelText('زمان باقی‌مانده')).toHaveTextContent('۱:۰۰');act(()=>vi.advanceTimersByTime(1000));expect(screen.getByLabelText('زمان باقی‌مانده')).toHaveTextContent('۰:۵۹');fireEvent.click(screen.getByRole('button',{name:'مکث تایمر'}));act(()=>vi.advanceTimersByTime(3000));expect(screen.getByLabelText('زمان باقی‌مانده')).toHaveTextContent('۰:۵۹');fireEvent.click(screen.getByRole('button',{name:'شروع صحبت · ۱۲۰ ثانیه'}));expect(screen.getByLabelText('زمان باقی‌مانده')).toHaveTextContent('۲:۰۰');act(()=>vi.advanceTimersByTime(120000));expect(screen.getByText('زمان این مرحله تمام شد؛ هر وقت آماده‌ای ادامه بده.')).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'پرسش‌های تکمیلی'}));expect(screen.getByRole('heading',{name:'Develop the discussion'})).toBeInTheDocument();fireEvent.change(screen.getByRole('textbox'),{target:{value:'Room, furniture, a little space.'}});fireEvent.click(screen.getByRole('button',{name:'ذخیرهٔ یادداشت'}));expect(localStorage.getItem('english-quest-speaking-ielts-grammar-65-ieltsg.speaking.room')).toBe('Room, furniture, a little space.');expect(localStorage.getItem('english-quest-progress-v1')).toBe(before);view.unmount();render(<SpeakingStudio pool={unit(1)} back={<span>Back</span>}/>);expect(screen.queryByRole('textbox')).toBeNull();
 });
});
