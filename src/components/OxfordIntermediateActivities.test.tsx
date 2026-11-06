import {mediaAsset} from '@/lib/content/pilot';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { OxfordGuide } from './OxfordGuide';
import { EvolveGuide } from './EvolveGuide';
import { QuestionView } from './QuestionView';
import { BUNDLED_QUESTIONS, gapItems } from '@/lib/bank';
import { nodeById } from '@/lib/learning';

vi.mock('@tanstack/react-router',()=>({Link:({children,params,search}:{children:ReactNode;params?:{nodeId?:string};search?:Record<string,string>})=><a href={`/learn/${params?.nodeId??''}?${new URLSearchParams(search).toString()}`}>{children}</a>}));
afterEach(cleanup);
describe('Oxford Intermediate native interactions',()=>{
  it('opens exact Oxford A sections from Evolve and shows the correct return recommendation',()=>{
    const view=render(<EvolveGuide node={nodeById('evolve-3.u005')!}/>);
    expect(screen.getAllByRole('link').some(a=>a.getAttribute('href')?.includes('ows-intermediate.u054?view=practice&section=A&from=evolve-3.u005'))).toBe(true);
    view.rerender(<OxfordGuide node={nodeById('ows-intermediate.u054.s1')!}/>);
    expect(screen.getByText('A · Young and old')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href','/learn/evolve-3.u005?view=units');
    view.rerender(<OxfordGuide node={nodeById('ows-intermediate.u054.s2')!}/>);
    expect(screen.getByText('B · Charities')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });
  it('builds a real phrasal-verb answer using native gap chips',()=>{
    const q=BUNDLED_QUESTIONS.find(q=>q.id==='ows.int.u083.g1')!,submit=vi.fn();
    render(<QuestionView item={{q,kind:'chips',pool:gapItems([q])[0]!.pool}} locked={false} onSubmit={submit}/>);
    fireEvent.click(screen.getByRole('button',{name:'turn them off'}));
    fireEvent.click(screen.getByRole('button',{name:'قرار بده و بررسی کن'}));
    expect(submit).toHaveBeenLastCalledWith('turn them off',true);
  });
  it('loads independent photo tiles before accepting an answer and supports native SVG diagrams',async()=>{
    const photo=BUNDLED_QUESTIONS.find(q=>q.id==='ows.int.u018.photo01')!,submit=vi.fn();
    const view=render(<QuestionView item={{q:photo,kind:'auto'}} locked={false} onSubmit={submit}/>);
    expect(screen.getByRole('button',{name:'Picture A'})).toBeDisabled();
    for(const img of view.container.querySelectorAll('img'))fireEvent.load(img);
    await waitFor(()=>expect(screen.getByRole('button',{name:'Picture A'})).toBeEnabled());
    const correctPhoto=mediaAsset(photo.native_options![photo.answer.correct_option_id!]!)!;fireEvent.click(screen.getByAltText(correctPhoto.alt).closest('button')!);
    expect(submit).toHaveBeenLastCalledWith(correctPhoto.alt,true);
    const shape=BUNDLED_QUESTIONS.find(q=>q.id==='ows.int.u045.shape1')!;
    view.rerender(<QuestionView item={{q:shape,kind:'auto'}} locked={false} onSubmit={submit}/>);
    expect([...view.container.querySelectorAll('img')].every(img=>img.src.endsWith('.svg'))).toBe(true);
  });
});
