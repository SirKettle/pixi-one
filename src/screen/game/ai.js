import { path, pathOr } from 'ramda';
import { getAllActorsInTeams, sortByNearest } from '../../utils/actor';
import { getDirection, getDistance, normalizeDirection } from '../../utils/physics';
import { getAsset } from '../../utils/assetStore';
import { generateBulletData } from '../../specs/bullets';
import { applyThrusters, createActor } from './actor';
import { doEveryMs } from '../../utils/random';
import { getSpecs } from '../../specs/getSpecs';
import { getOrder, ORDER } from '../../levels/utils/mission';
import { AUDIO_RANGE_PX } from '../../utils/audio';
import { playSound } from '../../sound';

const fire = (game, host) => () => {
  const hostFirePower = Math.max(0, Math.min(1, pathOr(0.5, ['data', 'firePower'])(host)));
  const newBullet = createActor(getAsset(game.containers.world))(
    generateBulletData({
      host,
      hostFirePower,
    })
  );

  if (host.data.distanceFromCenter < AUDIO_RANGE_PX) {
    const vol = (hostFirePower * (AUDIO_RANGE_PX - host.data.distanceFromCenter)) / AUDIO_RANGE_PX;
    playSound('laser', vol);
  }

  game.bullets.push(newBullet);
};

export function updateActorAi(game, actor, delta, deltaMs) {
  if (!path(['data', 'currentOrder'])(actor)) {
    actor.data.currentOrder = getOrder({});
  }
  const order = path(['data', 'currentOrder'])(actor);
  const specs = getSpecs(actor.assetKey);

  const { type } = order;
  const potentialTargets = getAllActorsInTeams(game, path(['data', 'hostileTeams'])(actor));

  //TODO: only go through this if on screen? Try turning off AI to see impact on performance?
  // if it does decrease, maybe only check some things periodically
  const sortedPotentialTargets = potentialTargets.sort(sortByNearest(actor));
  const nearestTarget = sortedPotentialTargets[0];

  if (type === ORDER.PATROL) {
    updatePatrol({
      game,
      actor,
      nearestTarget,
      order,
      specs,
      delta,
      deltaMs,
    });
  }

  if (type === ORDER.ATTACK) {
    updateAttack({
      game,
      actor,
      nearestTarget,
      order,
      specs,
      delta,
      deltaMs,
    });
  }
}

function updateAttack({ game, actor, order, specs, delta, deltaMs, nearestTarget }) {
  if (nearestTarget) {
    const targetInfo = getTargetInfo(actor, nearestTarget.data);

    if (targetInfo.inRadarRange) {
      if (targetInfo.inCloseRange) {
        doEveryMs(fire(game, actor), deltaMs, 1000);
        turnTowards(actor, nearestTarget.data, specs, delta);
      } else {
        moveTowards(actor, nearestTarget.data, targetInfo, specs, delta);
      }
      return;
    }
  }
  // console.log('switch order to patrol');
  order.type = ORDER.PATROL;
}

function updatePatrol({ game, actor, order, specs, delta, deltaMs, nearestTarget }) {
  const { points, currentPointIndex } = order;

  const wayPoint = points[currentPointIndex];

  if (nearestTarget) {
    const targetInfo = getTargetInfo(actor, nearestTarget.data);
    if (
      targetInfo.inRadarRange &&
      actor.assetKey !== 'starDestroyer'
      // && actor.assetKey !== 'tCraft'
    ) {
      //  attack player or maybe follow player then attack?

      order.type = ORDER.ATTACK;
      // console.log('switch order to Attack');
      return;
    }
  }

  // move to wayPoint
  // console.log('move to wayPoint');
  const wayPointTargetInfo = getTargetInfo(actor, wayPoint);
  moveTowards(actor, wayPoint, wayPointTargetInfo, specs, delta);

  // move to the main update? or split patrol and attack
  if (wayPointTargetInfo.inCloseRange) {
    if (order.type === ORDER.PATROL) {
      order.currentPointIndex += 1;
      if (!order.points[order.currentPointIndex]) {
        order.currentPointIndex = 0;
      }
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

function turnTowards(actor, vTarget, specs, delta) {
  const sprite = getAsset(actor.spriteId);
  const targetDirection = getDirection(actor.data, vTarget);
  const rotationChange = targetDirection - actor.data.rotation;
  const turnBy = Math.min(1, Math.abs(rotationChange) * pathOr(1, ['thrust', 'turn'])(specs));
  const turningLeft = shouldTurnLeft(rotationChange);
  const adjTurnBy = turningLeft ? -turnBy : turnBy;

  actor.data.rotation = normalizeDirection(actor.data.rotation + adjTurnBy * delta * 0.1);
  sprite.rotation = actor.data.rotation;
}

function moveTowards(actor, vTarget, targetInfo, specs, delta) {
  turnTowards(actor, vTarget, specs, delta);
  const { currentOrder } = actor.data;

  applyThrusters({
    actor,
    delta,
    thrustDirection: 'forward',
    forward: 0.75 * pathOr(0.1, ['thrust', 'forward'])(specs),
  });
}

function getTargetInfo(actor, targetData) {
  const distance = targetData ? getDistance(actor.data, targetData) : undefined;

  return {
    inRadarRange: distance ? distance < 500 : false,
    inCloseRange: distance ? distance < 300 : false,
    distance,
  };
}
