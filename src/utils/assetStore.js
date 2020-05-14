import { pathEq } from 'ramda';
import { v4 as generateUid } from 'uuid';

const assetStore = {};

export function getAsset(uid) {
  return assetStore[uid] ? assetStore[uid].asset : undefined;
}

export function setAsset(asset, options = {}) {
  const { removable = false, uid = generateUid(), tag } = options;
  const item = {
    asset,
    removable,
    tag,
  };
  assetStore[uid] = item;
  return uid;
}

export function removeAsset(uid, force = false) {
  const asset = getAsset(uid);
  if (force || pathEq([uid, 'removable'], true)(assetStore)) {
    if (asset && typeof asset.destroy === 'function') {
      asset.destroy();
    }
    delete assetStore[uid];
  }
}

export function destroyAllAssets(force = false) {
  Object.keys(assetStore).forEach((uid) => removeAsset(uid, force));
}

window.assetStore = assetStore; // todo: remove - only left for debugging
window.getAsset = getAsset;
window.setAsset = setAsset;
window.removeAsset = removeAsset;
window.destroyAllAssets = destroyAllAssets;
