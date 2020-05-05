import { createFrameTextures, createTextures } from '../store/textures';
import { getSpecs } from '../specs/getSpecs';
import { prop } from 'ramda';

export const loadAssets = async ({
  loader,
  assetKeys = [],
  tileAssetKeys = [],
}) => {
  assetKeys.concat(tileAssetKeys).forEach((assetKey) => {
    const url = prop('imageUrl')(getSpecs(assetKey));
    if (url) {
      console.log('load asset', assetKey, url);
      loader.add({ name: assetKey, url });
    }
  });

  await loader.load();

  console.log('loadAssets after await');
  // create textures ready for our sprites
  createFrameTextures(loader, assetKeys);
  createTextures(loader, tileAssetKeys);
};
