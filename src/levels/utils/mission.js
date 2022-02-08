import { omit, pathOr, propOr, times, unnest } from 'ramda';
import { v4 as generateUid } from 'uuid';
import { getRandomInt } from '../../utils/random';

export const ORDER = {
  PATROL: 'PATROL',
  ATTACK: 'ATTACK',
};

export const getRandomPoints = (num = 3) =>
  times(() => ({
    x: getRandomInt(-2500, 2500),
    y: getRandomInt(-2500, 2500),
  }))(num);

export const getOrder = ({ type = ORDER.PATROL, points = getRandomPoints() }) => {
  return {
    type,
    points,
    currentPointIndex: 0,
  };
};

export const adjustPoint = (data, i = 0) => {
  return {
    ...data,
    x: data.x + i * 100,
    y: data.y + i * 100,
  };
};

export function generateMission({
  key,
  description = '',
  allowedTimeMs,
  objectives = [],
  player,
  actors = [],
  actorGroups = [],
  randomActors = [],
  passive = [],
  randomPassive = [],
}) {

  const missionActors = [
    ...actors,
    ...unnest(
      randomActors.map((data) =>
        times(() => ({
          ai: true,
          x: getRandomInt(-2500, 2500),
          y: getRandomInt(-2500, 2500),
          ...data,
        }))(data.count || 1)
      )
    ),
    ...unnest(
      actorGroups.map((data) =>
        times(() => ({
          ai: true,
          x: getRandomInt(-2500, 2500),
          y: getRandomInt(-2500, 2500),
          ...omit(['count'])(data),
          order: {
            ...propOr({}, 'order')(data),
            points: pathOr([], ['order', 'points'])(data).map(adjustPoint),
          },
        }))(data.count || 1).map(adjustPoint)
      )
    ),
  ];

  const actorMap = missionActors.reduce((acc, a) => ({
    ...acc,
    [a.uid || generateUid()]: a
  }), {});

  return {
    key,
    allowedTimeMs,
    description,
    objectives,
    player,
    actorMap,
    passiveActors: [
      ...passive,
      ...unnest(
        randomPassive.map((data) =>
          times(() => ({
            x: getRandomInt(-2000, 2000),
            y: getRandomInt(-2000, 2000),
            ...data,
          }))(data.count || 1)
        )
      ),
    ],
  };
}
