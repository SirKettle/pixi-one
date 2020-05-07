import { path, pathOr, prop, propEq, propOr } from 'ramda';
import { v4 as generateUid } from 'uuid';
import { Graphics, Sprite, TilingSprite } from 'pixi.js';
import { getAsset, removeAsset, setAsset } from '../store/pixiAssets';
import { getFrameTexture, getTexture } from '../store/textures';
import { getSpecs } from '../specs/getSpecs';
import {
  combineVelocity,
  defaultVector,
  getVelocity,
  normalizeDirection,
} from '../utils/physics';
import { updateActorAi } from './ai';

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
  if (actor.circleGraphicId) {
    container.addChild(getAsset(actor.circleGraphicId));
  }
  return actor;
};

const MAX_ATMOSPHERE_DRAG = 0.1;

export const atmosphereDragFactor = ({ delta, level, isBullet = false }) => {
  const drag = MAX_ATMOSPHERE_DRAG * delta * propOr(0, 'atmosphere')(level);
  return 1 - (isBullet ? drag * 0.3 : drag);
};

export const applyAtmosphereToVelocity = ({ data, delta, level }) => {
  const dragFactor = atmosphereDragFactor({
    isBullet: propOr(false, 'isBullet')(data),
    delta,
    level,
  });
  return {
    x: path(['velocity', 'x'])(data) * dragFactor,
    y: path(['velocity', 'y'])(data) * dragFactor,
  };
};

export const updateActorPosition = ({ data, spriteId }, level, delta) => {
  const sprite = getAsset(spriteId);

  if (!data.velocity) {
    data.velocity = defaultVector;
  }

  data.velocity = applyAtmosphereToVelocity({ data, delta, level });

  data.x += data.velocity.x;
  data.y += data.velocity.y;
  sprite.position.set(data.x, data.y);

  if (data.rotationSpeed) {
    data.rotationSpeed =
      data.rotationSpeed * atmosphereDragFactor({ delta, level });
    data.rotation = normalizeDirection(
      (data.rotation || 0) + data.rotationSpeed * delta
    );
    sprite.rotation = data.rotation;
  }
};

export const updateTilePosition = ({ data, spriteId, offsetPoint }) => {
  const parallaxFactor = propOr(1, 'parallax')(data) / propOr(1, 'scale')(data);
  getAsset(spriteId).tilePosition.set(
    -offsetPoint.x * parallaxFactor,
    -offsetPoint.y * parallaxFactor
  );
};

export const updateActors = (actors, level, delta, deltaMs, pixiGame) => {
  actors.forEach((actor, index) => {
    const { data, spriteId } = actor;
    if (data.ai) {
      updateActorAi(pixiGame, actor, delta, deltaMs);
    }

    updateActorPosition(actor, level, delta);

    const sprite = getAsset(spriteId);
    sprite.scale.set(data.scale || 1);

    if (data.isBullet) {
      data.life -= delta * 0.1;
      sprite.alpha = data.life;
    }

    if (data.life <= 0) {
      actors.splice(index, 1);
      removeAsset(spriteId);
    }
  });
};

export const applyThrusters = ({ actor, delta, forward = 0, side = 0 }) => {
  if (forward !== 0) {
    const specs = getSpecs(actor.assetKey);
    const thrust = pathOr(0.1, ['thrust', 'forward'])(specs);
    const thrustVelocity = getVelocity({
      speed: thrust * delta * forward,
      direction: actor.data.rotation,
    });

    if (thrustVelocity) {
      actor.data.velocity = combineVelocity(
        actor.data.velocity,
        thrustVelocity
      );
    }
  }
  if (side !== 0) {
    const specs = getSpecs(actor.assetKey);
    const thrust = pathOr(0.1, ['thrust', 'left'])(specs);
    const thrustVelocity = getVelocity({
      speed: thrust * delta * side,
      direction: actor.data.rotation + 0.5 * Math.PI,
    });

    if (thrustVelocity) {
      actor.data.velocity = combineVelocity(
        actor.data.velocity,
        thrustVelocity
      );
    }
  }
};
