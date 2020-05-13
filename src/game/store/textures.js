import { BaseTexture, Rectangle, Texture } from 'pixi.js';
import { path, prop } from 'ramda';
import { getAsset, setAsset } from './pixiAssets';
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

const getBaseTextureSheet = (imageUrl) => {
  const textureId = `base-${imageUrl}`;
  const maybeTexture = getAsset(textureId);
  if (maybeTexture) {
    return maybeTexture;
  }
  setAsset(new BaseTexture.from(imageUrl), textureId);
  return getAsset(textureId);
};

export const setFrameTextures = (loader) => (assetKey) => {
  const imageUrl = loader.resources[assetKey].url;
  const settings = getSpecs(assetKey);

  const baseTextureSheet = getBaseTextureSheet(imageUrl);

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
  });
};

export const updateTexture = ({ assetKey, spriteId }, textureKey) => {
  const textureId = getFrameTexture(assetKey, textureKey);
  if (textureId) {
    getAsset(spriteId).texture = getAsset(textureId);
  }
};
