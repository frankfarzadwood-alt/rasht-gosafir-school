import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,describe,expect,it,vi} from 'vitest';
import {QuestionMedia} from './QuestionMedia';
import type {Question} from '@/lib/bank';
vi.mock('@/lib/content/pilot',()=>({mediaAsset:(id:unknown)=>['one','two','audio'].includes(String(id))?{id,url:`/${id}`,alt:String(id)}:null}));
afterEach(cleanup);
const q={assets:{image:'one',images:['one','two'],source_image_required:true,source_audio_required:false}} as Question;
describe('required multi-page source media',()=>{
 it('waits for every page and gates a complete retry after failure',()=>{
  const ready=vi.fn();render(<QuestionMedia q={q} onReady={ready}/>);expect(ready).toHaveBeenLastCalledWith(false);
  fireEvent.load(screen.getByAltText('one'));expect(ready).toHaveBeenLastCalledWith(false);fireEvent.load(screen.getByAltText('two'));expect(ready).toHaveBeenLastCalledWith(true);
  fireEvent.error(screen.getByAltText('two'));expect(ready).toHaveBeenLastCalledWith(false);fireEvent.click(screen.getByRole('button',{name:'تلاش دوباره'}));fireEvent.load(screen.getByAltText('two'));expect(ready).toHaveBeenLastCalledWith(false);fireEvent.load(screen.getByAltText('one'));expect(ready).toHaveBeenLastCalledWith(true);
 });
 it('cannot grade around an unresolved second image',()=>{
  const ready=vi.fn();render(<QuestionMedia q={{...q,assets:{...q.assets,images:['one','missing']}}} onReady={ready}/>);fireEvent.load(screen.getByAltText('one'));expect(ready).toHaveBeenLastCalledWith(false);expect(screen.getByRole('alert')).toBeInTheDocument();
 });
});
