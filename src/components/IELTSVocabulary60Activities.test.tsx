import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,describe,expect,it,vi} from 'vitest';
import type {ReactNode} from 'react';
import {IELTS_VOCABULARY60_NATIVE as pack} from '@/lib/content/ielts-vocabulary60';
import {nodeById,nodeScope,scopeQuestions} from '@/lib/learning';
import {assessmentSession} from '@/lib/scope';
import {BOOK_CONTENT,mediaAsset} from '@/lib/content/pilot';
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
const qs=pack.questions as unknown as Question[],unit=(n:number)=>qs.filter(q=>q.placements?.some(p=>p.node_id.startsWith(`ielts-vocabulary-60.u${String(n).padStart(3,'0')}.`)));
afterEach(cleanup);
describe('IELTS Vocabulary up to 6.0 native interactions',()=>{
 it('shows this book’s guide and exact forty-question group review',()=>{
  const view=render(<IELTSGuide node={nodeById('ielts-vocabulary-60')!}/>);expect(screen.getByRole('heading',{name:'از واژه تا جمله و گفت‌وگو'})).toBeInTheDocument();expect(view.container.textContent).toContain('۴۸ فایل شنیداری');view.rerender(<IELTSGuide node={nodeById('ielts-vocabulary-60.u025')!}/>);expect(screen.getByText('Purpose and tone')).toBeInTheDocument();view.unmount();render(<ScopePractice node={nodeById('ielts-vocabulary-60.u005')!}/>);expect(screen.getByRole('link',{name:'آزمون تمرینی · ۴۰ سؤال'}).getAttribute('href')).toContain('selection=ieltsv60.native.review.1');
 });
 it('keeps multipart recording labels and distinguishes review notes from supplied spoken lists',()=>{
  const view=render(<ListeningLab pool={qs} back={<span>Back</span>}/>);const options=screen.getAllByRole('option');expect(options).toHaveLength(48);expect(options[0]).toHaveTextContent('۱a');expect(options[2]).toHaveTextContent('۱c');expect(options[8]).toHaveTextContent('۳d');expect(screen.getByText(/این یادداشت‌ها متن کلمه‌به‌کلمهٔ ضبط نیستند/)).toBeInTheDocument();fireEvent.change(screen.getByRole('combobox',{name:'فایل شنیداری'}),{target:{value:'ieltsv60.native.audio.3c'}});expect(view.container.querySelector('audio')).toHaveAttribute('src','/assets/ielts-vocabulary60-native/track-03c.mp3');expect(screen.queryByText(/این یادداشت‌ها متن کلمه‌به‌کلمهٔ ضبط نیستند/)).toBeNull();fireEvent.change(screen.getByRole('combobox',{name:'فایل شنیداری'}),{target:{value:'ieltsv60.native.audio.22b'}});expect(view.container.querySelector('audio')).toHaveAttribute('src','/assets/ielts-vocabulary60-native/track-22b.mp3');expect(screen.getByText("Which word form is used for young children's artistic ability?")).toBeInTheDocument();expect(screen.queryByText(/Ten sentences use different/)).toBeNull();
 });
 it('gates failed audio without penalty, preserves playback and unlocks an honestly labelled review',async()=>{
  const pool=qs.filter(q=>q.assets.audio==='ieltsv60.native.audio.1a').slice(0,2),before=getProgress().attempts.length,view=render(<GameRunner items={pool.map(q=>({q,kind:'auto'}))} grade={null} term={null} mode="listening_lab" scope="ieltsv60-check"/>);let audio=view.container.querySelector('audio')!;expect(screen.getAllByRole('radio').every(b=>(b as HTMLButtonElement).disabled)).toBe(true);fireEvent.error(audio);expect(getProgress().attempts).toHaveLength(before);fireEvent.click(screen.getByRole('button',{name:'تلاش دوباره'}));audio=view.container.querySelector('audio')!;fireEvent.loadedMetadata(audio);await waitFor(()=>expect(screen.getByRole('radio',{name:'Speaker A'})).toBeEnabled());fireEvent.click(screen.getByRole('radio',{name:'Speaker A'}));expect(screen.queryByText(/Four speakers describe different/)).toBeNull();fireEvent.click(await screen.findByRole('button',{name:'ادامه ←'}));expect(view.container.querySelector('audio')).toBe(audio);fireEvent.click(screen.getByRole('radio',{name:'A university tutor'}));expect(screen.getByLabelText('مرور فایل صوتی')).toHaveTextContent('not a word-for-word transcript');
 });
 it('requires every independent picture to load and grades the selected image identity',async()=>{
  const q=qs.find(q=>q.id==='ieltsv60.native.picture.animals.1')!,submit=vi.fn(),view=render(<QuestionView item={{q,kind:'auto'}} locked={false} onSubmit={submit}/>),images=[...view.container.querySelectorAll('img')];expect(images).toHaveLength(3);for(const img of images.slice(0,2))fireEvent.load(img);expect(screen.getAllByRole('button').every(b=>(b as HTMLButtonElement).disabled)).toBe(true);fireEvent.load(images[2]!);const correctAlt=mediaAsset(q.native_options![q.answer.correct_option_id!]!)!.alt;await waitFor(()=>expect(screen.getByAltText(correctAlt).closest('button')).toBeEnabled());fireEvent.click(screen.getByAltText(correctAlt).closest('button')!);expect(submit).toHaveBeenCalledWith(correctAlt,true);
 });
 it('keeps this book’s writing and speaking saves separate from the advanced book and objective progress',()=>{
  localStorage.setItem('english-quest-writing-ielts-vocabulary-65-unit-25','Advanced draft.');const before=localStorage.getItem('english-quest-progress-v1'),view=render(<WritingStudio pool={unit(25)} back={<span>Back</span>}/>);fireEvent.change(screen.getByRole('textbox'),{target:{value:'Dear Ms Rahimi, I am writing to enquire about the course.'}});fireEvent.click(screen.getByRole('button',{name:'ذخیرهٔ پیش‌نویس'}));expect(localStorage.getItem('english-quest-writing-ielts-vocabulary-60-unit-25')).toContain('Dear Ms Rahimi');expect(localStorage.getItem('english-quest-writing-ielts-vocabulary-65-unit-25')).toBe('Advanced draft.');view.unmount();const speaking=render(<SpeakingStudio pool={unit(12)} back={<span>Back</span>}/>);expect(screen.getByRole('heading',{name:'Information technology · speaking rehearsal'})).toBeInTheDocument();fireEvent.change(screen.getByRole('textbox'),{target:{value:'A portable device; functions and examples.'}});fireEvent.click(screen.getByRole('button',{name:'ذخیرهٔ یادداشت'}));expect(localStorage.getItem('english-quest-speaking-ielts-vocabulary-60-ieltsv60.speaking.u12')).toBe('A portable device; functions and examples.');expect(localStorage.getItem('english-quest-progress-v1')).toBe(before);speaking.unmount();render(<WritingStudio pool={scopeQuestions(nodeScope('ielts-vocabulary-60.u025.s1'))} back={<span>Back</span>}/>);expect(screen.queryByRole('textbox')).toBeNull();
 });
 it('renders original chart data and starts the complete forty-question review',async()=>{
  const q=qs.find(q=>q.id==='ieltsv60.native.visual.attendance.1')!,view=render(<NativeScene scene={q.native_scene!}/>);expect(screen.getByRole('img',{name:/Fictional workshop attendance/})).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'نمایش جدول داده‌ها'}));expect(screen.getByRole('table')).toHaveTextContent('Session C');view.unmount();const session=assessmentSession(BOOK_CONTENT,pack.assessments[0]!,contextById);render(<FixedAssessment session={session} back={<span>Back</span>}/>);const start=screen.getByRole('button',{name:'شروع آزمون کامل'});await waitFor(()=>expect(start).toBeEnabled());fireEvent.click(start);expect(screen.getByText(/۱\/۴۰/)).toBeInTheDocument();expect(screen.getByRole('radio',{name:'adulthood'})).toBeInTheDocument();
 });
});
