import { compose, path, pathOr, pick, uniq, unnest } from 'ramda';
import {
  getCollisionNorm,
  getCollisionSpeed,
  relativeVelocity,
} from '../utils/physics';
import { getActorByUid, getActorRadius, getAllActors } from '../utils/actor';

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
    actor2.data.x,
    actor2.data.y,
    getActorRadius(actor2)
  );
};

export const isCollision = (actor1, actor2) => {
  if (actor1.uid === actor2.uid) {
    return false;
  }
  if (
    pathOr([], ['data', 'collisionBlacklist'])(actor1).includes(actor2.uid) ||
    pathOr([], ['data', 'collisionBlacklist'])(actor2).includes(actor1.uid)
  ) {
    return false;
  }
  return isSpriteCircleIntersect(actor1, actor2);
};

export const getActorDamage = ({ data }, speed) => {
  const damage = (speed * (data.power || data.mass)) / 20;
  return data.isBullet ? Math.min(1, data.life) * damage : damage;
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
  const allActors = getAllActors(pixiGame);
  const collisionPairs = getUniqCollisionPairs(allActors);

  if (collisionPairs.length) {
    collisionPairs.forEach(([aUid, bUid]) => {
      const actorA = getActorByUid(pixiGame)(aUid);
      const actorB = getActorByUid(pixiGame)(bUid);

      if (!actorA || !actorB) {
        return;
      }

      const vCollisionNorm = getCollisionNorm(
        pick(['x', 'y'])(actorA.data),
        pick(['x', 'y'])(actorB.data)
      );

      const vRelativeVelocity = relativeVelocity(
        path(['data', 'velocity'])(actorA),
        path(['data', 'velocity'])(actorB)
      );

      const collisionSpeed = getCollisionSpeed(
        vCollisionNorm,
        vRelativeVelocity
      );

      if (collisionSpeed <= 0) {
        // moving apart - so no action needed
        return;
      }

      console.log(`${actorA.uid}: collision detected with ${actorB.uid}`);

      const actorAMass = pathOr(1, ['data', 'mass'])(actorA);
      const actorBMass = pathOr(1, ['data', 'mass'])(actorB);
      const impulse = (2 * collisionSpeed) / (actorAMass + actorBMass);

      // update actor velocities
      actorA.data.velocity.x -= impulse * actorBMass * vCollisionNorm.x;
      actorA.data.velocity.y -= impulse * actorBMass * vCollisionNorm.y;
      actorB.data.velocity.x += impulse * actorAMass * vCollisionNorm.x;
      actorB.data.velocity.y += impulse * actorAMass * vCollisionNorm.y;

      console.log('BEFORE', actorA.data.assetKey, actorA.data.life);
      console.log('BEFORE', actorB.data.assetKey, actorB.data.life);

      const actorADamage = getActorDamage(actorA, collisionSpeed);
      const actorBDamage = getActorDamage(actorB, collisionSpeed);

      actorA.data.life -= actorBDamage;
      actorB.data.life -= actorADamage;

      console.log(
        'AFTER',
        actorA.data.assetKey,
        actorA.data.life,
        actorBDamage
      );
      console.log(
        'AFTER',
        actorB.data.assetKey,
        actorB.data.life,
        actorADamage
      );
    });
  }
};
