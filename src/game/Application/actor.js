import { v4 as generateUid } from 'uuid';
import { Graphics, Sprite, TilingSprite } from 'pixi.js';
import { getAsset, setAsset } from '../store/pixiAssets';
import { getFrameTexture, getTexture } from '../store/textures';
import { getSpecs } from '../specs/getSpecs';
import { path, pathOr, prop, propEq } from 'ramda';

export const createTile = (app, container) => (tile) => {
  const { screen } = app;
  const sprite = new TilingSprite(
    getAsset(getTexture(path(['data', 'assetKey'])(tile))),
    screen.width,
    screen.height
  );
  const spriteId = setAsset(sprite);
  sprite.position.set(0, 0);
  sprite.scale.set(pathOr(1, ['data', 'scale'])(tile));
  sprite.alpha = path(['data', 'alpha'])(tile) || 1;
  container.addChild(sprite);
  return {
    ...tile,
    spriteId,
  };
};

export const initActor = ({ assetKey, overrides = {}, uid }) => {
  const data = {
    x: 0,
    y: 0,
    rotation: 0, // which way the actor is facing
    velocity: {
      x: 0,
      y: 0,
    },
    collisionBlacklist: [],
    ...prop('initialData')(getSpecs(assetKey)),
    ...overrides,
  };

  const textureId = getFrameTexture(assetKey);
  const sprite = new Sprite(getAsset(textureId));
  sprite.anchor.set(0.5);
  sprite.position.set(data.x, data.y); // maybe don't even need this?

  return {
    uid: uid || generateUid(),
    assetKey,
    data,
    spriteId: setAsset(sprite),
    circleGraphicId: setAsset(new Graphics()), // hmmm
  };
};

export const createActor = (container) => (data) => {
  const assetKey = data.assetKey;
  const actor = initActor({
    assetKey,
    overrides: {
      ...data,
    },
  });
  container.addChild(getAsset(actor.spriteId));
  return actor;
};

export const getActorByUid = ({ player, actors, bullets }, uid) => {
  if (player.uid === uid) {
    return player;
  }
  const actor = actors.find(propEq('uid', uid));

  return actor || bullets.find(propEq('uid', uid));
};
