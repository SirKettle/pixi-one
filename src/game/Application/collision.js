import { compose, path, pathOr, pick, uniq, unnest } from 'ramda';
import {
  getCollisionNorm,
  getCollisionSpeed,
  relativeVelocity,
} from '../utils/physics';
import {
  getActorByUid,
  getActorRadius,
  getAllActors,
  getPrecisionHitCircles,
} from '../utils/actor';
import { getAsset } from '../store/pixiAssets';
import { drawCircle } from '../utils/graphics';
import { getSpecs } from '../specs/getSpecs';

export const circleIntersect = (c1, c2) => {
  // Calculate the distance between the two circles
  const squareDistance =
    (c1.x - c2.x) * (c1.x - c2.x) + (c1.y - c2.y) * (c1.y - c2.y);

  // When the distance is smaller or equal to the sum
  // of the two radius, the circles touch or overlap
  return squareDistance <= (c1.radius + c2.radius) * (c1.radius + c2.radius);
};

const getActorBasicCircle = (actor) => ({
  x: path(['data', 'x'])(actor),
  y: path(['data', 'y'])(actor),
  radius: getActorRadius(actor),
});

export const isSpriteCircleIntersect = (actor1, actor2) => {
  return circleIntersect(
    getActorBasicCircle(actor1),
    getActorBasicCircle(actor2)
  );
};

export const getCollisionCircles = (actor1, actor2) => {
  const actor1HitCircles = getPrecisionHitCircles(actor1);
  const actor2HitCircles = getPrecisionHitCircles(actor2);
  const actor1HasPrecision = actor1HitCircles.length > 0;
  const actor2HasPrecision = actor2HitCircles.length > 0;
  const actor1BasicCircle = getActorBasicCircle(actor1);
  const actor2BasicCircle = getActorBasicCircle(actor2);

  if (!actor1HasPrecision && !actor2HasPrecision) {
    return [actor1BasicCircle, actor2BasicCircle];
  }

  const a1Circles = actor1HasPrecision ? actor1HitCircles : [actor1BasicCircle];
  const a2Circles = actor2HasPrecision ? actor2HitCircles : [actor2BasicCircle];

  let intersectingCircles = false;
  a1Circles.forEach((a1Circle) => {
    a2Circles.forEach((a2Circle) => {
      if (circleIntersect(a1Circle, a2Circle)) {
        intersectingCircles = [a1Circle, a2Circle];
      }
    });
  });

  return intersectingCircles;
  // return a1Circles.some((a1Circle) =>
  //   a2Circles.some((a2Circle) => circleIntersect(a1Circle, a2Circle))
  // );
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
  const isBasicCollision = isSpriteCircleIntersect(actor1, actor2);

  if (isBasicCollision) {
    return !!getCollisionCircles(actor1, actor2);
  }

  return false;
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

      const [actorACircle, actorBCircle] = getCollisionCircles(actorA, actorB);

      const vCollisionNorm = getCollisionNorm(
        pick(['x', 'y'])(actorACircle),
        pick(['x', 'y'])(actorBCircle)
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

      // console.log(`${actorA.uid}: collision detected with ${actorB.uid}`);

      const actorAMass = pathOr(1, ['data', 'mass'])(actorA);
      const actorBMass = pathOr(1, ['data', 'mass'])(actorB);
      const impulse = (2 * collisionSpeed) / (actorAMass + actorBMass);

      // update actor velocities
      actorA.data.velocity.x -= impulse * actorBMass * vCollisionNorm.x;
      actorA.data.velocity.y -= impulse * actorBMass * vCollisionNorm.y;
      actorB.data.velocity.x += impulse * actorAMass * vCollisionNorm.x;
      actorB.data.velocity.y += impulse * actorAMass * vCollisionNorm.y;

      // console.log('BEFORE', actorA.data.assetKey, actorA.data.life);
      // console.log('BEFORE', actorB.data.assetKey, actorB.data.life);

      const actorADamage = getActorDamage(actorA, collisionSpeed);
      const actorBDamage = getActorDamage(actorB, collisionSpeed);

      actorA.data.life -= actorBDamage;
      actorB.data.life -= actorADamage;
      //
      // console.log(
      //   'AFTER',
      //   actorA.data.assetKey,
      //   actorA.data.life,
      //   actorBDamage
      // );
      // console.log(
      //   'AFTER',
      //   actorB.data.assetKey,
      //   actorB.data.life,
      //   actorADamage
      // );
    });
  }
};
