import {describe,expect,it} from 'vitest';
import type {Asset} from './content/contracts';
import {refineNativeArtAsset} from './content/native-art';
const original:Asset={id:'existing.photo',kind:'image',path:'/assets/evolve-3-native/city-materials-v1.png',sha256:'original-hash',review_status:'ready',atlas_columns:4,tile_index:10};
describe('live native-art framing',()=>{
 it('keeps a third-row photograph inside its reviewed row without mutating the release',()=>{const frozen=Object.freeze({...original}),next=refineNativeArtAsset(frozen);expect(frozen.native_crop).toBeUndefined();expect(next.id).toBe(frozen.id);expect(next.sha256).toBe(frozen.sha256);const[x,y,w,h]=next.native_crop!;expect(y+h).toBeLessThan(.738);expect(x).toBeGreaterThan(.5);expect(x+w).toBeLessThan(.75);});
 it('uses the actual fourth-row start and stays inside the image',()=>{const next=refineNativeArtAsset({...original,tile_index:12});const[x,y,w,h]=next.native_crop!;expect(y).toBeGreaterThan(.738);expect(y+h).toBeLessThanOrEqual(1);expect(x).toBeGreaterThanOrEqual(0);expect(x+w).toBeLessThan(.25);});
 it('preserves explicit crops, other atlases and unreviewed tiles',()=>{const custom={...original,native_crop:[.5,.5,.2,.2] as [number,number,number,number]},upper={...original,tile_index:1},other={...original,path:'/assets/another.png'};for(const a of [custom,upper,other])expect(refineNativeArtAsset(a)).toBe(a);});
});
