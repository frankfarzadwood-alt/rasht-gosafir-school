import {mediaAsset} from '@/lib/content/pilot';
import { cleanup,fireEvent,render,screen,waitFor } from '@testing-library/react';
import { afterEach,describe,expect,it,vi } from 'vitest';
import type { ReactNode } from 'react';
import { PROJECT2_NATIVE } from '@/lib/content/project2';
import { nodeById } from '@/lib/learning';
import { getProgress } from '@/lib/progress';
import type { Question } from '@/lib/bank';
import { ProjectGuide } from './ProjectGuide';
import { ScopePractice } from './LearningHub';
import { WritingStudio } from './WritingStudio';
import { ListeningLab } from './ListeningLab';
import { GameRunner } from './GameRunner';
import { NativeScene } from './NativeScene';
import { QuestionView } from './QuestionView';
vi.mock('@tanstack/react-router',()=>({Link:({children,params}:{children:ReactNode;params?:{nodeId?:string}})=><a href={`/learn/${params?.nodeId??''}`}>{children}</a>}));
const qs=PROJECT2_NATIVE.questions as unknown as Question[];
afterEach(cleanup);
describe('Project 2 native interactions',()=>{
 it('shows the second book’s real targets and keeps unsupported test placeholders out of its practice page',()=>{
  const view=render(<ProjectGuide node={nodeById('project-2')!}/>);expect(screen.getByRole('heading',{name:'روایت کن، مقایسه کن و برنامه بریز'})).toBeInTheDocument();expect(view.container.textContent).toContain('۳۲ فایل شنیداری');view.rerender(<ProjectGuide node={nodeById('project-2.u005.s2')!}/>);expect(screen.getByText('Weather, seasons, compass points and comparatives')).toBeInTheDocument();expect(view.container.textContent).not.toContain('Landscape vocabulary');view.unmount();render(<ScopePractice node={nodeById('project-2.u001')!}/>);expect(screen.getByRole('link',{name:/آزمایشگاه شنیداری/})).toBeInTheDocument();expect(screen.queryByText('آزمون‌های ثابت کتاب')).toBeNull();
 });
 it('saves Project 2 writing separately from Project 1 and objective progress',()=>{
  localStorage.setItem('english-quest-writing-project-1-unit-1','Earlier Project 1 draft.');const progress=localStorage.getItem('english-quest-progress-v1');render(<WritingStudio pool={qs.filter(q=>q.placements?.some(p=>p.node_id.startsWith('project-2.u001.')))} back={<span>Back</span>}/>);expect(screen.getByRole('heading',{name:'A week in my life'})).toBeInTheDocument();fireEvent.change(screen.getByRole('textbox'),{target:{value:'Rafi always makes his bed.'}});fireEvent.click(screen.getByRole('button',{name:'ذخیرهٔ پیش‌نویس'}));expect(localStorage.getItem('english-quest-writing-project-2-unit-1')).toBe('Rafi always makes his bed.');expect(localStorage.getItem('english-quest-writing-project-1-unit-1')).toBe('Earlier Project 1 draft.');expect(localStorage.getItem('english-quest-progress-v1')).toBe(progress);
 });
 it('does not expose a writing task from another unit or book in a review-only pool',()=>{
  render(<WritingStudio pool={qs.filter(q=>q.placements?.some(p=>p.node_id==='project-2.revision'))} back={<span>Back</span>}/>);expect(screen.queryByRole('textbox')).toBeNull();expect(screen.getByText('تمرین نوشتاری این بخش در حال آماده‌سازی است.')).toBeInTheDocument();
 });
 it('orders all 32 files from introduction to revision and switches to the real animal-sound file',()=>{
  const view=render(<ListeningLab pool={qs} back={<span>Back</span>}/>);const options=screen.getAllByRole('option');expect(options).toHaveLength(32);expect(options[0]).toHaveTextContent('مرور آغازین');expect(options[31]).toHaveTextContent('مرور پایانی');fireEvent.change(screen.getByRole('combobox',{name:'فایل شنیداری'}),{target:{value:'project2.native.audio.12'}});expect(view.container.querySelector('audio')).toHaveAttribute('src','/assets/project-2-native/workbook-track-12.mp3');expect(screen.getByText('Which animal is sound 1?')).toBeInTheDocument();expect(screen.queryByText(/Reviewed answer sequence/)).toBeNull();
 });
 it('gates non-speech answers on audio readiness and preserves the element and answer-review lock between questions',async()=>{
  const pool=qs.filter(q=>q.assets.audio==='project2.native.audio.12'),before=getProgress().attempts.length,view=render(<GameRunner items={pool.map(q=>({q,kind:'auto'}))} grade={null} term={null} mode="listening_lab" scope="project2-sound-test"/>);let audio=view.container.querySelector('audio')!;expect(screen.getAllByRole('radio').every(r=>(r as HTMLButtonElement).disabled)).toBe(true);fireEvent.error(audio);expect(getProgress().attempts).toHaveLength(before);expect(screen.getByRole('alert')).toHaveTextContent('پاسخی ثبت نشده');fireEvent.click(screen.getByRole('button',{name:'تلاش دوباره'}));audio=view.container.querySelector('audio')!;fireEvent.loadedMetadata(audio);await waitFor(()=>expect(screen.getByRole('radio',{name:'A duck'})).toBeEnabled());fireEvent.click(screen.getByRole('radio',{name:'A duck'}));expect(screen.queryByText(/Reviewed answer sequence/)).toBeNull();fireEvent.click(await screen.findByRole('button',{name:'ادامه ←'}));expect(view.container.querySelector('audio')).toBe(audio);expect(screen.getByText('Which animal is sound 2?')).toBeInTheDocument();
 });
 it('renders a native calendar with seven weekday columns and grades a date-reading answer',()=>{
  const q=qs.find(q=>q.id==='project2.native.calendar.1')!,submit=vi.fn(),view=render(<><NativeScene scene={q.native_scene!}/><QuestionView item={{q,kind:'auto'}} locked={false} onSubmit={submit}/></>);expect(screen.getByRole('table',{name:'Practice July · fictional calendar'})).toBeInTheDocument();expect(screen.getAllByRole('columnheader')).toHaveLength(7);expect(screen.getByRole('cell',{name:'31'})).toBeInTheDocument();expect(view.container.querySelector('img')).toBeNull();fireEvent.click(screen.getByRole('radio',{name:'Wednesday'}));expect(submit).toHaveBeenCalledWith('Wednesday',true);
 });
 it('renders weather and thermometer clues as native vectors rather than page images',()=>{
  const q=qs.find(q=>q.id==='project2.native.weather.1')!,submit=vi.fn(),view=render(<><NativeScene scene={q.native_scene!}/><QuestionView item={{q,kind:'auto'}} locked={false} onSubmit={submit}/></>);expect(screen.getByRole('img',{name:'Weather diagram: sunny'})).toBeInTheDocument();fireEvent.click(screen.getByRole('radio',{name:'sunny'}));expect(submit).toHaveBeenCalledWith('sunny',true);view.rerender(<NativeScene scene={{kind:'weather',condition:'cold'}}/>);expect(screen.getByRole('img',{name:'Thermometer: −5 degrees Celsius'})).toBeInTheDocument();expect(view.container.querySelector('img')).toBeNull();
 });
 it('keeps independent animal photo choices unready until their local images load',async()=>{
  const q=qs.find(q=>q.id==='project2.native.photoq.0')!,submit=vi.fn(),view=render(<QuestionView item={{q,kind:'auto'}} locked={false} onSubmit={submit}/>);expect(screen.getByRole('button',{name:'Picture A'})).toBeDisabled();for(const image of view.container.querySelectorAll('img'))fireEvent.load(image);await waitFor(()=>expect(screen.getByRole('button',{name:'Picture A'})).toBeEnabled());const correctPhoto=mediaAsset(q.native_options![q.answer.correct_option_id!]!)!;fireEvent.click(screen.getByAltText(correctPhoto.alt).closest('button')!);expect(submit).toHaveBeenCalledWith(correctPhoto.alt,true);
 });
});
