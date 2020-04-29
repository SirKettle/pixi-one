import * as Pixi from 'pixi.js';
import { path } from 'ramda';

export const updateTexture = (actor, textureKey) => {
  const texture = path(['textures', textureKey])(actor);
  if (texture) {
    actor.sprite.texture = texture;
  }
};

export const createSpriteSheetTexture = ({ sheet, width, height, index }) =>
  new Pixi.Texture(sheet, new Pixi.Rectangle(index * width, 0, width, height));

export const addSprite = (container, texture, data) => {
  const sprite = new Pixi.Sprite(texture);
  sprite.anchor.set(0.5);
  sprite.position.set(data.x, data.y);
  sprite.alpha = data.alpha || 1;
  sprite.rotation = data.direction || 0;
  container.addChild(sprite);
  return {
    data: {
      ...data,
    },
    sprite,
  };
};

export const updateActorPosition = ({ data, sprite }, delta) => {
  if (data.speed) {
    const distance = data.speed * delta;
    data.y -= Math.cos(data.direction || 0) * distance;
    data.x += Math.sin(data.direction || 0) * distance;
    sprite.position.set(data.x, data.y);
  }
  if (data.rotationSpeed) {
    sprite.rotation += data.rotationSpeed * delta;
  }
};

export const updateTilePosition = ({ data, sprite, offsetPoint }) => {
  sprite.tilePosition.set(
    -offsetPoint.x * data.parallax,
    -offsetPoint.y * data.parallax
  );
};

export const updateActors = (actors, delta) => {
  actors.forEach(({ data, sprite }, index) => {
    updateActorPosition({ data, sprite }, delta);

    if (data.key === 'bullet') {
      data.life -= delta * 0.1;
      sprite.alpha = data.life;
    }

    if (data.life <= 0) {
      sprite.destroy();
      actors.splice(index, 1);
    }
  });
};

export const thrust = (actor, delta, direction = 'forward') => {
  switch (direction) {
    case 'forward': {
      // this is wrong for space
      actor.data.speed += actor.data.acceleration * delta;
      // actor.data.thrust = delta;
      break;
    }
    case 'reverse': {
      actor.data.speed -=
        actor.data.speed > 0
          ? actor.data.deceleration * delta
          : actor.data.reverseAcceleration * delta;
      break;
    }
  }

  actor.data.speed = Math.min(
    actor.data.maxSpeed,
    Math.max(actor.data.reverseMaxSpeed, actor.data.speed)
  );
};

export const movePlayer = (actor, delta) => {
  // this is wrong for space
  actor.data.direction = actor.data.rotation;

  updateActorPosition(actor, delta);
};
