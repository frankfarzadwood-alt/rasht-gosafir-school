import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,describe,expect,it,vi} from 'vitest';
import type {ReactNode} from 'react';
import {IELTS_VOCABULARY65_NATIVE as pack} from '@/lib/content/ielts-vocabulary65';
import {nodeById,nodeScope,scopeQuestions} from '@/lib/learning';
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
vi.mock('@tanstack/react-router',()=>({Link:({children,params,search}:{children:ReactNode;params?:{nodeId?:string};search?:{scope?:string;selection?:string}})=><a href={`/practice/${params?.nodeId??''}?scope=${search?.scope??''}&selection=${search?.selection??''}`}>{children}</a>}));
const qs=pack.questions as unknown as Question[],unit=(n:number)=>qs.filter(q=>q.placements?.some(p=>p.node_id.startsWith(`ielts-vocabulary-65.u${String(n).padStart(3,'0')}.`)));
afterEach(cleanup);
describe('IELTS Vocabulary native interactions',()=>{
 it('shows its own course information and exact unit-group review links',()=>{
  const view=render(<IELTSGuide node={nodeById('ielts-vocabulary-65')!}/>);expect(screen.getByRole('heading',{name:'واژه را در کاربرد یاد بگیر'})).toBeInTheDocument();expect(view.container.textContent).toContain('۴۳ فایل شنیداری');expect(view.container.textContent).toContain('۶ تمرین گفتاری');view.rerender(<IELTSGuide node={nodeById('ielts-vocabulary-65.u024')!}/>);expect(screen.getByText('Listen for meaning and corrections')).toBeInTheDocument();view.unmount();render(<ScopePractice node={nodeById('ielts-vocabulary-65.u005')!}/>);expect(screen.getByRole('link',{name:'آزمون تمرینی · ۳۰ سؤال'}).getAttribute('href')).toContain('selection=ieltsv65.native.review.1');
 });
 it('offers every verified recording, including six distinct Unit 24 tracks',()=>{
  const view=render(<ListeningLab pool={qs} back={<span>Back</span>}/>);expect(screen.getAllByRole('option')).toHaveLength(43);fireEvent.change(screen.getByRole('combobox',{name:'فایل شنیداری'}),{target:{value:'ieltsv65.native.audio.42'}});expect(view.container.querySelector('audio')).toHaveAttribute('src','/assets/ielts-vocabulary65-native/track-42.mp3');expect(screen.getByText('In item 1, what does approach mean?')).toBeInTheDocument();expect(screen.queryByText(/searched for a precedent/)).toBeNull();
 });
 it('gates failed media without penalty, keeps playback continuous and unlocks the correct script',async()=>{
  const pool=qs.filter(q=>q.assets.audio==='ieltsv65.native.audio.2').slice(0,2),before=getProgress().attempts.length,view=render(<GameRunner items={pool.map(q=>({q,kind:'auto'}))} grade={null} term={null} mode="listening_lab" scope="ieltsv65-check"/>);let audio=view.container.querySelector('audio')!;expect(screen.getAllByRole('radio').every(b=>(b as HTMLButtonElement).disabled)).toBe(true);fireEvent.error(audio);expect(getProgress().attempts).toHaveLength(before);fireEvent.click(screen.getByRole('button',{name:'تلاش دوباره'}));audio=view.container.querySelector('audio')!;fireEvent.loadedMetadata(audio);await waitFor(()=>expect(screen.getByRole('radio',{name:'Stray cats'})).toBeEnabled());fireEvent.click(screen.getByRole('radio',{name:'Stray cats'}));expect(screen.queryByText(/about 20 cats/)).toBeNull();fireEvent.click(await screen.findByRole('button',{name:'ادامه ←'}));expect(view.container.querySelector('audio')).toBe(audio);fireEvent.click(screen.getByRole('radio',{name:'Cheerful'}));expect(screen.getByText(/about 20 cats/)).toBeInTheDocument();
 });
 it('keeps vocabulary drafts and speaking notes separate from grammar and objective progress',()=>{
  localStorage.setItem('english-quest-writing-ielts-grammar-65-unit-1','Grammar draft.');const before=localStorage.getItem('english-quest-progress-v1'),view=render(<WritingStudio pool={unit(1)} back={<span>Back</span>}/>);fireEvent.change(screen.getByRole('textbox'),{target:{value:'My friend is reliable and tactful.'}});fireEvent.click(screen.getByRole('button',{name:'ذخیرهٔ پیش‌نویس'}));expect(localStorage.getItem('english-quest-writing-ielts-vocabulary-65-unit-1')).toBe('My friend is reliable and tactful.');expect(localStorage.getItem('english-quest-writing-ielts-grammar-65-unit-1')).toBe('Grammar draft.');view.unmount();const speaking=render(<SpeakingStudio pool={unit(1)} back={<span>Back</span>}/>);expect(screen.getByRole('heading',{name:'Human nature · speaking rehearsal'})).toBeInTheDocument();fireEvent.change(screen.getByRole('textbox'),{target:{value:'Example: keeps promises.'}});fireEvent.click(screen.getByRole('button',{name:'ذخیرهٔ یادداشت'}));expect(localStorage.getItem('english-quest-speaking-ielts-vocabulary-65-ieltsv65.speaking.u1')).toBe('Example: keeps promises.');expect(localStorage.getItem('english-quest-progress-v1')).toBe(before);speaking.unmount();render(<WritingStudio pool={scopeQuestions(nodeScope('ielts-vocabulary-65.u001.s1'))} back={<span>Back</span>}/>);expect(screen.queryByRole('textbox')).toBeNull();
 });
 it('renders readable original data and starts all thirty questions in a group review',async()=>{
  const q=qs.find(q=>q.id==='ieltsv65.native.visual.data.1')!,view=render(<NativeScene scene={q.native_scene!}/>);expect(screen.getByRole('img',{name:/Fictional survey/})).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'نمایش جدول داده‌ها'}));expect(screen.getByRole('table')).toHaveTextContent('Year B');view.unmount();const session=assessmentSession(BOOK_CONTENT,pack.assessments[0]!,contextById);render(<FixedAssessment session={session} back={<span>Back</span>}/>);const start=screen.getByRole('button',{name:'شروع آزمون کامل'});await waitFor(()=>expect(start).toBeEnabled());fireEvent.click(start);expect(screen.getByText(/۱\/۳۰/)).toBeInTheDocument();expect(screen.getByRole('radio',{name:'unreliable'})).toBeInTheDocument();
 });
});
