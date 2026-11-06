import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,describe,expect,it,vi} from 'vitest';
import {PROJECT5_NATIVE} from '@/lib/content/project5';
import {mediaAsset} from '@/lib/content/pilot';
import {correctText,type Question} from '@/lib/bank';
import {QuestionView} from './QuestionView';
vi.mock('@/lib/bank',async original=>({...await original<typeof import('@/lib/bank')>(),shuffle:<T,>(items:T[])=>[...items.slice(1),items[0]!]}));
afterEach(cleanup);
describe('picture choice identity and display order',()=>{
 it('grades the image identity after shuffling and keeps its order through rerenders',async()=>{
  const source=PROJECT5_NATIVE.questions.find(q=>q.id==='project5.native.photoq.1') as unknown as Question;
  const correct=source.options.find(o=>o.id===source.answer.correct_option_id)!,wrong=source.options.filter(o=>o.id!==correct.id),q={...source,options:[correct,...wrong]},submit=vi.fn(),view=render(<QuestionView item={{q,kind:'auto'}} locked={false} onSubmit={submit}/>);
  expect(screen.getAllByRole('button').every(b=>(b as HTMLButtonElement).disabled)).toBe(true);for(const img of view.container.querySelectorAll('img'))fireEvent.load(img);await waitFor(()=>expect(screen.getByRole('button',{name:'Picture C'})).toBeEnabled());
  const correctAlt=mediaAsset(q.native_options![correct.id]!)!.alt;expect(correctText(q)).toBe(correctAlt);expect(screen.getByAltText(correctAlt).closest('button')).toHaveAccessibleName('Picture C');fireEvent.click(screen.getByRole('button',{name:'Picture A'}));expect(submit).toHaveBeenLastCalledWith(mediaAsset(q.native_options![wrong[0]!.id]!)!.alt,false);
  fireEvent.click(screen.getByRole('button',{name:'Picture C'}));expect(submit).toHaveBeenLastCalledWith(correctAlt,true);view.rerender(<QuestionView item={{q,kind:'auto'}} locked onSubmit={submit}/>);expect(screen.getByAltText(correctAlt).closest('button')).toHaveAccessibleName('Picture C');
 });
});
