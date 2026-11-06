import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { EvolveGuide } from './EvolveGuide';
import { WritingStudio } from './WritingStudio';
import { QuestionView } from './QuestionView';
import { ExercisePassage } from './ExercisePassage';
import { BUNDLED_QUESTIONS, contextById } from '@/lib/bank';
import { nodeById } from '@/lib/learning';

vi.mock('@tanstack/react-router',()=>({Link:({children,params,search}:{children:ReactNode;params?:{nodeId?:string};search?:Record<string,string>})=><a href={`/learn/${params?.nodeId??''}?${new URLSearchParams(search).toString()}`}>{children}</a>}));
afterEach(cleanup);
describe('Evolve 5 native interactions',()=>{
  it('shows ready Upper Intermediate recommendations and keeps the correct lesson titles',()=>{
    const view=render(<EvolveGuide node={nodeById('evolve-5.u001')!}/>);
    expect(screen.getByText('Oxford Word Skills Upper Intermediate–Advanced')).toBeInTheDocument();expect(view.container.querySelectorAll('[aria-disabled="true"]')).toHaveLength(0);
    expect(screen.getAllByRole('link')).toHaveLength(3);expect(view.container.textContent).toContain('1.3 · Upgrade');
  });
  it('grades a complete native answer set and highlights its current paragraph item',()=>{
    const q=BUNDLED_QUESTIONS.find(q=>q.id==='evolve5.quiz.u01.b.e2')!,submit=vi.fn();
    render(<><ExercisePassage text={contextById(q.context_id)!.text!} active={2}/><QuestionView item={{q,kind:'auto'}} locked={false} onSubmit={submit}/></>);
    expect(screen.getByLabelText('Gap 2, current item')).toHaveAttribute('aria-current','true');
    fireEvent.click(screen.getByRole('radio',{name:'would go / used to go'}));expect(submit).toHaveBeenCalledWith('would go / used to go',true);
  });
  it('saves the new writing draft independently of earlier books and XP',()=>{
    localStorage.setItem('english-quest-writing-evolve-4-unit-1','Earlier draft');const progress=localStorage.getItem('english-quest-progress-v1');
    render(<WritingStudio pool={BUNDLED_QUESTIONS.filter(q=>q.id.startsWith('evolve5.native.wb.u01.'))} back={<span>Back</span>}/>);
    expect(screen.getByRole('heading',{name:'A persuasive recommendation'})).toBeInTheDocument();fireEvent.change(screen.getByRole('textbox'),{target:{value:'I recommend a visit to a local farm.'}});
    fireEvent.click(screen.getByRole('button',{name:'ذخیرهٔ پیش‌نویس'}));expect(localStorage.getItem('english-quest-writing-evolve-5-unit-1')).toBe('I recommend a visit to a local farm.');
    expect(localStorage.getItem('english-quest-writing-evolve-4-unit-1')).toBe('Earlier draft');expect(localStorage.getItem('english-quest-progress-v1')).toBe(progress);
  });
});
