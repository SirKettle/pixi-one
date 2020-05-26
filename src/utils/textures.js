import { BaseTexture, Rectangle, Texture } from 'pixi.js';
import { path, prop } from 'ramda';
import { getAsset, setAsset } from './assetStore';
import { getSpecs } from '../specs/getSpecs';

const createFrameTexture = (
  baseTextureInfo,
  { x, y, width, height },
  frameKey,
  removable = true
) => {
  const uid = `${baseTextureInfo.uid}-frame-${frameKey}`;
  if (!getAsset(uid)) {
    setAsset(new Texture(baseTextureInfo.texture, new Rectangle(x, y, width, height)), {
      uid,
      removable,
    });
  }
  return uid;
};

// reusable texture ids stored in pixiAssets
// (multiple ships of same type share textures)
const _textureIdsByAssetKeyMap = {};

export const getTextureId = (assetKey) => {
  return prop(assetKey)(_textureIdsByAssetKeyMap);
};

export const getAnimatedTextureIds = (assetKey) => {
  return prop(assetKey)(_textureIdsByAssetKeyMap);
};

export const getFrameTextureId = (assetKey, frameKey = 'DEFAULT') => {
  return path([assetKey, frameKey])(_textureIdsByAssetKeyMap);
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

  _textureIdsByAssetKeyMap[assetKey] = settings.frames.reduce(
    (acc, { key, rect }) => ({
      ...acc,
      [key]: createFrameTexture(baseTextureInfo, rect, key),
    }),
    {}
  );

  return _textureIdsByAssetKeyMap[assetKey];
};

export const setAnimatedFrameTextures = (loader) => (assetKey) => {
  const imageUrl = loader.resources[assetKey].url;
  const settings = getSpecs(assetKey);

  const baseTextureInfo = getBaseTextureSheet(imageUrl);

  _textureIdsByAssetKeyMap[assetKey] = settings.frames.map((rect, index) =>
    createFrameTexture(baseTextureInfo, rect, index, false)
  );

  return _textureIdsByAssetKeyMap[assetKey];
};

export const createFrameTextures = (loader, assetKeys = []) => {
  assetKeys.forEach(setFrameTextures(loader));
};

export const createAnimatedFrameTextures = (loader, assetKeys = []) => {
  assetKeys.forEach(setAnimatedFrameTextures(loader));
};

export const createTextures = (loader, assetKeys = []) => {
  assetKeys.forEach((assetKey) => {
    const texture = new Texture.from(loader.resources[assetKey].url);
    _textureIdsByAssetKeyMap[assetKey] = setAsset(texture);
  });
};

export const updateTexture = ({ assetKey, spriteId }, textureKey) => {
  const textureId = getFrameTextureId(assetKey, textureKey);
  if (textureId) {
    getAsset(spriteId).texture = getAsset(textureId);
  }
};
