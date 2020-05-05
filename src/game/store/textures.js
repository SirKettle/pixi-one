import { BaseTexture, Rectangle, Texture } from 'pixi.js';
import { setAsset } from './pixiAssets';
import { path, prop } from 'ramda';
import { getSpecs } from '../specs/getSpecs';

const createFrameTexture = (baseTexture, { x, y, width, height }) =>
  setAsset(new Texture(baseTexture, new Rectangle(x, y, width, height)));

// reusable texture ids stored in pixiAssets
// (multiple ships of same type share textures)
const _textures = {};

export const getTexture = (assetKey) => {
  return prop(assetKey)(_textures);
};

export const getFrameTexture = (assetKey, frameKey = 'DEFAULT') => {
  return path([assetKey, frameKey])(_textures);
};

export const setFrameTextures = (loader) => (assetKey) => {
  const imageUrl = loader.resources[assetKey].url;
  const settings = getSpecs(assetKey);

  const baseTextureSheet = new BaseTexture.from(imageUrl);

  return (_textures[assetKey] = settings.frames.reduce(
    (acc, { key, rect }) => ({
      ...acc,
      [key]: createFrameTexture(baseTextureSheet, rect),
    }),
    {}
  ));
};

export const createFrameTextures = (loader, assetKeys = []) => {
  assetKeys.forEach(setFrameTextures(loader));
};

export const createTextures = (loader, assetKeys = []) => {
  assetKeys.forEach((assetKey) => {
    const texture = new Texture.from(loader.resources[assetKey].url);
    _textures[assetKey] = setAsset(texture);
    console.log('create texture', assetKey, _textures[assetKey]);
  });
};
