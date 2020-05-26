import { createAnimatedFrameTextures, createFrameTextures, createTextures } from './textures';
import { getSpecs } from '../specs/getSpecs';
import { prop } from 'ramda';
// import { library } from '../sound';

function loadAsset(loader, url, name) {
  if (!url) {
    console.warn('Cannot load asset without url', name);
    return;
  }

  const assetKey = name || url;

  if (loader.resources[assetKey]) {
    // console.warn('Asset already loaded', assetKey);
    return;
  }

  // console.log('load asset', assetKey, url);

  loader.add(name ? { name: assetKey, url } : assetKey);
}

export const loadAssets = async ({
  loader,
  assetKeys = [],
  animatedAssetKeys = [],
  tileAssetKeys = [],
}) => {
  assetKeys.concat(animatedAssetKeys, tileAssetKeys).forEach((assetKey) => {
    const url = prop('imageUrl')(getSpecs(assetKey));
    loadAsset(loader, url, assetKey);
  });

  await loader.load();

  // create textures ready for our sprites
  createFrameTextures(loader, assetKeys);
  createAnimatedFrameTextures(loader, animatedAssetKeys);
  createTextures(loader, tileAssetKeys);
};
