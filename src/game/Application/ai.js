import { path, pathOr } from 'ramda';
import { getAllActorsInTeams, sortByNearest } from '../utils/actor';
import {
  getDirection,
  getDistance,
  normalizeDirection,
} from '../utils/physics';
import { getAsset } from '../store/pixiAssets';
import { generateBulletData } from '../specs/bullets';
import { applyThrusters, createActor } from './actor';
import { doEveryMs, getRandomInt } from '../utils/random';

const ORDER = {
  PATROL: 'PATROL',
};

const getOrder = (type = ORDER.PATROL) => {
  if (type === ORDER.PATROL) {
    return {
      type: ORDER.PATROL,
      hostileTeams: ['good'],
      points: [
        { x: getRandomInt(-1000, 1000), y: getRandomInt(-1000, 1000) },
        { x: getRandomInt(-1000, 1000), y: getRandomInt(-1000, 1000) },
      ],
      currentPointIndex: 0,
    };
  }
  return;
};

const fire = (pixiGame, host) => () => {
  const newBullet = createActor(getAsset(pixiGame.containers.world))(
    generateBulletData({
      host,
      hostFirePower: pathOr(0.5, ['data', 'firePower'])(host),
    })
  );
  pixiGame.bullets.push(newBullet);
};

export function updateActorAi(pixiGame, actor, delta, deltaMs) {
  if (!path(['data', 'currentOrder'])(actor)) {
    actor.data.currentOrder = getOrder();
  }
  const currentOrder = path(['data', 'currentOrder'])(actor);

  const { type, hostileTeams, points, currentPointIndex } = currentOrder;

  if (type === ORDER.PATROL) {
    const wayPoint = points[currentPointIndex];
    const potentialTargets = getAllActorsInTeams(pixiGame, hostileTeams);

    const sortedPotentialTargets = potentialTargets.sort(sortByNearest(actor));
    const nearestTarget = sortedPotentialTargets[0];

    const targetInfo = getTargetInfo(actor, nearestTarget.data);

    if (targetInfo.inRange) {
      //  attack player or maybe follow player then attack?

      if (targetInfo.inFiringRange) {
        doEveryMs(fire(pixiGame, actor), deltaMs, 1000);
        turnTowards(actor, nearestTarget.data, delta);
      } else {
        // console.log('targetInRange', targetInfo.distance);
        moveTowards(actor, nearestTarget.data, targetInfo, delta);
      }
    } else {
      // move to wayPoint
      // console.log('move to wayPoint');
      moveTowards(actor, wayPoint, getTargetInfo(actor, wayPoint), delta);
    }
  }
}

function shouldTurnLeft(rotationChange) {
  if (rotationChange < 0) {
    return rotationChange < -Math.PI ? false : true;
  }
  if (rotationChange > Math.PI) {
    return true;
  }
  return false;
}

function turnTowards(actor, vTarget, delta) {
  const sprite = getAsset(actor.spriteId);
  const targetDirection = getDirection(actor.data, vTarget);
  const rotationChange = targetDirection - actor.data.rotation;
  const turnBy = Math.min(1, Math.abs(rotationChange));
  const turningLeft = shouldTurnLeft(rotationChange);
  const adjTurnBy = turningLeft ? -turnBy : turnBy;

  actor.data.rotation = normalizeDirection(
    actor.data.rotation + adjTurnBy * delta * 0.1
  );
  sprite.rotation = actor.data.rotation;
}

function moveTowards(actor, vTarget, targetInfo, delta) {
  turnTowards(actor, vTarget, delta);
  const { currentOrder } = actor.data;

  applyThrusters({
    actor,
    delta,
    thrustDirection: 'forward',
    forward: 0.3,
  });

  // move to the main update? or split patrol and attack
  if (targetInfo.inFiringRange) {
    if (currentOrder.type === ORDER.PATROL) {
      currentOrder.currentPointIndex += 1;
      if (!currentOrder.points[currentOrder.currentPointIndex]) {
        currentOrder.currentPointIndex = 0;
      }
    }
  }
}

function getTargetInfo(actor, targetData) {
  const distance = targetData ? getDistance(actor.data, targetData) : undefined;

  return {
    inRange: distance ? distance < 500 : false,
    inFiringRange: distance ? distance < 300 : false,
    distance,
  };
}

// function patrol(pixiGame, actor, deltaMs)
