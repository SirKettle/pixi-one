import { path, pathOr, pick, uniq } from 'ramda';
import { AUDIO_RANGE_PX } from '../../utils/audio';
import {
  combineVelocity,
  getCollisionNorm,
  getCollisionSpeed,
  getDirection,
  getVelocity,
  relativeVelocity,
} from '../../utils/physics';
import { getActorByUid, getAllActors, getPrecisionHitCircles } from '../../utils/actor';
import { playSound } from '../../sound';
import { getAsset } from '../../utils/assetStore';
import { addExplosion } from '../../utils/particle';

export const circleIntersect = (c1, c2) => {
  // Calculate the distance between the two circles
  const squareDistance = (c1.x - c2.x) * (c1.x - c2.x) + (c1.y - c2.y) * (c1.y - c2.y);

  // When the distance is smaller or equal to the sum
  // of the two radius, the circles touch or overlap
  return squareDistance <= (c1.radius + c2.radius) * (c1.radius + c2.radius);
};

function getActorBasicCircle(actor) {
  return {
    x: actor.data.x,
    y: actor.data.y,
    radius: actor.performance.radiusPx,
  };
}

export function isSpriteCircleIntersect(actor1, actor2) {
  return circleIntersect(getActorBasicCircle(actor1), getActorBasicCircle(actor2));
}

export function getCollisionCircles(actor1, actor2) {
  const actor1BasicCircle = getActorBasicCircle(actor1);
  const actor2BasicCircle = getActorBasicCircle(actor2);
  const actor1HasPrecision = actor1.performance.precisionHitAreas.length > 0;
  const actor2HasPrecision = actor2.performance.precisionHitAreas.length > 0;

  if (!actor1HasPrecision && !actor2HasPrecision) {
    return [actor1BasicCircle, actor2BasicCircle];
  }

  const a1Circles = actor1HasPrecision ? getPrecisionHitCircles(actor1) : [actor1BasicCircle];
  const a2Circles = actor2HasPrecision ? getPrecisionHitCircles(actor2) : [actor2BasicCircle];

  let intersectingCircles = false;

  let i;
  const a1CirclesCount = a1Circles.length;
  for (i = 0; i < a1CirclesCount; i++) {
    const a1Circle = a1Circles[i];
    const shouldBreak = a2Circles.some((a2Circle) => {
      const isCollision = circleIntersect(a1Circle, a2Circle);
      if (isCollision) {
        intersectingCircles = [a1Circle, a2Circle];
      }
      return isCollision;
    });
    if (shouldBreak) {
      break;
    }
  }

  return intersectingCircles;
}

export function isCollision(actor1, actor2) {
  if (actor1.uid === actor2.uid) {
    return false;
  }
  if (
    actor1.data.noCollisionWith === actor2.uid ||
    actor2.data.noCollisionWith === actor1.uid
    // pathEq(['data', 'noCollisionWith'], actor2.uid)(actor1) ||
    // pathEq(['data', 'noCollisionWith'], actor1.uid)(actor2)
  ) {
    return false;
  }
  // todo: if all is true here - grinds to a halt!
  // return false;
  const isBasicCollision = isSpriteCircleIntersect(actor1, actor2);

  // const a1Specs = getSpecs(actor1.assetKey);
  // const a2Specs = getSpecs(actor2.assetKey);
  //
  // const isBasicCollision = circleIntersect(
  //   {
  //     x: actor1.data.x,
  //     y: actor1.data.y,
  //     radius: 32,
  //   },
  //   {
  //     x: actor2.data.x,
  //     y: actor2.data.y,
  //     radius: 32,
  //   }
  // );

  if (isBasicCollision) {
    // return true;
    return !!getCollisionCircles(actor1, actor2);
  }

  return false;
}

export function getActorDamage({ data }, speed) {
  const damage = (Math.max(1, speed) * (data.power || data.mass)) / 20;
  const adj = data.isBullet ? Math.min(1, data.life) * damage : damage;
  return Math.max(0, adj);
}

// const collisionPairs = (actors) =>
//   actors
//     .map((actor) =>
//       actors
//         .filter((actorB) => isCollision(actor, actorB))
//         .map((actorB) => [actor.uid, actorB.uid].sort())
//     )
//     .filter((pairs) => pairs.length > 0);
//
// export const getUniqCollisionPairs = compose(uniq, unnest, collisionPairs);

function getUniqCollisionPairs(actors) {
  const pairs = [];
  let i, j;
  const actorsCount = actors.length;
  for (i = 0; i < actorsCount; i++) {
    const actorA = actors[i];
    for (j = 0; j < actorsCount; j++) {
      const actorB = actors[j];
      if (isCollision(actorA, actorB)) {
        const pair = [actorA.uid, actorB.uid].sort();
        pairs.push(pair);
      }
    }
  }

  return uniq(pairs);
}

export function handleCollisions(game) {
  const allActors = getAllActors(game);
  const uniqCollisionPairs = getUniqCollisionPairs(allActors);
  // return;

  if (uniqCollisionPairs.length) {
    uniqCollisionPairs.forEach(([aUid, bUid]) => {
      const actorA = getActorByUid(game)(aUid);
      const actorB = getActorByUid(game)(bUid);

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

      const collisionSpeed = getCollisionSpeed(vCollisionNorm, vRelativeVelocity);

      if (collisionSpeed <= 0) {
        // moving apart - so no action needed
        return;
      }

      const actorAMass = pathOr(1, ['data', 'mass'])(actorA);
      const actorBMass = pathOr(1, ['data', 'mass'])(actorB);
      const impulse = (2 * collisionSpeed) / (actorAMass + actorBMass);

      // update actor velocities
      actorA.data.velocity.x -= impulse * actorBMass * vCollisionNorm.x;
      actorA.data.velocity.y -= impulse * actorBMass * vCollisionNorm.y;
      actorB.data.velocity.x += impulse * actorAMass * vCollisionNorm.x;
      actorB.data.velocity.y += impulse * actorAMass * vCollisionNorm.y;

      const actorADamage = getActorDamage(actorA, collisionSpeed);
      const actorBDamage = getActorDamage(actorB, collisionSpeed);

      actorA.data.life -= actorBDamage;
      actorB.data.life -= actorADamage;

      const distanceFromCenter =
        typeof actorA.data.distanceFromCenter === 'number'
          ? actorA.data.distanceFromCenter
          : actorB.data.distanceFromCenter;

      // two bullets colliding will have no distanceFromCenter
      if (typeof distanceFromCenter === 'number' && distanceFromCenter < AUDIO_RANGE_PX) {
        const isOneActorBullet = actorA.data.isBullet || actorB.data.isBullet;

        const damageTotal = isOneActorBullet
          ? actorA.data.isBullet
            ? actorADamage
            : actorBDamage
          : actorADamage + actorBDamage;

        const damageVol = damageTotal / 100;
        const vol = (damageVol * (AUDIO_RANGE_PX - distanceFromCenter)) / AUDIO_RANGE_PX;
        playSound(damageVol > 1 ? 'bigLaserHit' : 'explosion', vol);

        const direction = getDirection(actorACircle, actorBCircle);
        const startVelocity = getVelocity({ speed: actorACircle.radius, direction });
        const position = combineVelocity(startVelocity, actorACircle);

        addExplosion({
          container: getAsset(game.containers.worldNear),
          scale: damageVol,
          x: position.x,
          y: position.y,
        });
      }
    });
  }
}
