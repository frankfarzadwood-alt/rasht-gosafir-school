import {mediaAsset} from '@/lib/content/pilot';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,describe,expect,it,vi} from 'vitest';
import type {ReactNode} from 'react';
import {PROJECT3_NATIVE} from '@/lib/content/project3';
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
const qs=PROJECT3_NATIVE.questions as unknown as Question[];
afterEach(cleanup);
describe('Project 3 native interactions',()=>{
 it('shows the third book’s real guide and modes without unsupported official test placeholders',()=>{
  const view=render(<ProjectGuide node={nodeById('project-3')!}/>);expect(screen.getByRole('heading',{name:'داستان بگو، مسیر پیدا کن و تجربه‌هایت را بیان کن'})).toBeInTheDocument();expect(view.container.textContent).toContain('۲۷ فایل شنیداری');view.rerender(<ProjectGuide node={nodeById('project-3.u004.s2')!}/>);expect(screen.getByText('Directions, routes and a/an/the')).toBeInTheDocument();view.unmount();render(<ScopePractice node={nodeById('project-3.u004')!}/>);expect(screen.getByRole('link',{name:/آزمایشگاه شنیداری/})).toBeInTheDocument();expect(screen.queryByText('آزمون‌های ثابت کتاب')).toBeNull();
 });
 it('saves the third book’s writing under its own key without changing earlier drafts or objective progress',()=>{
  localStorage.setItem('english-quest-writing-project-2-unit-1','Earlier draft.');const before=localStorage.getItem('english-quest-progress-v1');render(<WritingStudio pool={qs.filter(q=>q.placements?.some(p=>p.node_id.startsWith('project-3.u001.')))} back={<span>Back</span>}/>);expect(screen.getByRole('heading',{name:'A person’s life'})).toBeInTheDocument();fireEvent.change(screen.getByRole('textbox'),{target:{value:'My imaginary friend grew up in a village.'}});fireEvent.click(screen.getByRole('button',{name:'ذخیرهٔ پیش‌نویس'}));expect(localStorage.getItem('english-quest-writing-project-3-unit-1')).toBe('My imaginary friend grew up in a village.');expect(localStorage.getItem('english-quest-writing-project-2-unit-1')).toBe('Earlier draft.');expect(localStorage.getItem('english-quest-progress-v1')).toBe(before);
 });
 it('keeps review-only writing empty and does not leak a task from an earlier book',()=>{
  render(<WritingStudio pool={qs.filter(q=>q.placements?.some(p=>p.node_id==='project-3.revision'))} back={<span>Back</span>}/>);expect(screen.queryByRole('textbox')).toBeNull();expect(screen.getByText('تمرین نوشتاری این بخش در حال آماده‌سازی است.')).toBeInTheDocument();
 });
 it('orders all 27 audio files and switches between the two distinct Unit 6D recordings',()=>{
  const view=render(<ListeningLab pool={qs} back={<span>Back</span>}/>);const options=screen.getAllByRole('option');expect(options).toHaveLength(27);expect(options[0]).toHaveTextContent('مرور آغازین');expect(options[26]).toHaveTextContent('درس ۶ · بخش D · فایل ۲۸');fireEvent.change(screen.getByRole('combobox',{name:'فایل شنیداری'}),{target:{value:'project3.native.audio.27'}});expect(view.container.querySelector('audio')).toHaveAttribute('src','/assets/project-3-native/workbook-track-27.mp3');expect(screen.getByText('Listening check: what new place will the town get for films?')).toBeInTheDocument();expect(screen.queryByText(/No separate supplied spoken transcript/)).toBeNull();fireEvent.change(screen.getByRole('combobox',{name:'فایل شنیداری'}),{target:{value:'project3.native.audio.28'}});expect(view.container.querySelector('audio')).toHaveAttribute('src','/assets/project-3-native/workbook-track-28.mp3');expect(screen.getByText('Why does the first person refuse pizza?')).toBeInTheDocument();
 });
 it('gates workbook-review questions on audio readiness, retains playback and locks the review until dependent answers finish',async()=>{
  const pool=qs.filter(q=>q.assets.audio==='project3.native.audio.15').slice(0,2),before=getProgress().attempts.length,view=render(<GameRunner items={pool.map(q=>({q,kind:'auto'}))} grade={null} term={null} mode="listening_lab" scope="project3-listening-check"/>);let audio=view.container.querySelector('audio')!;expect(screen.getAllByRole('radio').every(r=>(r as HTMLButtonElement).disabled)).toBe(true);fireEvent.error(audio);expect(getProgress().attempts).toHaveLength(before);expect(screen.getByRole('alert')).toHaveTextContent('پاسخی ثبت نشده');fireEvent.click(screen.getByRole('button',{name:'تلاش دوباره'}));audio=view.container.querySelector('audio')!;fireEvent.loadedMetadata(audio);await waitFor(()=>expect(screen.getByRole('radio',{name:'round'})).toBeEnabled());fireEvent.click(screen.getByRole('radio',{name:'round'}));expect(screen.queryByText(/No separate supplied spoken transcript/)).toBeNull();fireEvent.click(await screen.findByRole('button',{name:'ادامه ←'}));expect(view.container.querySelector('audio')).toBe(audio);expect(screen.getByText('Listening/check phrase 4: go ____ the bus stop.')).toBeInTheDocument();fireEvent.click(screen.getByRole('radio',{name:'past'}));expect(screen.getByText(/No separate supplied spoken transcript/)).toBeInTheDocument();
 });
 it('renders original route/sign vectors with gradeable native choices and no book-page image',()=>{
  const route=qs.find(q=>q.id==='project3.native.route.1')!,submit=vi.fn(),view=render(<><NativeScene scene={route.native_scene!}/><QuestionView item={{q:route,kind:'auto'}} locked={false} onSubmit={submit}/></>);expect(screen.getByRole('img',{name:/Imaginary town. Start facing north/})).toBeInTheDocument();fireEvent.click(screen.getByRole('radio',{name:'Library'}));expect(submit).toHaveBeenCalledWith('Library',true);const sign=qs.find(q=>q.id==='project3.native.sign.1')!;view.rerender(<><NativeScene scene={sign.native_scene!}/><QuestionView item={{q:sign,kind:'auto'}} locked={false} onSubmit={submit}/></>);expect(screen.getByRole('img',{name:'Practice sign: Mobile phone crossed out'})).toBeInTheDocument();fireEvent.click(screen.getByRole('radio',{name:'You mustn’t use a mobile phone.'}));expect(submit).toHaveBeenLastCalledWith('You mustn’t use a mobile phone.',true);view.rerender(<NativeScene scene={{kind:'direction_arrow',turn:'left'}}/>);expect(screen.getByRole('img',{name:/turn towards the left/})).toBeInTheDocument();expect(view.container.querySelector('img')).toBeNull();
 });
 it('holds independent photo choices until all required image tiles load',async()=>{
  const q=qs.find(q=>q.id==='project3.native.photoq.3')!,submit=vi.fn(),view=render(<QuestionView item={{q,kind:'auto'}} locked={false} onSubmit={submit}/>);expect(screen.getByRole('button',{name:'Picture A'})).toBeDisabled();for(const image of view.container.querySelectorAll('img'))fireEvent.load(image);await waitFor(()=>expect(screen.getByRole('button',{name:'Picture A'})).toBeEnabled());const correctPhoto=mediaAsset(q.native_options![q.answer.correct_option_id!]!)!;fireEvent.click(screen.getByAltText(correctPhoto.alt).closest('button')!);expect(submit).toHaveBeenCalledWith(correctPhoto.alt,true);
 });
});
