import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NativeScene } from './NativeScene';
import { QuestionMedia } from './QuestionMedia';
import { WritingStudio } from './WritingStudio';
import { GameRunner } from './GameRunner';
import { QuestionView } from './QuestionView';
import { EVOLVE_NATIVE } from '@/lib/content/evolve';
import { BUNDLED_QUESTIONS, letterPool, type Question } from '@/lib/bank';
import { getProgress } from '@/lib/progress';

afterEach(cleanup);
describe('native exercise interactions', () => {
  it('scrambles saved letter inventories, preserves duplicates and offers varied orders',()=>{
    for(const word of ['letter','whiteboard','notebook','banana','all','dad']) {
      const saved=[...word].reverse(), before=[...saved], orders=new Set<string>();
      for(let i=0;i<40;i++) {
        const result=letterPool(word,saved,i/40);
        expect([...result].sort()).toEqual([...word].sort());
        expect(result.join('')).not.toBe(word);
        expect(result.join('')).not.toBe([...word].reverse().join(''));
        orders.add(result.join(''));
      }
      expect(saved).toEqual(before);
      if(new Set(word).size>2)expect(orders.size).toBeGreaterThan(2);
    }
    expect(letterPool('aaa',['a','a','a'],0)).toEqual(['a','a','a']);
  });
  it('keeps shuffled letters stable during a question and grades duplicate tiles correctly',()=>{
    const original=BUNDLED_QUESTIONS.find(q=>q.id==='ows.elem2.u001.v.whiteboard')!;
    const q={...original,answer:{...original.answer,value:'letter',accepted_answers:[]},letter_pool:[...'letter'].reverse()};
    const submit=vi.fn(), item={q,kind:'letters' as const};
    const view=render(<QuestionView item={item} locked={false} onSubmit={submit} />);
    const before=screen.getAllByRole('button').map(b=>b.textContent);
    expect(before.slice(0,6).join('')).not.toBe('rettel');
    view.rerender(<QuestionView item={item} locked={false} onSubmit={submit} />);
    expect(screen.getAllByRole('button').map(b=>b.textContent)).toEqual(before);
    for(const letter of 'letter')fireEvent.click(screen.getAllByRole('button',{name:letter})[0]!);
    fireEvent.click(screen.getByRole('button',{name:'بررسی'}));
    expect(submit).toHaveBeenLastCalledWith('letter',true);
  });
  it('grades Oxford matching by meaningful choices and builds a corrected sentence', () => {
    const match=BUNDLED_QUESTIONS.find(q=>q.id==='ows.elem2.u003.e02.01')!;
    const submit=vi.fn();
    const view=render(<QuestionView item={{q:match,kind:'auto'}} locked={false} onSubmit={submit} />);
    fireEvent.click(screen.getByRole('radio',{name:'different'}));
    expect(submit).toHaveBeenLastCalledWith('different',true);
    const sentence=BUNDLED_QUESTIONS.find(q=>q.id==='ows.elem2.u013.e01.01')!;
    view.rerender(<QuestionView item={{q:sentence,kind:'tokens'}} locked={false} onSubmit={submit} />);
    for(const word of ['I','need','some','personal','information']) fireEvent.click(screen.getByRole('button',{name:word}));
    fireEvent.click(screen.getByRole('button',{name:'بررسی'}));
    expect(submit).toHaveBeenLastCalledWith('I need some personal information',true);
  });
  it('renders Oxford time and table clues as native elements',()=>{
    const view=render(<NativeScene scene={{kind:'clock',hour:9,minute:15}} />);
    expect(screen.getByRole('img',{name:'Analogue clock showing 9:15'})).toBeInTheDocument();
    expect(view.container.querySelector('img')).toBeNull();
    view.rerender(<NativeScene scene={{kind:'table',title:'Results',columns:['Subject','Grade'],rows:[['English','C']],note:'C = pass'}} />);
    expect(screen.getByRole('table',{name:'Results'})).toBeInTheDocument();
    expect(screen.getByRole('rowheader',{name:'English'}).parentElement).toHaveTextContent('EnglishC');
  });
  it('renders family and cafe facts as readable native elements', () => {
    const view=render(<NativeScene scene={{kind:'family'}} />);
    expect(screen.getByText('Helen')).toBeInTheDocument();
    expect(screen.getByText('Tommy')).toBeInTheDocument();
    view.rerender(<NativeScene scene={{kind:'preferences'}} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('rowheader',{name:'Dalia'}).parentElement).toHaveTextContent('TeaYes2Yes');
    expect(view.container.querySelector('img')).toBeNull();
  });
  it('retains the recording element between questions sharing a track and keeps media failures unready', async () => {
    const qs=EVOLVE_NATIVE.questions.filter(q=>q.id.startsWith('evolve1.native.wb.u01')) as unknown as Question[];
    const ready=vi.fn();const view=render(<QuestionMedia q={qs[0]!} onReady={ready} />);
    const audio=view.container.querySelector('audio')!;
    fireEvent.loadedMetadata(audio);
    await waitFor(()=>expect(ready).toHaveBeenLastCalledWith(true));
    view.rerender(<QuestionMedia q={qs[1]!} onReady={ready} />);
    expect(view.container.querySelector('audio')).toBe(audio);
    fireEvent.error(audio);
    await waitFor(()=>expect(ready).toHaveBeenLastCalledWith(false));
    expect(screen.getByRole('alert')).toHaveTextContent('پاسخی ثبت نشده');
  });
  it('saves a writing draft without changing objective progress', async () => {
    localStorage.setItem('english-quest-progress-v1','{"baseline":true}');
    const pool=BUNDLED_QUESTIONS.filter(q=>q.placements?.some(p=>p.node_id==='evolve-1.u001.s4'));
    render(<WritingStudio pool={pool} back={<span>Back</span>} />);
    fireEvent.change(screen.getByRole('textbox'),{target:{value:'My name is Alex. I am a student.'}});
    fireEvent.click(screen.getByRole('button',{name:'ذخیرهٔ پیش‌نویس'}));
    expect(localStorage.getItem('english-quest-writing-evolve-1-unit-1')).toBe('My name is Alex. I am a student.');
    expect(localStorage.getItem('english-quest-progress-v1')).toBe('{"baseline":true}');
  });
  it('keeps Evolve 2 writing and saved drafts separate from Evolve 1',()=>{
    localStorage.setItem('english-quest-writing-evolve-1-unit-1','An older Evolve 1 draft.');
    const pool=BUNDLED_QUESTIONS.filter(q=>q.placements?.some(p=>p.node_id==='evolve-2.u001.s4'));
    render(<WritingStudio pool={pool} back={<span>Back</span>} />);
    expect(screen.getByRole('heading',{name:'An introductory email'})).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox'),{target:{value:'Dear Alex, I am your new classmate.'}});
    fireEvent.click(screen.getByRole('button',{name:'ذخیرهٔ پیش‌نویس'}));
    expect(localStorage.getItem('english-quest-writing-evolve-2-unit-1')).toBe('Dear Alex, I am your new classmate.');
    expect(localStorage.getItem('english-quest-writing-evolve-1-unit-1')).toBe('An older Evolve 1 draft.');
  });
  it('keeps audio playing when the game advances to another question on the same recording', async () => {
    const qs=EVOLVE_NATIVE.questions.filter(q=>q.id.startsWith('evolve1.native.wb.u01')).slice(0,2) as unknown as Question[];
    const view=render(<GameRunner items={qs.map(q=>({q,kind:'auto'}))} grade={null} term={null} mode="listening_lab" />);
    const audio=view.container.querySelector('audio')!;
    fireEvent.loadedMetadata(audio);
    fireEvent.change(screen.getByRole('textbox'),{target:{value:qs[0]!.answer.value}});
    await waitFor(()=>expect(screen.getByRole('button',{name:'بررسی پاسخ'})).toBeEnabled());
    fireEvent.click(screen.getByRole('button',{name:'بررسی پاسخ'}));
    fireEvent.click(await screen.findByRole('button',{name:'ادامه ←'}));
    expect(view.container.querySelector('audio')).toBe(audio);
    await waitFor(()=>expect(screen.getByRole('textbox')).toBeEnabled());
  });
  it('blocks a failed generated picture without recording an attempt, then recovers on retry', async () => {
    const q=BUNDLED_QUESTIONS.find(q=>q.id==='evolve1.wb.u01.s4.e1a.01')!;
    const before=getProgress().attempts.length;
    const view=render(<GameRunner items={[{q,kind:'auto'}]} grade={null} term={null} scope="native-photo" mode="quest_trail" />);
    fireEvent.error(view.container.querySelector('img')!);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(getProgress().attempts).toHaveLength(before);
    fireEvent.click(screen.getByRole('button',{name:'تلاش دوباره'}));
    fireEvent.load(view.container.querySelector('img')!);
    await waitFor(()=>expect(screen.getByRole('textbox')).toBeEnabled());
    fireEvent.change(screen.getByRole('textbox'),{target:{value:q.answer.value}});
    fireEvent.click(screen.getByRole('button',{name:'بررسی پاسخ'}));
    expect(getProgress().attempts).toHaveLength(before+1);
    expect(getProgress().attempts.at(-1)).toMatchObject({qid:q.id,grade:null,term:null,scope:'native-photo',correct:true});
  });
});
