import { path, pathOr, prop, propEq, propOr } from 'ramda';
import { v4 as generateUid } from 'uuid';
import { Graphics, Sprite, TilingSprite } from 'pixi.js';
import { getAsset, removeAsset, setAsset } from '../../utils/assetStore';
import { getFrameTexture, getTexture } from '../../utils/textures';
import { getSpecs } from '../../specs/getSpecs';
import {
  combineVelocity,
  defaultVector,
  getDistance,
  getVelocity,
  normalizeDirection,
} from '../../utils/physics';
import { updateActorAi } from './ai';
import { drawHitCircles, getActorRadius } from '../../utils/actor';

export const createTile = (app, container) => (tile) => {
  const { screen } = app;
  const sprite = new TilingSprite(
    getAsset(getTexture(path(['data', 'assetKey'])(tile))),
    screen.width,
    screen.height
  );
  const spriteId = setAsset(sprite, { removable: true });
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
    spriteId: setAsset(sprite, { removable: true }),
    graphicId: setAsset(new Graphics(), { removable: true }),
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
  if (actor.graphicId) {
    container.addChild(getAsset(actor.graphicId));
  }
  const specs = getSpecs(assetKey);
  actor.performance = {
    radiusPx: getActorRadius(actor),
    precisionHitAreas: pathOr([], ['hitArea', 'precision'])(specs),
  };
  return actor;
};

const MAX_ATMOSPHERE_DRAG = 0.1;

export const atmosphereDragFactor = ({ delta, level, isBullet = false, factor = 1 }) => {
  const drag = MAX_ATMOSPHERE_DRAG * delta * propOr(0, 'atmosphere')(level);
  const adjDrag = isBullet ? 0.3 : factor;
  return 1 - drag * adjDrag;
};

export const applyAtmosphereToVelocity = ({ data, delta, level }) => {
  const dragFactor = atmosphereDragFactor({
    isBullet: propOr(false, 'isBullet')(data),
    delta,
    level,
  });
  return {
    x: path(['velocity', 'x'])(data) * dragFactor,
    y: path(['velocity', 'y'])(data) * dragFactor + propOr(0, 'gravity')(level),
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
    data.rotationSpeed = data.rotationSpeed * atmosphereDragFactor({ delta, level, factor: 0 });
    data.rotation = normalizeDirection((data.rotation || 0) + data.rotationSpeed * delta);
    sprite.rotation = data.rotation;
  }
};

export const updateTilePosition = (offsetPoint) => ({ data, spriteId }) => {
  const parallaxFactor = propOr(1, 'parallax')(data) / propOr(1, 'scale')(data);
  getAsset(spriteId).tilePosition.set(
    -offsetPoint.x * parallaxFactor,
    -offsetPoint.y * parallaxFactor
  );
};

export function updateTiles(tiles, offsetPoint) {
  const updateFunc = updateTilePosition(offsetPoint);
  tiles.forEach(updateFunc);
}

export const updateActors = (actors, level, delta, deltaMs, game) => {
  actors.forEach((actor, index) => {
    const { data, graphicId, spriteId } = actor;
    getAsset(graphicId).clear();

    if (data.ai) {
      updateActorAi(game, actor, delta, deltaMs);
    }

    updateActorPosition(actor, level, delta);

    if (game.settings.isDebugCollsionMode) {
      drawHitCircles(actor);
    }

    const sprite = getAsset(spriteId);
    sprite.scale.set(data.scale || 1);

    if (data.isBullet) {
      data.life -= delta * 0.1;
      sprite.alpha = data.life;
    } else {
      data.distanceFromCenter = getDistance(game.player.data, data);
    }

    if (data.life <= 0) {
      actors.splice(index, 1);
      removeAsset(spriteId);
      removeAsset(graphicId);
    }
  });
};

export const applyThrusters = ({ actor, delta, forward = 0, side = 0 }) => {
  if (forward !== 0) {
    const specs = getSpecs(actor.assetKey);
    const thrust = pathOr(0.1, ['thrust', 'forward'])(specs) * 0.2;
    const thrustVelocity = getVelocity({
      speed: thrust * delta * forward,
      direction: actor.data.rotation,
    });

    if (thrustVelocity) {
      actor.data.velocity = combineVelocity(actor.data.velocity, thrustVelocity);
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
      actor.data.velocity = combineVelocity(actor.data.velocity, thrustVelocity);
    }
  }
};
