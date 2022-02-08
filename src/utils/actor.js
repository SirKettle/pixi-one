import { path, pathOr, propEq, filter } from 'ramda';
import { getAsset } from './assetStore';
import { getSpecs } from '../specs/getSpecs';
import { getDistance, getVelocity, relativeVelocity } from './physics';
import { drawCircle } from './graphics';

export const getActorByUid = ({ player, actorMap, bulletMap }) => (uid) => {
  if (player.uid === uid) {
    return player;
  }
  return actorMap[uid] || bulletMap[uid];
};

export const getActorRadius = ({ assetKey, spriteId }) => {
  const specs = getSpecs(assetKey);
  return getSpriteRadius(getAsset(spriteId), path(['hitArea', 'basic', 'radius'])(specs));
};

export const getSpriteRadius = (sprite, percentage = 0.5) =>
  Math.max(sprite.width, sprite.height) * percentage;

export const getArrayAsMap = (arr = [], key = 'uid') => {
  return arr.reduce((acc, item) => ({
    ...acc,
    [item[key]]: item
  }), {});
}

export const getAllActorsMap = (game) => {
  return {
    ...game.bulletMap,
    ...game.actorMap
  };
};

export const isActorInTeams = (teams = []) => (actor) => teams.includes(actor?.data?.team);

export const getAllActorsInTeams = (game, teams = []) => filter(isActorInTeams(teams))(game.actorMap);

export const sortByNearest = (actor) => (targetA, targetB) => {
  const dA = getDistance(actor.data, targetA.data);
  const dB = getDistance(actor.data, targetB.data);
  return dA > dB ? 1 : -1;
};

export function getPrecisionHitCircles(actor) {
  const { radiusPx, precisionHitAreas } = actor.performance;
  const size = radiusPx * 2;
  return precisionHitAreas.map((h) => {
    return {
      ...relativeVelocity(
        actor.data,
        getVelocity({ speed: h.y * size, direction: actor.data.rotation })
      ),
      radius: size * h.radius,
    };
  });
}

export const drawHitCircles = (game, actor) => {
  const graphic = getAsset(game.player.graphicId);

  drawCircle({
    graphic,
    x: actor.data.x,
    y: actor.data.y,
    radius: getActorRadius(actor),
    lineColor: 0xaa8855,
  });

  getPrecisionHitCircles(actor).forEach((c) => {
    drawCircle({
      ...c,
      graphic,
      lineColor: 0xaa5555,
    });
  });
};

// For performance, we do not want to check collisions or update the AI
// of all actors in every tick. Instead, we update objects more frequently
// based on how close they are to the camera/player
const updateRanges = {
  close: {
    range: 500,
    updateFrequency: {
      collision: 1,
      ai: 3,
    },
  },
  mid: {
    range: 900,
    updateFrequency: {
      collision: 5,
      ai: 10,
    },
  },
  far: {
    updateFrequency: {
      collision: 60,
      ai: 25,
    },
  },
};

export const getUpdateFrequency = (range, type = 'ai') => {
  if (range < pathOr(500, ['close', 'range'])(updateRanges)) {
    return pathOr(1, ['close', 'updateFrequency', type])(updateRanges);
  }
  if (range < pathOr(600, ['mid', 'range'])(updateRanges)) {
    return pathOr(1, ['mid', 'updateFrequency', type])(updateRanges);
  }
  return pathOr(1, ['far', 'updateFrequency', type])(updateRanges);
};

export const getShouldUpdate = (game, index, updateFrequency) =>
  (game.tickCount + index) % updateFrequency === 0;
