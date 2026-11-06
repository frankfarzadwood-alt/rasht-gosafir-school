import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { EvolveGuide } from './EvolveGuide';
import { OxfordGuide } from './OxfordGuide';
import { WritingStudio } from './WritingStudio';
import { ListeningLab } from './ListeningLab';
import { BUNDLED_QUESTIONS } from '@/lib/bank';
import { nodeById } from '@/lib/learning';

vi.mock('@tanstack/react-router',()=>({Link:({children,params,search}:{children:ReactNode;params?:{nodeId?:string};search?:Record<string,string>})=><a href={`/learn/${params?.nodeId??''}?${new URLSearchParams(search).toString()}`}>{children}</a>}));
afterEach(cleanup);

describe('Evolve 4 native interactions',()=>{
  it('shows 13 workbook tracks and connects the correct Oxford recommendation in both directions',()=>{
    const view=render(<EvolveGuide node={nodeById('evolve-4')!}/>);
    expect(view.container.textContent).toContain('۱۳ فایل ورک‌بوک');
    view.rerender(<EvolveGuide node={nodeById('evolve-4.u001')!}/>);
    expect(screen.getAllByRole('link')).toHaveLength(3);
    expect(screen.getAllByRole('link').some(a=>a.getAttribute('href')?.includes('ows-intermediate.u038?view=practice&from=evolve-4.u001'))).toBe(true);
    view.rerender(<OxfordGuide node={nodeById('ows-intermediate.u038')!}/>);
    expect(screen.getByRole('link')).toHaveAttribute('href','/learn/evolve-4.u001?view=units');
  });
  it('keeps a book 4 draft separate from previous books and objective progress',()=>{
    localStorage.setItem('english-quest-writing-evolve-3-unit-1','Earlier draft');
    const progress=localStorage.getItem('english-quest-progress-v1');
    render(<WritingStudio pool={BUNDLED_QUESTIONS.filter(q=>q.id.startsWith('evolve4.native.wb.u01.'))} back={<span>Back</span>}/>);
    expect(screen.getByRole('heading',{name:'Respond to interview advice'})).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox'),{target:{value:'Thank you for these useful tips.'}});
    fireEvent.click(screen.getByRole('button',{name:'ذخیرهٔ پیش‌نویس'}));
    expect(localStorage.getItem('english-quest-writing-evolve-4-unit-1')).toBe('Thank you for these useful tips.');
    expect(localStorage.getItem('english-quest-writing-evolve-3-unit-1')).toBe('Earlier draft');
    expect(localStorage.getItem('english-quest-progress-v1')).toBe(progress);
  });
  it('offers the separate tone recording with its own five questions among all 37 tracks',()=>{
    render(<ListeningLab pool={BUNDLED_QUESTIONS.filter(q=>q.id.startsWith('evolve4.'))} back={<span>Back</span>}/>);
    const select=screen.getByRole('combobox',{name:'فایل شنیداری'});
    const options=within(select).getAllByRole('option');expect(options).toHaveLength(37);
    const tone=options.find(o=>o.getAttribute('value')==='evolve4.native.wb.audio.10.tone');
    expect(tone).toBeTruthy();expect(tone).toHaveTextContent('۵ سؤال');
    fireEvent.change(select,{target:{value:'evolve4.native.wb.audio.10.tone'}});
    expect(document.querySelector('audio')).toHaveAttribute('src','/assets/evolve-4-native/workbook-u10-tone.mp3');
  });
});
