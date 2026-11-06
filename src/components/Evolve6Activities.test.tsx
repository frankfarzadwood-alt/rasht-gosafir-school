import {mediaAsset} from '@/lib/content/pilot';
import { cleanup,fireEvent,render,screen,waitFor } from '@testing-library/react';
import { afterEach,describe,expect,it,vi } from 'vitest';
import type { ReactNode } from 'react';
import { EvolveGuide } from './EvolveGuide';
import { OxfordGuide } from './OxfordGuide';
import { WritingStudio } from './WritingStudio';
import { QuestionView } from './QuestionView';
import { ExercisePassage } from './ExercisePassage';
import { QuestionMedia } from './QuestionMedia';
import { ListeningLab } from './ListeningLab';
import { BUNDLED_QUESTIONS,contextById } from '@/lib/bank';
import { nodeById } from '@/lib/learning';

vi.mock('@tanstack/react-router',()=>({Link:({children,params,search}:{children:ReactNode;params?:{nodeId?:string};search?:Record<string,string>})=><a href={`/learn/${params?.nodeId??''}?${new URLSearchParams(search).toString()}`}>{children}</a>}));
afterEach(cleanup);
describe('Evolve 6 native interactions',()=>{
 it('opens all three ready recommendations and returns to Evolve 6 rather than Evolve 5',()=>{
  const view=render(<EvolveGuide node={nodeById('evolve-6.u001')!}/>);expect(screen.getAllByRole('link')).toHaveLength(3);expect(view.container.querySelectorAll('[aria-disabled="true"]')).toHaveLength(0);expect(view.container.textContent).toContain('1.3 · I get what');
  expect(screen.getAllByRole('link')[0]).toHaveAttribute('href',expect.stringContaining('ows-upper-intermediate.u040'));expect(screen.getAllByRole('link')[0]).toHaveAttribute('href',expect.stringContaining('from=evolve-6.u001'));
  view.unmount();render(<OxfordGuide node={nodeById('ows-upper-intermediate.u040')!}/>);expect(screen.getByRole('link',{name:/Evolve 6.*درس ۱/})).toHaveAttribute('href',expect.stringContaining('evolve-6.u001'));
 });
 it('grades the complete valid reporting-verb answer without rejecting underlined',()=>{
  const q=BUNDLED_QUESTIONS.find(q=>q.id==='evolve6.quiz.u08.b.e1')!,submit=vi.fn();render(<QuestionView item={{q,kind:'auto'}} locked={false} onSubmit={submit}/>);fireEvent.click(screen.getByRole('radio',{name:'All three can be used'}));expect(submit).toHaveBeenCalledWith('All three can be used',true);
 });
 it('shows the current native paragraph gap with its own source order',()=>{
  const q=BUNDLED_QUESTIONS.find(q=>q.id==='evolve6.quiz.u11.a.e6')!,submit=vi.fn();render(<><ExercisePassage text={contextById(q.context_id)!.text!} active={6}/><QuestionView item={{q,kind:'auto'}} locked={false} onSubmit={submit}/></>);expect(screen.getByLabelText('Gap 6, current item')).toHaveAttribute('aria-current','true');fireEvent.click(screen.getByRole('radio',{name:'No article'}));expect(submit).toHaveBeenCalledWith('No article',true);
 });
 it('saves an Evolve 6 writing draft separately from Evolve 5 and objective progress',()=>{
  localStorage.setItem('english-quest-writing-evolve-5-unit-1','Earlier draft');const progress=localStorage.getItem('english-quest-progress-v1');render(<WritingStudio pool={BUNDLED_QUESTIONS.filter(q=>q.id.startsWith('evolve6.native.wb.u01.'))} back={<span>Back</span>}/>);expect(screen.getByRole('heading',{name:'Future technology: a balanced argument'})).toBeInTheDocument();fireEvent.change(screen.getByRole('textbox'),{target:{value:'Technology may change how we spend our time.'}});fireEvent.click(screen.getByRole('button',{name:'ذخیرهٔ پیش‌نویس'}));expect(localStorage.getItem('english-quest-writing-evolve-6-unit-1')).toBe('Technology may change how we spend our time.');expect(localStorage.getItem('english-quest-writing-evolve-5-unit-1')).toBe('Earlier draft');expect(localStorage.getItem('english-quest-progress-v1')).toBe(progress);
 });
 it('retains a shared workbook player but resets readiness for the separate follow-up track',async()=>{
  const find=(id:string)=>BUNDLED_QUESTIONS.find(q=>q.id===id)!,ready=vi.fn(),view=render(<QuestionMedia q={find('evolve6.native.wb.u03.listen.main.1')} onReady={ready}/>),audio=view.container.querySelector('audio')!;
  fireEvent.loadedMetadata(audio);await waitFor(()=>expect(ready).toHaveBeenLastCalledWith(true));view.rerender(<QuestionMedia q={find('evolve6.native.wb.u03.listen.main.2')} onReady={ready}/>);expect(view.container.querySelector('audio')).toBe(audio);
  view.rerender(<QuestionMedia q={find('evolve6.native.wb.u03.listen.2A.1')} onReady={ready}/>);expect(view.container.querySelector('audio')).not.toBe(audio);await waitFor(()=>expect(ready).toHaveBeenLastCalledWith(false));fireEvent.error(view.container.querySelector('audio')!);expect(screen.getByRole('alert')).toHaveTextContent('پاسخی ثبت نشده');
 });
 it('waits for native photo clues and grades their real picture option',async()=>{
  const q=BUNDLED_QUESTIONS.find(q=>q.id==='evolve6.native.wb.u04.photo.0')!,submit=vi.fn(),view=render(<QuestionView item={{q,kind:'auto'}} locked={false} onSubmit={submit}/>);expect(screen.getByRole('button',{name:'Picture A'})).toBeDisabled();for(const img of view.container.querySelectorAll('img'))fireEvent.load(img);await waitFor(()=>expect(screen.getByRole('button',{name:'Picture A'})).toBeEnabled());const correctPhoto=mediaAsset(q.native_options![q.answer.correct_option_id!]!)!;fireEvent.click(screen.getByAltText(correctPhoto.alt).closest('button')!);expect(submit).toHaveBeenLastCalledWith(correctPhoto.alt,true);
 });
 it('names the follow-up exercise clearly and selects its own recording',()=>{
  const pool=BUNDLED_QUESTIONS.filter(q=>q.id.startsWith('evolve6.native.wb.u03.listen.')),view=render(<ListeningLab pool={pool} back={<span>Back</span>}/>);expect(screen.getByRole('option',{name:/فایل اصلی/})).toBeInTheDocument();expect(screen.getByRole('option',{name:/تمرین 2A/})).toBeInTheDocument();fireEvent.change(screen.getByRole('combobox',{name:'فایل شنیداری'}),{target:{value:'evolve6.native.wb.audio.3.2A'}});expect(view.container.querySelector('audio')?.getAttribute('src')).toBe('/assets/evolve-6-native/workbook-u03-2a.mp3');
 });
});
