import { getAsset } from '../store/pixiAssets';
import { compose, path, propEq, uniq, unnest } from 'ramda';
import { getSpecs } from '../specs/getSpecs';
import { getRelativeVelocity, getVelocity } from '../utils/physics';
import { getActorByUid } from './actor';

export const getActorRadius = ({ assetKey, spriteId }) => {
  const specs = getSpecs(assetKey);
  return getSpriteRadius(
    getAsset(spriteId),
    path(['hitArea', 'basic', 'radius'])(specs)
  );
};

export const getSpriteRadius = (sprite, percentage = 0.5) =>
  Math.max(sprite.width, sprite.height) * percentage;

export const circleIntersect = (x1, y1, r1, x2, y2, r2) => {
  // Calculate the distance between the two circles
  const squareDistance = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);

  // When the distance is smaller or equal to the sum
  // of the two radius, the circles touch or overlap
  return squareDistance <= (r1 + r2) * (r1 + r2);
};

export const isSpriteCircleIntersect = (actor1, actor2) => {
  return circleIntersect(
    actor1.data.x,
    actor1.data.y,
    getActorRadius(actor1),
    // getSpriteRadius(getAsset(actor1.spriteId)),
    actor2.data.x,
    actor2.data.y,
    getActorRadius(actor2)
    // getSpriteRadius(getAsset(actor2.spriteId))
  );
};

export const isCollision = (actor1, actor2) => {
  if (actor1.uid === actor2.uid) {
    return false;
  }
  return isSpriteCircleIntersect(actor1, actor2);
};

export const getActorDamage = ({ data }) => {
  if (data.isBullet) {
    return Math.min(1, data.life) * data.power;
  }

  return data.power || data.mass;
};

const collisionPairs = (actors) =>
  actors
    .map((actor) =>
      actors
        .filter((actorB) => isCollision(actor, actorB))
        .map((actorB) => [actor.uid, actorB.uid].sort())
    )
    .filter((pairs) => pairs.length > 0);

export const getUniqCollisionPairs = compose(uniq, unnest, collisionPairs);

export const handleCollisions = (pixiGame) => {
  pixiGame.bullets.forEach((bullet) => {
    pixiGame.actors.forEach((actor) => {
      if (!bullet.data.collisionBlacklist.includes(actor.uid)) {
        const collision = isCollision(bullet, actor);
        if (collision) {
          bullet.data.collisionBlacklist.push(actor.uid); // only hit once
          actor.data.life -= getActorDamage(bullet);
          bullet.data.life -= getActorDamage(actor);
          console.log('hit', getActorDamage(bullet), actor.data.life);
        }
      }
    });
  });
  // const collisionPairs = getUniqCollisionPairs(
  //   pixiGame.actors.concat([pixiGame.player])
  // );
  //
  // if (collisionPairs.length) {
  //   collisionPairs.forEach(([aUid, bUid]) => {
  //     const actorA = getActorByUid(pixiGame, aUid);
  //     const actorB = getActorByUid(pixiGame, bUid);
  //
  //     const vCollision = {
  //       x: actorA.data.x - actorB.data.x,
  //       y: actorA.data.y - actorB.data.y,
  //     };
  //     const distance = Math.hypot(vCollision.x, vCollision.y);
  //     const vCollisionNorm = {
  //       x: vCollision.x / distance,
  //       y: vCollision.y / distance,
  //     };
  //     const vRelativeVelocity = {
  //       x:
  //         path(['data', 'velocity', 'x'])(actorA) +
  //         path(['data', 'velocity', 'x'])(actorB),
  //       y:
  //         path(['data', 'velocity', 'y'])(actorA) +
  //         path(['data', 'velocity', 'y'])(actorB),
  //     };
  //     // const vRelativeVelocity = getRelativeVelocity(
  //     //   path(['data', 'velocity'])(actorA),
  //     //   path(['data', 'velocity'])(actorB)
  //     // );
  //     const speed =
  //       vRelativeVelocity.x * vCollisionNorm.x +
  //       vRelativeVelocity.y * vCollisionNorm.y;
  //
  //     if (speed < 0) {
  //       return;
  //     }
  //     debugger;
  //
  //     actorA.data.velocity.x -= speed * vCollisionNorm.x;
  //     actorA.data.velocity.y -= speed * vCollisionNorm.y;
  //     actorB.data.velocity.x = speed * vCollisionNorm.x;
  //     actorB.data.velocity.y -= speed * vCollisionNorm.y;
  //
  //     // const relV = getRelativeVelocity(
  //     //   path(['data', 'velocity'])(actorA),
  //     //   path(['data', 'velocity'])(actorB)
  //     // );
  //
  //     console.log(
  //       `${actorA.uid}: collision detected with ${actorB.uid}`
  //       // path(['data', 'velocity'])(actorA),
  //       // path(['data', 'velocity'])(actorB),
  //       // relV
  //     );
  //
  //     // debugger;
  //   });
  // }
};
