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
import {
  getActorByUid,
  getAllActorsMap,
  getPrecisionHitCircles,
  getShouldUpdate,
  getUpdateFrequency,
} from '../../utils/actor';
import { count, dashLog } from '../../utils/dash';
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
    // count('dogdy check');
    return false;
  }
  if (actor1.data.noCollisionWith === actor2.uid || actor2.data.noCollisionWith === actor1.uid) {
    return false;
  }
  // todo: if all is true here - grinds to a halt!
  const isBasicCollision = isSpriteCircleIntersect(actor1, actor2);

  if (isBasicCollision) {
    return !!getCollisionCircles(actor1, actor2);
  }

  return false;
}

export function getActorDamage({ data }, speed) {
  const damage = (Math.max(1, speed) * (data.power || data.mass)) / 20;
  const adj = data.isBullet ? Math.min(1, data.life) * damage : damage;
  return Math.max(0, adj);
}


// function getChunkArePairs(game) {
//   return function(chunkArea) {
//     const pairs = [];

//     function checkIsCollision(aUid){
//       return function (bUid){
//         const actorA = game.actorMap[aUid] || game.bulletMap[aUid] || (game.player.uid === aUid ? game.player : undefined);
//         const actorB = game.actorMap[bUid] || game.bulletMap[bUid] || (game.player.uid === bUid ? game.player : undefined);
//         if (isCollision(actorA, actorB)) {
//           const pair = [aUid, bUid].sort();
//           pairs.push(pair);
//         }
//       }
//     }

//     function checkCollisionForUid(aUid, i) {
//       // const updateFrequency = getUpdateFrequency(actorA.data.distanceFromCenter, 'collision');
//       // const shouldCheckCollisions = getShouldUpdate(game, i, updateFrequency);

//       // if (shouldCheckCollisions) {
//       chunkArea.uids.slice(i + 1).forEach(checkIsCollision(aUid));

//     }

//     chunkArea.uids.forEach(checkCollisionForUid);

//     return pairs;
//   }
// }

// function getUniqCollisionPairs(game) {
//   console.time('getUniqCollisionPairs')
//   const pairs = Object.values(game.expandedChunkAreas)
//   .flatMap(getChunkArePairs(game));
//   console.timeEnd('getUniqCollisionPairs')
//   return uniq(pairs);
// }



export function getUniqCollisionPairsB(game) {
  // console.time('B - getUniqCollisionPairs')
  const pairs = [];
  const chunkAreas = Object.values(game.expandedChunkAreas);
  for (let ci = 0; ci < chunkAreas.length; ++ci) {
    const chunkUids = chunkAreas[ci].uids;
    for (let i = 0; i < chunkUids.length; ++i) {
      const aUid = chunkUids[i];
      const actorA = game.actorMap[aUid] || game.bulletMap[aUid] || (game.player.uid === aUid ? game.player : undefined);
      if (actorA) {
        for (let j = i + 1; j < chunkUids.length; ++j) {
          const bUid = chunkUids[j];
          const actorB = game.actorMap[bUid] || game.bulletMap[bUid] || (game.player.uid === bUid ? game.player : undefined);
          count('Collision check');
          if (actorB && isCollision(actorA, actorB)) {
            const pair = [aUid, bUid].sort();
            pairs.push(pair);
          }
        }
      }
    }
  }
  // console.timeEnd('B - getUniqCollisionPairs')
  return uniq(pairs);
}

export function getUniqCollisionPairsC(game) {
  // console.time('C - getUniqCollisionPairs')
  const pairs = [];
  const actorKeys = Object.keys(game.actorMap).concat(Object.keys(game.bulletMap), game.player.uid);
  
  for (let i = 0; i < actorKeys.length; ++i) {
    const aUid = actorKeys[i];
    const actorA = game.actorMap[aUid] || game.bulletMap[aUid] || (game.player.uid === aUid ? game.player : undefined);
    if (actorA) {
      for (let j = i + 1; j < actorKeys.length; ++j) {
        const bUid = actorKeys[j];
        const actorB = game.actorMap[bUid] || game.bulletMap[bUid] || (game.player.uid === bUid ? game.player : undefined);
        count('Collision check');
        if (actorB && isCollision(actorA, actorB)) {
          const pair = [aUid, bUid].sort();
          pairs.push(pair);
        }
      }
    }
  }
  // console.timeEnd('C - getUniqCollisionPairs')
  return uniq(pairs);
}

export function handleCollisions(game, collisionMode = 'simple') {

  const chunkAreaCount = Object.keys(game.expandedChunkAreas).length;
  // console.log('chunk areas', chunkAreaCount);
  dashLog('Collision mode', collisionMode);
  // const actorKeys = Object.keys(game.actorMap).concat(Object.keys(game.bulletMap), game.player.uid);
  // const uniqCollisionPairs = chunkAreaCount > 55 && actorKeys.length > 150
  const uniqCollisionPairs = collisionMode === 'spacial'
  ? getUniqCollisionPairsB(game)
  : getUniqCollisionPairsC(game);

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
