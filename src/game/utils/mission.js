import { times, unnest } from 'ramda';
import { getRandomInt } from './random';

export const ORDER = {
  PATROL: 'PATROL',
  ATTACK: 'ATTACK',
};

export const getRandomPoints = (num = 2) =>
  times(() => ({
    x: getRandomInt(-1000, 1000),
    y: getRandomInt(-1000, 1000),
  }))(num);

export const getOrder = ({ type = ORDER.PATROL, points = getRandomPoints() }) => {
  return {
    type,
    points,
    currentPointIndex: 0,
  };
};

export function generateMission({
  key,
  description = '',
  allowedTimeMs,
  objectives = {},
  player,
  actors = [],
  randomActors = [],
  passive = [],
  randomPassive = [],
}) {
  return {
    key,
    allowedTimeMs,
    description,
    objectives,
    player,
    actors: [
      ...actors,
      ...unnest(
        randomActors.map((data) =>
          times(() => ({
            ai: true,
            x: getRandomInt(-2000, 2000),
            y: getRandomInt(-2000, 2000),
            ...data,
          }))(data.count || 1)
        )
      ),
    ],
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
