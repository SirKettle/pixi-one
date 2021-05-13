import { omit, path, pathOr, prop, propEq, propOr, range } from 'ramda';
import { v4 as generateUid } from 'uuid';
import { Graphics, Sprite, TilingSprite } from 'pixi.js';
import { getAsset, removeAsset, setAsset } from '../../utils/assetStore';
import { getFrameTextureId, getTextureId } from '../../utils/textures';
import { getSpecs } from '../../specs/getSpecs';
import {
  combineVelocity,
  defaultVector,
  getDirection,
  getDistance,
  getVelocity,
  normalizeDirection,
} from '../../utils/physics';
import { updateActorAi } from './ai';
import {
  drawHitCircles,
  getActorRadius,
  getShouldUpdate,
  getUpdateFrequency,
} from '../../utils/actor';
import { addExplosion } from '../../utils/particle';

export const createTile = (app, container) => (tile) => {
  const { screen } = app;
  const sprite = new TilingSprite(
    getAsset(getTextureId(path(['data', 'assetKey'])(tile))),
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

  const textureId = getFrameTextureId(assetKey);
  const sprite = new Sprite(getAsset(textureId));
  sprite.anchor.set(0.5);
  sprite.position.set(data.x, data.y); // maybe don't even need this?

  return {
    uid: uid || data.uid || generateUid(),
    assetKey,
    data: omit(['uid'])(data),
    spriteId: setAsset(sprite, { removable: true }),
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

  const specs = getSpecs(assetKey);
  actor.performance = {
    radiusPx: getActorRadius(actor),
    precisionHitAreas: pathOr([], ['hitArea', 'precision'])(specs),
    startLife: actor.data.life,
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
    const { data, graphicId, performance, spriteId } = actor;

    if (data.ai) {
      const updateFrequency = getUpdateFrequency(data.distanceFromCenter, 'ai');
      const shouldUpdate = getShouldUpdate(game, index, updateFrequency);
      if (shouldUpdate) {
        updateActorAi(game, actor, delta * updateFrequency, deltaMs * updateFrequency);
      }
    }

    updateActorPosition(actor, level, delta);
    data.distanceFromCenter = getDistance(game.player.data, data);

    if (game.settings.isDebugCollisionMode) {
      drawHitCircles(game, actor);
    }

    const sprite = getAsset(spriteId);
    sprite.scale.set(data.scale || 1);

    if (data.isBullet) {
      data.life -= delta * 0.1;
      sprite.alpha = data.life;
    }

    if (data.life <= 0) {
      if (!data.isBullet) {
        addExplosion({
          container: getAsset(game.containers.worldNear),
          scale: performance.radiusPx / 100,
          x: data.x,
          y: data.y,
        });
      }

      actors.splice(index, 1);
      removeAsset(spriteId);
      removeAsset(graphicId);
    }
  });
};

export function applyThrusters({ actor, delta, forward = 0, side = 0 }) {
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
}

export function shouldTurnLeft(rotationChange) {
  if (rotationChange < 0) {
    return rotationChange < -Math.PI ? false : true;
  }
  if (rotationChange > Math.PI) {
    return true;
  }
  return false;
}

export function turnTowardsDirection(actor, targetDirection, specs, delta) {
  const sprite = getAsset(actor.spriteId);
  const rotationChange = targetDirection - actor.data.rotation;
  const absRotationChangeDeltaApplied = Math.abs(rotationChange) * delta * 0.1;
  const turnBy = Math.min(
    1,
    Math.min(
      absRotationChangeDeltaApplied,
      absRotationChangeDeltaApplied * pathOr(1, ['thrust', 'turn'])(specs)
    )
  );
  const turningLeft = shouldTurnLeft(rotationChange);
  const adjTurnBy = turningLeft ? -turnBy : turnBy;

  actor.data.rotation = normalizeDirection(actor.data.rotation + adjTurnBy);
  sprite.rotation = actor.data.rotation;
}

export function turnTowards(actor, vTarget, specs, delta) {
  return turnTowardsDirection(actor, getDirection(actor.data, vTarget), specs, delta);
}

export function moveTowardsDirection(
  actor,
  targetDirection,
  specs,
  delta,
  thrust = 0.75
) {
  turnTowardsDirection(actor, targetDirection, specs, delta);

  applyThrusters({
    actor,
    delta,
    thrustDirection: 'forward',
    forward: thrust * pathOr(0.1, ['thrust', 'forward'])(specs),
  });
}

export function moveTowardsTarget(actor, vTarget, targetInfo, specs, delta, thrust = 0.75) {
  turnTowards(actor, vTarget, specs, delta);

  applyThrusters({
    actor,
    delta,
    thrustDirection: 'forward',
    forward: thrust * pathOr(0.1, ['thrust', 'forward'])(specs),
  });
}
