import { path, pathOr, prop, propEq, propOr, times, uniq } from 'ramda';
import { getRandomInt } from '../utils/random';

export const ORDER = {
  PATROL: 'PATROL',
  ATTACK: 'ATTACK',
};

export const getRandomPoints = (num = 2) =>
  times(() => ({
    x: getRandomInt(-1000, 1000),
    y: getRandomInt(-1000, 1000),
  }))(num);

export const getOrder = ({
  type = ORDER.PATROL,
  hostileTeams = ['good'],
  points = getRandomPoints(),
}) => {
  return {
    type,
    hostileTeams,
    points,
    currentPointIndex: 0,
  };
};

export const levels = [
  {
    key: 'space_1',
    time: {},
    tiles: [
      { data: { assetKey: 'starsOne', parallax: 0.1, alpha: 1 } },
      {
        data: {
          assetKey: 'starsOne',
          parallax: 0.125,
          alpha: 0.85,
          scale: 2,
        },
      },
      {
        data: {
          assetKey: 'starsOne',
          parallax: 0.5,
          alpha: 0.1,
          scale: 5,
        },
      },
      {
        data: {
          assetKey: 'starsOne',
          parallax: 1,
          alpha: 0.07,
          scale: 15,
        },
      },
      {
        data: {
          assetKey: 'starsOne',
          parallax: 1.5,
          alpha: 0.07,
          scale: 25,
        },
      },
      // {
      //   data: {
      //     assetKey: 'grid64',
      //     parallax: 0.5,
      //     alpha: 0.25,
      //     scale: 2,
      //   },
      // },
      // {
      //   data: {
      //     assetKey: 'grid128',
      //     parallax: 1,
      //     alpha: 0.6,
      //     scale: 3,
      //   },
      // },
    ],
    atmosphere: 0.05, // space 0 - solid 1?? maybe air would be 0.2, water 0.4??
    // atmosphere: 0.05, // space 0 - solid 1?? maybe air would be 0.2, water 0.4??
    missions: [
      {
        key: 'm1',
        allowedTimeMs: 60 * 1000,
        description: 'Destroy all targets!',
        isComplete: (game) => game.actors.length === 0,
        isFail: (game) => isPlayerDead(game) || isTimeUp(game),
        actors: [
          // {
          //   assetKey: 'planetGreen',
          //   x: 100,
          //   y: 25,
          //   rotationSpeed: -0.01,
          //   velocity: {
          //     x: 1,
          //     y: 2,
          //   },
          // },
          // {
          //   assetKey: 'planetSandy',
          //   x: 25,
          //   y: 300,
          //   rotationSpeed: 0.025,
          // },
          // {
          //   team: 'bad',
          //   assetKey: 'tCraft',
          //   ai: true,
          //   x: 725,
          //   y: 800,
          //   velocity: {
          //     x: -1,
          //     y: -1,
          //   },
          // },
          // {
          //   team: 'bad',
          //   assetKey: 'spacecraft',
          //   ai: true,
          //   x: 100,
          //   y: 100,
          //   rotationSpeed: 0.025,
          //   velocity: {
          //     x: -1,
          //     y: -1,
          //   },
          // },
          // {
          //   team: 'bad',
          //   assetKey: 'tCraft',
          //   ai: true,
          //   x: 600,
          //   y: 800,
          //   velocity: {
          //     x: -1.2,
          //     y: -1,
          //   },
          // },
          {
            team: 'bad',
            assetKey: 'starDestroyer',
            // assetKey: 'tCraft',
            ai: true,
            x: 1000,
            y: 1000,
            life: 1000,
            velocity: {
              x: -1,
              y: -1.5,
            },
            currentOrder: getOrder({
              type: ORDER.PATROL,
              points: [
                { x: 800, y: 600 },
                { x: 50, y: 400 },
                { x: 450, y: 50 },
              ],
            }),
          },
          {
            team: 'good',
            assetKey: 'tantiveIV',
            // assetKey: 'tCraft',
            ai: true,
            x: 0,
            y: 0,
            life: 1000,
            velocity: {
              x: -1,
              y: -1.5,
            },
            currentOrder: getOrder({
              type: ORDER.PATROL,
              hostileTeams: ['bad'],
              points: [
                { x: 100, y: 600 },
                { x: 750, y: 400 },
                { x: 450, y: 200 },
              ],
            }),
          },
        ].concat(
          times(() => ({
            team: 'bad',
            assetKey: 'tCraft',
            ai: true,
            x: getRandomInt(-2000, 2000),
            y: getRandomInt(-2000, 2000),
            velocity: {
              x: -1.2,
              y: -1,
            },
          }))(getRandomInt(15, 20)),
          times(() => ({
            team: 'good',
            assetKey: 'spacecraft',
            ai: true,
            x: getRandomInt(-2000, 2000),
            y: getRandomInt(-2000, 2000),
            velocity: {
              x: -1.2,
              y: -1,
            },
          }))(getRandomInt(10, 12)),
          times(() => ({
            team: 'good',
            assetKey: 'xWing',
            ai: true,
            x: getRandomInt(-2000, 2000),
            y: getRandomInt(-2000, 2000),
            currentOrder: getOrder({
              type: ORDER.PATROL,
              hostileTeams: ['bad'],
              points: [
                { x: 100, y: 600 },
                { x: 750, y: 400 },
                { x: 450, y: 200 },
              ],
            }),
          }))(getRandomInt(12, 20))
        ),
        passiveActors: [
          {
            assetKey: 'starSun',
            x: 150,
            y: 500,
            alpha: 0.85,
          },
        ],
      },
      {
        key: 'm2',
        allowedTimeMs: 90 * 1000,
        description: 'Survive until the backup arrives!',
        isComplete: (game) => isTimeUp(game),
        isFail: (game) => isPlayerDead(game),
        passiveActors: [
          {
            assetKey: 'starSun',
            x: 150,
            y: 250,
            direction: Math.PI * 0.3,
            alpha: 0.85,
          },
        ],
      },
    ],
  },
];

export function getMissionAssetKeys(levelKey, missionKey) {
  const mission = getMission(levelKey, missionKey);
  return uniq(
    propOr([], 'actors')(mission)
      .concat(propOr([], 'passiveActors')(mission))
      .map(prop('assetKey'))
  );
}

export function getTileAssetKeys(key) {
  const level = getLevel(key);
  return uniq(propOr([], 'tiles')(level).map(path(['data', 'assetKey'])));
}

function isPlayerDead(game) {
  return pathOr(1, ['player', 'data', 'life'])(game) <= 0;
}
function isTimeUp(game) {
  const mission = getMission(game.level.key, game.level.missionKey);
  return (
    pathOr(1, ['time', 'mission', 'elapsedMs'])(game) >= mission.allowedTimeMs
  );
}

export function getLevel(key) {
  return getLevels().find(propEq('key', key));
}

export function getMission(levelKey, missionKey) {
  const level = getLevel(levelKey);
  return propOr([], 'missions')(level).find(propEq('key', missionKey));
}

export function getLevels() {
  return levels;
}
