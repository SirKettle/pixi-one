import { BaseTexture, Rectangle, Texture } from 'pixi.js';
import { path, prop } from 'ramda';
import { getAsset, setAsset } from './assetStore';
import { getSpecs } from '../specs/getSpecs';

const createFrameTexture = (baseTextureInfo, { x, y, width, height }) => {
  const uid = `base-${baseTextureInfo.uid}-(frame-${x},${y})`;
  if (!getAsset(uid)) {
    setAsset(new Texture(baseTextureInfo.texture, new Rectangle(x, y, width, height)), {
      uid,
      removable: true,
    });
  }
  return uid;
};

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
  const uid = `base-${imageUrl}`;
  if (!getAsset(uid)) {
    setAsset(new BaseTexture.from(imageUrl), { uid });
  }
  return {
    uid,
    texture: getAsset(uid),
  };
};

export const setFrameTextures = (loader) => (assetKey) => {
  const imageUrl = loader.resources[assetKey].url;
  const settings = getSpecs(assetKey);

  const baseTextureInfo = getBaseTextureSheet(imageUrl);

  return (_textures[assetKey] = settings.frames.reduce(
    (acc, { key, rect }) => ({
      ...acc,
      [key]: createFrameTexture(baseTextureInfo, rect),
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
