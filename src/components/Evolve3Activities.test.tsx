import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { ExercisePassage } from './ExercisePassage';
import { EvolveGuide } from './EvolveGuide';
import { OxfordGuide } from './OxfordGuide';
import { WritingStudio } from './WritingStudio';
import { ListeningLab } from './ListeningLab';
import { GameRunner } from './GameRunner';
import { BUNDLED_QUESTIONS } from '@/lib/bank';
import { nodeById } from '@/lib/learning';

vi.mock('@tanstack/react-router',()=>({Link:({children,params,search}:{children:ReactNode;params?:{nodeId?:string};search?:Record<string,string>})=><a href={`/learn/${params?.nodeId??''}?${new URLSearchParams(search).toString()}`}>{children}</a>}));
afterEach(cleanup);
const unit=BUNDLED_QUESTIONS.filter(q=>q.id.startsWith('evolve3.native.wb.u01.'));

describe('Evolve 3 native interactions',()=>{
  it('highlights the current paragraph gap and renders text safely',()=>{
    const view=render(<article><ExercisePassage text={'A [1] ____\nB [2] ____ <img src=x>'} active={1}/></article>);
    expect(screen.getByLabelText('Gap 1, current item')).toHaveAttribute('aria-current','true');
    expect(view.container.querySelector('img')).toBeNull();
    view.rerender(<article><ExercisePassage text={'A [1] ____\nB [2] ____ <img src=x>'} active={2}/></article>);
    expect(screen.getByLabelText('Gap 2, current item')).toHaveAttribute('aria-current','true');
    expect(screen.getByLabelText('Gap 1')).not.toHaveAttribute('aria-current');
  });
  it('opens ready Intermediate recommendations while preserving exact ready Elementary links',()=>{
    const view=render(<EvolveGuide node={nodeById('evolve-3.u003')!}/>);
    expect(screen.getByText('Oxford Word Skills Intermediate')).toBeInTheDocument();
    expect(view.container.querySelectorAll('[aria-disabled="true"]')).toHaveLength(0);
    expect(screen.getAllByRole('link')).toHaveLength(3);
    expect(screen.getAllByRole('link').some(a=>a.getAttribute('href')?.includes('ows-intermediate.u031?view=practice&section=A&from=evolve-3.u003'))).toBe(true);
    expect(screen.getByText('A')).toBeInTheDocument();
    view.rerender(<EvolveGuide node={nodeById('evolve-1.u001')!}/>);
    expect(screen.getAllByRole('link').some(a=>a.getAttribute('href')?.includes('ows-elementary.u013?view=practice&section=A&from=evolve-1.u001'))).toBe(true);
  });
  it('keeps Oxford reverse recommendations specific to the correct book level',()=>{
    const view=render(<OxfordGuide node={nodeById('ows-elementary.u007')!}/>);
    expect(view.container.textContent).not.toContain('Evolve 3');
    view.rerender(<OxfordGuide node={nodeById('ows-intermediate.u007')!}/>);
    expect(screen.getByRole('link')).toHaveTextContent('Evolve 3');
    expect(screen.getByRole('link')).toHaveAttribute('href','/learn/evolve-3.u001?view=units');
  });
  it('saves Evolve 3 writing separately from earlier books and objective progress',()=>{
    localStorage.setItem('english-quest-writing-evolve-1-unit-1','Earlier draft');
    const progress=localStorage.getItem('english-quest-progress-v1');
    render(<WritingStudio pool={unit} back={<span>Back</span>}/>);
    expect(screen.getByRole('heading',{name:'An email about my city'})).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox'),{target:{value:'My city is near the sea.'}});
    fireEvent.click(screen.getByRole('button',{name:'ذخیرهٔ پیش‌نویس'}));
    expect(localStorage.getItem('english-quest-writing-evolve-3-unit-1')).toBe('My city is near the sea.');
    expect(localStorage.getItem('english-quest-writing-evolve-1-unit-1')).toBe('Earlier draft');
    expect(localStorage.getItem('english-quest-progress-v1')).toBe(progress);
  });
  it('offers all 36 recordings with complete dependent questions',()=>{
    render(<ListeningLab pool={BUNDLED_QUESTIONS.filter(q=>q.id.startsWith('evolve3.'))} back={<span>Back</span>}/>);
    const select=screen.getByRole('combobox',{name:'فایل شنیداری'});
    expect(within(select).getAllByRole('option')).toHaveLength(36);
    expect(within(select).getAllByRole('option')[0]).toHaveTextContent('۶ سؤال');
  });
  it('keeps the recording mounted and transcript hidden while dependent questions remain',async()=>{
    const qs=unit.filter(q=>q.skill==='listening').slice(0,2);
    const view=render(<GameRunner items={qs.map(q=>({q,kind:'auto'}))} grade={null} term={null} mode="listening_lab"/>);
    const audio=view.container.querySelector('audio')!;
    fireEvent.loadedMetadata(audio);
    await waitFor(()=>expect(screen.getAllByRole('radio')[0]).toBeEnabled());
    fireEvent.click(screen.getByRole('radio',{name:qs[0]!.answer.value!}));
    expect(screen.queryByRole('article')).toBeNull();
    fireEvent.click(await screen.findByRole('button',{name:'ادامه ←'}));
    expect(view.container.querySelector('audio')).toBe(audio);
    fireEvent.click(screen.getByRole('radio',{name:qs[1]!.answer.value!}));
    expect(await screen.findByRole('article')).toHaveTextContent('Erica');
  });
});
