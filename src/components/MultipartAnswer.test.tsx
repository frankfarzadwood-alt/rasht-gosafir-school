import {afterEach,describe,expect,it,vi} from 'vitest';
import {cleanup,render,screen,fireEvent} from '@testing-library/react';
import {QuestionView} from './QuestionView';import {EXPANSION} from '@/lib/content/expansion';import type {Question} from '@/lib/bank';
afterEach(cleanup);
describe('source response fields',()=>{
 it('starts blank and submits one response through the shared grader',()=>{
  const q=EXPANSION.questions.find(q=>q.id==='evolve-3.r2.u001.s1.e1a.02') as unknown as Question;const submit=vi.fn();render(<QuestionView item={{q,kind:'auto'}} locked={false} onSubmit={submit}/>);const inputs=screen.getAllByRole('textbox');expect(inputs).toHaveLength(3);for(const input of inputs)expect(input).toHaveValue('');expect(screen.getByRole('button',{name:'بررسی پاسخ'})).toBeDisabled();['helpful','brave','generous'].forEach((v,i)=>fireEvent.change(inputs[i]!,{target:{value:v}}));fireEvent.click(screen.getByRole('button',{name:'بررسی پاسخ'}));expect(submit).toHaveBeenCalledExactlyOnceWith(JSON.stringify(['helpful','brave','generous']),true);
 });
 it('cannot submit while required media is locked',()=>{
  const q=EXPANSION.questions.find(q=>q.answer.fields?.length) as unknown as Question;const submit=vi.fn();render(<QuestionView item={{q,kind:'auto'}} locked onSubmit={submit}/>);for(const input of screen.getAllByRole('textbox'))expect(input).toBeDisabled();fireEvent.submit(screen.getByRole('button',{name:'بررسی پاسخ'}).closest('form')!);expect(submit).not.toHaveBeenCalled();
 });
});
