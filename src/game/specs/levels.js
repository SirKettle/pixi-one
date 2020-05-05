import { path, pathOr, propEq, propOr, uniq } from 'ramda';

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
    atmosphere: 0, // space 0 - solid 1?? maybe air would be 0.2, water 0.4??
    missions: [
      {
        key: 'm1',
        allowedTimeMs: 60 * 1000,
        description: 'Destroy all targets!',
        isComplete: (game) => game.actors.length === 0,
        isFail: (game) => isPlayerDead(game) || isTimeUp(game),
        actors: [
          {
            assetKey: 'planetGreen',
            x: 100,
            y: 25,
            rotationSpeed: -0.01,
            velocity: {
              x: 1,
              y: 2,
            },
            life: 5,
          },
          {
            assetKey: 'planetSandy',
            x: 25,
            y: 300,
            rotationSpeed: 0.025,
            life: 15,
          },
          {
            assetKey: 'starSun',
            x: 150,
            y: 500,
            alpha: 0.85,
          },
        ],
        passiveActors: [],
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
