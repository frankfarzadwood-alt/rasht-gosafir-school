import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,describe,expect,it,vi} from 'vitest';
import type {ReactNode} from 'react';
import {PROJECT5_NATIVE} from '@/lib/content/project5';
import {mediaAsset} from '@/lib/content/pilot';
import {nodeById} from '@/lib/learning';
import {getProgress} from '@/lib/progress';
import type {Question} from '@/lib/bank';
import {ProjectGuide} from './ProjectGuide';
import {ScopePractice} from './LearningHub';
import {WritingStudio} from './WritingStudio';
import {ListeningLab} from './ListeningLab';
import {GameRunner} from './GameRunner';
import {NativeScene} from './NativeScene';
import {QuestionView} from './QuestionView';
vi.mock('@tanstack/react-router',()=>({Link:({children,params}:{children:ReactNode;params?:{nodeId?:string}})=><a href={`/learn/${params?.nodeId??''}`}>{children}</a>}));
const qs=PROJECT5_NATIVE.questions as unknown as Question[];
afterEach(cleanup);
describe('Project 5 native interactions',()=>{
 it('shows the final Project book’s guide, lesson targets and available modes',()=>{
  const view=render(<ProjectGuide node={nodeById('project-5')!}/>);expect(screen.getByRole('heading',{name:'مسئله‌ها را توضیح بده، درخواست کن و دیدگاه‌ها را نقل کن'})).toBeInTheDocument();expect(view.container.textContent).toContain('۳۲ فایل شنیداری');view.rerender(<ProjectGuide node={nodeById('project-5.u006.s3')!}/>);expect(screen.getByText('Town places, indirect questions and polite word order')).toBeInTheDocument();view.unmount();render(<ScopePractice node={nodeById('project-5.u003')!}/>);expect(screen.getByRole('link',{name:/آزمایشگاه شنیداری/})).toBeInTheDocument();expect(screen.queryByText('آزمون‌های ثابت کتاب')).toBeNull();
 });
 it('saves fifth-book drafts independently from earlier writing and objective progress',()=>{
  localStorage.setItem('english-quest-writing-project-4-unit-1','Earlier draft.');const before=localStorage.getItem('english-quest-progress-v1');render(<WritingStudio pool={qs.filter(q=>q.placements?.some(p=>p.node_id.startsWith('project-5.u001.')))} back={<span>Back</span>}/>);expect(screen.getByRole('heading',{name:'A welcome and a problem'})).toBeInTheDocument();fireEvent.change(screen.getByRole('textbox'),{target:{value:'My imaginary friend joined a music club.'}});fireEvent.click(screen.getByRole('button',{name:'ذخیرهٔ پیش‌نویس'}));expect(localStorage.getItem('english-quest-writing-project-5-unit-1')).toBe('My imaginary friend joined a music club.');expect(localStorage.getItem('english-quest-writing-project-4-unit-1')).toBe('Earlier draft.');expect(localStorage.getItem('english-quest-progress-v1')).toBe(before);
 });
 it('does not leak unrelated writing into opening and final reviews',()=>{
  const view=render(<WritingStudio pool={qs.filter(q=>q.placements?.some(p=>p.node_id==='project-5.revision'))} back={<span>Back</span>}/>);expect(screen.queryByRole('textbox')).toBeNull();view.rerender(<WritingStudio pool={qs.filter(q=>q.placements?.some(p=>p.node_id==='project-5.introduction'))} back={<span>Back</span>}/>);expect(screen.queryByRole('textbox')).toBeNull();expect(screen.getByText('تمرین نوشتاری این بخش در حال آماده‌سازی است.')).toBeInTheDocument();
 });
 it('offers all 32 recording groups and keeps reviews hidden before answers',()=>{
  const view=render(<ListeningLab pool={qs} back={<span>Back</span>}/>);const options=screen.getAllByRole('option');expect(options).toHaveLength(32);expect(options[0]).toHaveTextContent('مرور آغازین');expect(options[5]).toHaveTextContent('درس ۱ · مرور درس · فایل ۷');expect(options[31]).toHaveTextContent('مرور پایانی · فایل ۳۳');fireEvent.change(screen.getByRole('combobox',{name:'فایل شنیداری'}),{target:{value:'project5.native.audio.9'}});expect(view.container.querySelector('audio')).toHaveAttribute('src','/assets/project-5-native/workbook-track-09.mp3');expect(screen.getByText('Listening/key review: what is the first speaker planning after passing exams?')).toBeInTheDocument();expect(screen.queryByText(/not a verbatim audio transcription/)).toBeNull();fireEvent.change(screen.getByRole('combobox',{name:'فایل شنیداری'}),{target:{value:'project5.native.audio.33'}});expect(view.container.querySelector('audio')).toHaveAttribute('src','/assets/project-5-native/workbook-track-33.mp3');expect(screen.getByText('What new appointment time does Jack accept?')).toBeInTheDocument();
 });
 it('gates required audio, retains playback and unlocks the honest answer review at the end',async()=>{
  const pool=qs.filter(q=>q.assets.audio==='project5.native.audio.9').slice(0,2),before=getProgress().attempts.length,view=render(<GameRunner items={pool.map(q=>({q,kind:'auto'}))} grade={null} term={null} mode="listening_lab" scope="project5-listening-check"/>);let audio=view.container.querySelector('audio')!;expect(screen.getAllByRole('radio').every(r=>(r as HTMLButtonElement).disabled)).toBe(true);fireEvent.error(audio);expect(getProgress().attempts).toHaveLength(before);expect(screen.getByRole('alert')).toHaveTextContent('پاسخی ثبت نشده');fireEvent.click(screen.getByRole('button',{name:'تلاش دوباره'}));audio=view.container.querySelector('audio')!;fireEvent.loadedMetadata(audio);await waitFor(()=>expect(screen.getByRole('radio',{name:'A party'})).toBeEnabled());fireEvent.click(screen.getByRole('radio',{name:'A party'}));expect(screen.queryByText(/not a verbatim audio transcription/)).toBeNull();fireEvent.click(await screen.findByRole('button',{name:'ادامه ←'}));expect(view.container.querySelector('audio')).toBe(audio);fireEvent.click(screen.getByRole('radio',{name:'A present'}));expect(screen.getByText(/not a verbatim audio transcription/)).toBeInTheDocument();
 });
 it('renders original problem diagrams and native appointment/process clues with gradeable choices',()=>{
  const submit=vi.fn(),q=qs.find(q=>q.id==='project5.native.problem.2')!,view=render(<><NativeScene scene={q.native_scene!}/><QuestionView item={{q,kind:'auto'}} locked={false} onSubmit={submit}/></>);expect(screen.getByRole('img',{name:'A drinking glass with a crack in its side'})).toBeInTheDocument();fireEvent.click(screen.getByRole('radio',{name:'The glass is cracked.'}));expect(submit).toHaveBeenCalledWith('The glass is cracked.',true);
  const clock=qs.find(q=>q.id==='project5.native.clock.2')!;view.rerender(<><NativeScene scene={clock.native_scene!}/><QuestionView item={{q:clock,kind:'auto'}} locked={false} onSubmit={submit}/></>);expect(screen.getByRole('img',{name:'Analogue clock showing 13:30'})).toBeInTheDocument();fireEvent.click(screen.getByRole('radio',{name:'half past one'}));expect(submit).toHaveBeenLastCalledWith('half past one',true);
  const cal=qs.find(q=>q.id==='project5.native.calendar.1')!;view.rerender(<><NativeScene scene={cal.native_scene!}/><QuestionView item={{q:cal,kind:'auto'}} locked={false} onSubmit={submit}/></>);expect(screen.getByRole('table')).toHaveTextContent('Fictional appointment month');fireEvent.click(screen.getByRole('radio',{name:'Wednesday'}));expect(submit).toHaveBeenLastCalledWith('Wednesday',true);
  const process=qs.find(q=>q.id==='project5.native.process.1')!;view.rerender(<><NativeScene scene={process.native_scene!}/><QuestionView item={{q:process,kind:'auto'}} locked={false} onSubmit={submit}/></>);expect(screen.getAllByRole('listitem')).toHaveLength(3);fireEvent.click(screen.getByRole('radio',{name:'The boxes are collected.'}));expect(submit).toHaveBeenLastCalledWith('The boxes are collected.',true);expect(view.container.querySelector('img')).toBeNull();
 });
 it('grades loaded photo choices by image identity rather than a fixed letter',async()=>{
  const q=qs.find(q=>q.id==='project5.native.photoq.1')!,submit=vi.fn(),view=render(<QuestionView item={{q,kind:'auto'}} locked={false} onSubmit={submit}/>);expect(screen.getByRole('button',{name:'Picture A'})).toBeDisabled();for(const image of view.container.querySelectorAll('img'))fireEvent.load(image);await waitFor(()=>expect(screen.getByRole('button',{name:'Picture A'})).toBeEnabled());const a=mediaAsset(q.native_options![q.answer.correct_option_id!]!)!;fireEvent.click(screen.getByAltText(a.alt).closest('button')!);expect(submit).toHaveBeenCalledWith(a.alt,true);
 });
});
