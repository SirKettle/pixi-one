import { createFrameTextures, createTextures } from './textures';
import { getSpecs } from '../specs/getSpecs';
import { prop } from 'ramda';

export const loadAssets = async ({ loader, assetKeys = [], tileAssetKeys = [] }) => {
  assetKeys.concat(tileAssetKeys).forEach((assetKey) => {
    const url = prop('imageUrl')(getSpecs(assetKey));
    if (url) {
      if (!loader.resources[assetKey]) {
        console.log('load asset', assetKey, url);
        loader.add({ name: assetKey, url });
      }
    }
  });

  await loader.load();

  console.log('loadAssets after await');
  // create textures ready for our sprites
  createFrameTextures(loader, assetKeys);
  createTextures(loader, tileAssetKeys);
};
