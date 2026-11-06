import {mediaAsset} from '@/lib/content/pilot';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,describe,expect,it,vi} from 'vitest';
import type {ReactNode} from 'react';
import {PROJECT4_NATIVE} from '@/lib/content/project4';
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
const qs=PROJECT4_NATIVE.questions as unknown as Question[];
afterEach(cleanup);
describe('Project 4 native interactions',()=>{
 it('shows the fourth book’s guide, lesson targets and available modes',()=>{
  const view=render(<ProjectGuide node={nodeById('project-4')!}/>);expect(screen.getByRole('heading',{name:'گذشته و حال را مقایسه کن، توصیف کن و برنامه بریز'})).toBeInTheDocument();expect(view.container.textContent).toContain('۳۲ فایل شنیداری');view.rerender(<ProjectGuide node={nodeById('project-4.u003.s1')!}/>);expect(screen.getByText('Body parts and defining relative clauses with who/which/that')).toBeInTheDocument();view.unmount();render(<ScopePractice node={nodeById('project-4.u003')!}/>);expect(screen.getByRole('link',{name:/آزمایشگاه شنیداری/})).toBeInTheDocument();expect(screen.queryByText('آزمون‌های ثابت کتاب')).toBeNull();
 });
 it('saves fourth-book drafts separately without changing earlier drafts or objective progress',()=>{
  localStorage.setItem('english-quest-writing-project-3-unit-1','Earlier draft.');const before=localStorage.getItem('english-quest-progress-v1');render(<WritingStudio pool={qs.filter(q=>q.placements?.some(p=>p.node_id.startsWith('project-4.u001.')))} back={<span>Back</span>}/>);expect(screen.getByRole('heading',{name:'Then and now'})).toBeInTheDocument();fireEvent.change(screen.getByRole('textbox'),{target:{value:'My imaginary friend used to walk to school.'}});fireEvent.click(screen.getByRole('button',{name:'ذخیرهٔ پیش‌نویس'}));expect(localStorage.getItem('english-quest-writing-project-4-unit-1')).toBe('My imaginary friend used to walk to school.');expect(localStorage.getItem('english-quest-writing-project-3-unit-1')).toBe('Earlier draft.');expect(localStorage.getItem('english-quest-progress-v1')).toBe(before);
 });
 it('keeps review-only scopes free of unrelated writing tasks',()=>{
  render(<WritingStudio pool={qs.filter(q=>q.placements?.some(p=>p.node_id==='project-4.revision'))} back={<span>Back</span>}/>);expect(screen.queryByRole('textbox')).toBeNull();expect(screen.getByText('تمرین نوشتاری این بخش در حال آماده‌سازی است.')).toBeInTheDocument();
 });
 it('orders all 32 recordings and distinguishes the opening, progress checks and final revision',()=>{
  const view=render(<ListeningLab pool={qs} back={<span>Back</span>}/>);const options=screen.getAllByRole('option');expect(options).toHaveLength(32);expect(options[0]).toHaveTextContent('مرور آغازین');expect(options[5]).toHaveTextContent('درس ۱ · مرور درس · فایل ۷');expect(options[31]).toHaveTextContent('مرور پایانی · فایل ۳۳');fireEvent.change(screen.getByRole('combobox',{name:'فایل شنیداری'}),{target:{value:'project4.native.audio.17'}});expect(view.container.querySelector('audio')).toHaveAttribute('src','/assets/project-4-native/workbook-track-17.mp3');expect(screen.getByText('Which body part is mentioned in this fictional doctor scene?')).toBeInTheDocument();expect(screen.queryByText(/Fictional language-learning scene/)).toBeNull();fireEvent.change(screen.getByRole('combobox',{name:'فایل شنیداری'}),{target:{value:'project4.native.audio.33'}});expect(view.container.querySelector('audio')).toHaveAttribute('src','/assets/project-4-native/workbook-track-33.mp3');expect(screen.getByText('What is the speaker preparing?')).toBeInTheDocument();
 });
 it('gates listening on media, preserves playback between questions and unlocks the script only at the end',async()=>{
  const pool=qs.filter(q=>q.assets.audio==='project4.native.audio.15').slice(0,2),before=getProgress().attempts.length,view=render(<GameRunner items={pool.map(q=>({q,kind:'auto'}))} grade={null} term={null} mode="listening_lab" scope="project4-listening-check"/>);let audio=view.container.querySelector('audio')!;expect(screen.getAllByRole('radio').every(r=>(r as HTMLButtonElement).disabled)).toBe(true);fireEvent.error(audio);expect(getProgress().attempts).toHaveLength(before);expect(screen.getByRole('alert')).toHaveTextContent('پاسخی ثبت نشده');fireEvent.click(screen.getByRole('button',{name:'تلاش دوباره'}));audio=view.container.querySelector('audio')!;fireEvent.loadedMetadata(audio);await waitFor(()=>expect(screen.getByRole('radio',{name:'A finger'})).toBeEnabled());fireEvent.click(screen.getByRole('radio',{name:'A finger'}));expect(screen.queryByText(/Fictional language-learning scene/)).toBeNull();fireEvent.click(await screen.findByRole('button',{name:'ادامه ←'}));expect(view.container.querySelector('audio')).toBe(audio);expect(screen.getByText('How is it described?')).toBeInTheDocument();fireEvent.click(screen.getByRole('radio',{name:'Swollen and painful'}));expect(screen.getByText(/Fictional language-learning scene/)).toBeInTheDocument();
 });
 it('renders original body, clothing, timeline and process scenes with gradeable choices',()=>{
  const submit=vi.fn(),body=qs.find(q=>q.id==='project4.native.body.1')!,view=render(<><NativeScene scene={body.native_scene!}/><QuestionView item={{q:body,kind:'auto'}} locked={false} onSubmit={submit}/></>);expect(screen.getByRole('img',{name:'Body diagram highlighting the forehead'})).toBeInTheDocument();fireEvent.click(screen.getByRole('radio',{name:'forehead'}));expect(submit).toHaveBeenCalledWith('forehead',true);
  const clothes=qs.find(q=>q.id==='project4.native.clothing.1')!;view.rerender(<><NativeScene scene={clothes.native_scene!}/><QuestionView item={{q:clothes,kind:'auto'}} locked={false} onSubmit={submit}/></>);expect(screen.getByRole('img',{name:'Blue striped short-sleeved shirt'})).toBeInTheDocument();fireEvent.click(screen.getByRole('radio',{name:'Striped'}));expect(submit).toHaveBeenLastCalledWith('Striped',true);
  const duration=qs.find(q=>q.id==='project4.native.duration.2025')!;view.rerender(<><NativeScene scene={duration.native_scene!}/><QuestionView item={{q:duration,kind:'auto'}} locked={false} onSubmit={submit}/></>);expect(screen.getByRole('img',{name:'A continuing period from 1 January 2025 to 1 January 2030'})).toBeInTheDocument();fireEvent.click(screen.getByRole('radio',{name:'for 5 years'}));expect(submit).toHaveBeenLastCalledWith('for 5 years',true);
  const process=qs.find(q=>q.id==='project4.native.process.1')!;view.rerender(<><NativeScene scene={process.native_scene!}/><QuestionView item={{q:process,kind:'auto'}} locked={false} onSubmit={submit}/></>);expect(screen.getAllByRole('listitem')).toHaveLength(3);fireEvent.click(screen.getByRole('radio',{name:'The models are collected.'}));expect(submit).toHaveBeenLastCalledWith('The models are collected.',true);expect(view.container.querySelector('img')).toBeNull();
 });
 it('holds native photo choices until all required tiles load',async()=>{
  const q=qs.find(q=>q.id==='project4.native.photoq.3')!,submit=vi.fn(),view=render(<QuestionView item={{q,kind:'auto'}} locked={false} onSubmit={submit}/>);expect(screen.getByRole('button',{name:'Picture A'})).toBeDisabled();for(const image of view.container.querySelectorAll('img'))fireEvent.load(image);await waitFor(()=>expect(screen.getByRole('button',{name:'Picture A'})).toBeEnabled());const correctPhoto=mediaAsset(q.native_options![q.answer.correct_option_id!]!)!;fireEvent.click(screen.getByAltText(correctPhoto.alt).closest('button')!);expect(submit).toHaveBeenCalledWith(correctPhoto.alt,true);
 });
});
