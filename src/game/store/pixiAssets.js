import { v4 as generateUid } from 'uuid';

const assetStore = {};

export const getAsset = (uid) => assetStore[uid];

export const setAsset = (asset, uid = generateUid()) => {
	assetStore[uid] = asset;
	return uid;
};

export const removeAsset = (uid) => {
	const asset = getAsset(uid);
	if (asset && typeof asset.destroy === 'function') {
		asset.destroy();
	}
	delete assetStore[uid];
}
