import {mediaAsset} from '@/lib/content/pilot';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { OxfordGuide } from './OxfordGuide';
import { EvolveGuide } from './EvolveGuide';
import { QuestionView } from './QuestionView';
import { BUNDLED_QUESTIONS } from '@/lib/bank';
import { nodeById } from '@/lib/learning';

vi.mock('@tanstack/react-router',()=>({Link:({children,params,search}:{children:ReactNode;params?:{nodeId?:string};search?:Record<string,string>})=><a href={`/learn/${params?.nodeId??''}?${new URLSearchParams(search).toString()}`}>{children}</a>}));
afterEach(cleanup);
describe('Oxford Upper Intermediate–Advanced native interactions',()=>{
  it('activates Evolve 5 links and retains the correct book and section on return cards',()=>{
    const view=render(<EvolveGuide node={nodeById('evolve-5.u001')!}/>);
    expect(screen.getByText('Oxford Word Skills Upper Intermediate–Advanced')).toBeInTheDocument();
    expect(screen.getAllByRole('link').map(a=>a.getAttribute('href'))).toEqual([
      '/learn/ows-upper-intermediate.u072?view=practice&from=evolve-5.u001',
      '/learn/ows-upper-intermediate.u045?view=practice&from=evolve-5.u001',
      '/learn/ows-upper-intermediate.u074?view=practice&from=evolve-5.u001',
    ]);
    view.rerender(<OxfordGuide node={nodeById('ows-upper-intermediate.u072.s1')!}/>);
    expect(screen.getByText('A · Problems in general')).toBeInTheDocument();expect(screen.getByRole('link')).toHaveAttribute('href','/learn/evolve-5.u001?view=units');
    view.rerender(<OxfordGuide node={nodeById('ows-upper-intermediate.u072.s2')!}/>);
    expect(screen.getByText('B · Problems and solutions')).toBeInTheDocument();expect(screen.getByRole('link')).toHaveAttribute('href','/learn/evolve-5.u001?view=units');
  });
  it('grades a native response by its intended function',()=>{
    const q=BUNDLED_QUESTIONS.find(q=>q.id==='ows.upper.u083.dialogue1')!,submit=vi.fn();
    render(<QuestionView item={{q,kind:'auto'}} locked={false} onSubmit={submit}/>);
    fireEvent.click(screen.getByRole('radio',{name:'Take your time.'}));expect(submit).toHaveBeenCalledWith('Take your time.',true);
  });
  it('waits for independent photo clues and renders the native engineering diagrams',async()=>{
    const q=BUNDLED_QUESTIONS.find(q=>q.id==='ows.upper.u024.photo.a1')!,submit=vi.fn();
    const view=render(<QuestionView item={{q,kind:'auto'}} locked={false} onSubmit={submit}/>);
    expect(screen.getByRole('button',{name:'Picture A'})).toBeDisabled();
    for(const img of view.container.querySelectorAll('img'))fireEvent.load(img);
    await waitFor(()=>expect(screen.getByRole('button',{name:'Picture A'})).toBeEnabled());const correctPhoto=mediaAsset(q.native_options![q.answer.correct_option_id!]!)!;fireEvent.click(screen.getByAltText(correctPhoto.alt).closest('button')!);expect(submit).toHaveBeenLastCalledWith(correctPhoto.alt,true);
    const diagram=BUNDLED_QUESTIONS.find(q=>q.id==='ows.upper.u080.diagram1')!;
    view.rerender(<QuestionView item={{q:diagram,kind:'auto'}} locked={false} onSubmit={submit}/>);
    expect([...view.container.querySelectorAll('img')].every(img=>img.src.endsWith('.svg'))).toBe(true);
  });
});
