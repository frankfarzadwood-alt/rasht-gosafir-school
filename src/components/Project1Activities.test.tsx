import {mediaAsset} from '@/lib/content/pilot';
import { cleanup,fireEvent,render,screen,waitFor } from '@testing-library/react';
import { afterEach,describe,expect,it,vi } from 'vitest';
import type { ReactNode } from 'react';
import { PROJECT1_NATIVE } from '@/lib/content/project1';
import { nodeById } from '@/lib/learning';
import { getProgress } from '@/lib/progress';
import type { Question } from '@/lib/bank';
import { ProjectGuide } from './ProjectGuide';
import { WritingStudio } from './WritingStudio';
import { ListeningLab } from './ListeningLab';
import { GameRunner } from './GameRunner';
import { NativeScene } from './NativeScene';
import { QuestionView } from './QuestionView';
import { ScopePractice } from './LearningHub';

vi.mock('@tanstack/react-router',()=>({Link:({children,params}:{children:ReactNode;params?:{nodeId?:string}})=><a href={`/learn/${params?.nodeId??''}`}>{children}</a>}));

const qs=PROJECT1_NATIVE.questions as unknown as Question[];
afterEach(cleanup);
describe('Project 1 native interactions',()=>{
 it('offers ready unit practice without advertising unsupported source-test placeholders',()=>{
  render(<ScopePractice node={nodeById('project-1.u001')!}/>);expect(screen.getByRole('link',{name:/آزمایشگاه شنیداری/})).toBeInTheDocument();expect(screen.getByRole('link',{name:/استودیوی نوشتن/})).toBeInTheDocument();expect(screen.queryByText('آزمون‌های ثابت کتاب')).toBeNull();
 });
 it('shows real course targets and a six-unit introduction without fabricated test counts',()=>{
  const view=render(<ProjectGuide node={nodeById('project-1')!}/>);expect(screen.getByRole('heading',{name:'از اولین سلام تا گفت‌وگوهای روزمره'})).toBeInTheDocument();expect(view.container.textContent).toContain('۳۱ فایل شنیداری');view.rerender(<ProjectGuide node={nodeById('project-1.u004.s1')!}/>);expect(screen.getByText('Clock times and on/at')).toBeInTheDocument();expect(view.container.textContent).not.toContain('Daily routines');
 });
 it('saves a Project draft separately from Evolve and objective progress',()=>{
  localStorage.setItem('english-quest-writing-evolve-1-unit-1','My earlier draft.');const before=localStorage.getItem('english-quest-progress-v1');render(<WritingStudio pool={qs.filter(q=>q.placements?.some(p=>p.node_id.startsWith('project-1.u001.')))} back={<span>Back</span>}/>);expect(screen.getByRole('heading',{name:'Meet a new classmate'})).toBeInTheDocument();fireEvent.change(screen.getByRole('textbox'),{target:{value:'Hello! My name is Ava.'}});fireEvent.click(screen.getByRole('button',{name:'ذخیرهٔ پیش‌نویس'}));expect(localStorage.getItem('english-quest-writing-project-1-unit-1')).toBe('Hello! My name is Ava.');expect(localStorage.getItem('english-quest-writing-evolve-1-unit-1')).toBe('My earlier draft.');expect(localStorage.getItem('english-quest-progress-v1')).toBe(before);
 });
 it('labels the actual A–D and progress-check tracks and selects the correct file',()=>{
  const pool=qs.filter(q=>q.skill==='listening'&&q.placements?.some(p=>p.node_id.startsWith('project-1.u001.'))),view=render(<ListeningLab pool={pool} back={<span>Back</span>}/>);expect(screen.getAllByRole('option')).toHaveLength(5);expect(screen.getByRole('option',{name:/بخش A/})).toBeInTheDocument();expect(screen.getByRole('option',{name:/مرور درس/})).toBeInTheDocument();fireEvent.change(screen.getByRole('combobox',{name:'فایل شنیداری'}),{target:{value:'project1.native.audio.6'}});expect(view.container.querySelector('audio')).toHaveAttribute('src','/assets/project-1-native/workbook-track-06.mp3');
 });
 it('blocks missing audio without an attempt, preserves playback between dependent questions and withholds the script',async()=>{
  const questions=qs.filter(q=>q.assets.audio==='project1.native.audio.2').slice(0,2),before=getProgress().attempts.length,view=render(<GameRunner items={questions.map(q=>({q,kind:'auto'}))} grade={null} term={null} mode="listening_lab" scope="project1-test"/>),audio=view.container.querySelector('audio')!;
  expect(screen.getAllByRole('radio').every(r=>(r as HTMLButtonElement).disabled)).toBe(true);fireEvent.error(audio);expect(screen.getByRole('alert')).toHaveTextContent('پاسخی ثبت نشده');expect(getProgress().attempts).toHaveLength(before);fireEvent.click(screen.getByRole('button',{name:'تلاش دوباره'}));const recovered=view.container.querySelector('audio')!;fireEvent.loadedMetadata(recovered);await waitFor(()=>expect(screen.getAllByRole('radio')[0]).toBeEnabled());expect(screen.queryByRole('article',{name:'متن درک مطلب'})).toBeNull();const answer=questions[0]!.options.find(o=>o.id===questions[0]!.answer.correct_option_id)!.text;fireEvent.click(screen.getByRole('radio',{name:answer}));expect(screen.queryByRole('article',{name:'متن درک مطلب'})).toBeNull();fireEvent.click(await screen.findByRole('button',{name:'ادامه ←'}));expect(view.container.querySelector('audio')).toBe(recovered);await waitFor(()=>expect(screen.getAllByRole('radio')[0]).toBeEnabled());
 });
 it('renders location and timetable clues as native diagrams and tables',()=>{
  const view=render(<NativeScene scene={{kind:'position',relation:'opposite'}}/>);expect(screen.getByRole('img',{name:/blue ball is opposite/})).toBeInTheDocument();expect(screen.getByText('Top view · front ↓')).toBeInTheDocument();expect(view.container.querySelector('img')).toBeNull();const q=qs.find(q=>q.id==='project1.native.table.school.1')!;view.rerender(<NativeScene scene={q.native_scene!}/>);expect(screen.getByRole('table',{name:'A fictional class timetable'})).toBeInTheDocument();expect(screen.getByRole('rowheader',{name:'Tuesday'}).parentElement).toHaveTextContent('HistoryPE');
 });
 it('gates the reused independent photo clues until images load and grades the chosen tile',async()=>{
  const q=qs.find(q=>q.id==='project1.native.photoq.0')!,submit=vi.fn(),view=render(<QuestionView item={{q,kind:'auto'}} locked={false} onSubmit={submit}/>);expect(screen.getByRole('button',{name:'Picture A'})).toBeDisabled();for(const image of view.container.querySelectorAll('img'))fireEvent.load(image);await waitFor(()=>expect(screen.getByRole('button',{name:'Picture A'})).toBeEnabled());const correctPhoto=mediaAsset(q.native_options![q.answer.correct_option_id!]!)!;fireEvent.click(screen.getByAltText(correctPhoto.alt).closest('button')!);expect(submit).toHaveBeenCalledWith(correctPhoto.alt,true);
 });
});
