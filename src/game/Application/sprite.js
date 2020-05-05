import { pathOr, propOr } from 'ramda';
import { getAsset, removeAsset } from '../store/pixiAssets';
import { getFrameTexture } from '../store/textures';
import { getSpecs } from '../specs/getSpecs';
import {
  combineVelocity,
  defaultVelocity,
  getVelocity,
} from '../utils/physics';

export const updateTexture = ({ assetKey, spriteId }, textureKey) => {
  const textureId = getFrameTexture(assetKey, textureKey);
  if (textureId) {
    getAsset(spriteId).texture = getAsset(textureId);
  }
};

export const updateActorPosition = ({ data, spriteId }, delta) => {
  const sprite = getAsset(spriteId);

  if (!data.velocity) {
    data.velocity = defaultVelocity;
  }

  data.x += data.velocity.x;
  data.y += data.velocity.y;
  sprite.position.set(data.x, data.y);

  if (data.rotationSpeed) {
    data.rotation = (data.rotation || 0) + data.rotationSpeed * delta;
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

export const updateActors = (actors, delta) => {
  actors.forEach(({ data, spriteId }, index) => {
    updateActorPosition({ data, spriteId }, delta);

    const sprite = getAsset(spriteId);
    sprite.scale.set(data.scale || 1);

    if (data.assetKey === 'bullet') {
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

export const movePlayer = (actor, delta) => {
  // this is wrong for space
  // actor.data.direction = actor.data.rotation;

  updateActorPosition(actor, delta);
};
