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
    actor.data.currentOrder = getOrder(pathOr({}, ['data', 'order'])(actor));
  }
  const specs = getSpecs(actor.assetKey);

  const potentialTargets = getAllActorsInTeams(game, path(['data', 'hostileTeams'])(actor));

  const sortedPotentialTargets = potentialTargets.sort(sortByNearest(actor));
  const nearestTarget = sortedPotentialTargets[0];

  const orderType = path(['data', 'currentOrder', 'type'])(actor);

  switch (orderType) {
    case ORDER.PATROL: {
      updatePatrol({
        game,
        actor,
        nearestTarget,
        specs,
        delta,
        deltaMs,
      });
      return;
    }
    case ORDER.ATTACK: {
      updateAttack({
        game,
        actor,
        nearestTarget,
        specs,
        delta,
        deltaMs,
      });
      return;
    }
  }
}

function updateAttack({ game, actor, specs, delta, deltaMs, nearestTarget }) {
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
  // console.log('switch order to patrol', actor.uid);
  actor.data.currentOrder.type = ORDER.PATROL;
}

function updatePatrol({ game, actor, specs, delta, deltaMs, nearestTarget }) {
  const { points, currentPointIndex } = actor.data.currentOrder;

  const wayPoint = points[currentPointIndex];

  if (nearestTarget) {
    const targetInfo = getTargetInfo(actor, nearestTarget.data);
    if (
      targetInfo.inRadarRange
      // && actor.assetKey !== 'tCraft'
    ) {
      //  attack player or maybe follow player then attack?

      actor.data.currentOrder.type = ORDER.ATTACK;
      // console.log('switch order to Attack', actor.uid);
      return;
    }
  }

  // move to wayPoint
  // console.log('move to wayPoint');
  const wayPointTargetInfo = getTargetInfo(actor, wayPoint);
  moveTowards(actor, wayPoint, wayPointTargetInfo, specs, delta);

  if (wayPointTargetInfo.inCloseRange) {
    actor.data.currentOrder.currentPointIndex += 1;
    if (!actor.data.currentOrder.points[actor.data.currentOrder.currentPointIndex]) {
      actor.data.currentOrder.currentPointIndex = 0;
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

function moveTowards(actor, vTarget, targetInfo, specs, delta) {
  turnTowards(actor, vTarget, specs, delta);

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
