import type {Asset} from './contracts';

/** Live framing corrections preserve the original release metadata and image bytes. */
export function refineNativeArtAsset(asset:Asset):Asset {
  const tile=asset.tile_index;
  if(asset.native_crop||asset.path!=='/assets/evolve-3-native/city-materials-v1.png'||typeof tile!=='number'||!Number.isInteger(tile)||tile<8||tile>15)return asset;
  const column=tile%4,thirdRow=Math.floor(tile/4)===2;
  // Visual review of the 1254px atlas: the third row ends near y=924, before a uniform 75% boundary.
  const native_crop:[number,number,number,number]=[column*.25+.003,thirdRow?.501:.739,.244,thirdRow?.235:.258];
  return {...asset,native_crop,presentation_refinement:'Reviewed framing for unequal city/materials atlas rows'};
}
