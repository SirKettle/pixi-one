import { path, pathOr, prop, propEq, propOr, times, uniq } from 'ramda';
import { generateMission, getOrder, ORDER } from '../utils/mission';
import { starsParallax } from '../utils/parallax';
import { getRandomInt } from '../utils/random';

const ms1 = generateMission({
  key: 'm1',
  description: 'Destroy all targets!',
  allowedTimeMs: 180 * 1000,
  player: {
    hostileTeams: ['bad'],
    team: 'good',
    assetKey: 'spacecraft',
    // hostileTeams: ['good'],
    // team: 'bad',
    // assetKey: 'tCraft',
  },
  objectives: {
    all: true,
  },
  actors: [
    {
      team: 'bad',
      assetKey: 'starDestroyer',
      hostileTeams: ['good'],
      ai: true,
      x: 1000,
      y: 1000,
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
      hostileTeams: ['bad'],
      ai: true,
      x: 0,
      y: 0,
      velocity: {
        x: -1,
        y: -1.5,
      },
      currentOrder: getOrder({
        type: ORDER.PATROL,
        points: [
          { x: -1100, y: 1600 },
          { x: 1750, y: 400 },
          { x: 450, y: -200 },
        ],
      }),
    },
  ],
  randomActors: [
    { team: 'bad', assetKey: 'tCraft', hostileTeams: ['good'], count: 50 },
    { team: 'good', assetKey: 'xWing', hostileTeams: ['bad'], count: 40 },
    { team: 'good', assetKey: 'spacecraft', hostileTeams: ['bad'], count: getRandomInt(6, 9) },
  ],
  randomPassive: [
    { assetKey: 'starSun', scale: 12, count: 2, rotationSpeed: -0.02 },
    { assetKey: 'planetSandy', scale: 5, count: 1, rotationSpeed: -0.02 },
    { assetKey: 'planetGreen', scale: 3, count: 3, rotationSpeed: -0.02 },
  ],
});

export const levels = [
  {
    key: 'space_1',
    description: `In a distant galaxy where space travel is the norm, yet in a time when sophisticated weapons have not been invented, pilots (ahem, no drones see) rely on shooting lasers at each other. 

In a micro galaxy, not so far away, where inter planetary travel is the norm...

Yet this is a time of war.

A mysterious dark force has emerged. Not the kind of dark force that leaks from your uncle’s bum hole after a roast dinner. No, a far more sinister force. 

A time when sophisticated weaponry has not been invented (I know, stay with me). Pilots, because no one has thought of using drones yet, rely on shooting shiny glowy things at each other called “lasers”. These nasty lasers can cause minor eye irritation and make you blink (like, a lot) if you’re not wearing sun glasses and also inexplicably blow up other space craft.`,
    time: {},
    tiles: starsParallax,
    // gravity: 0.04, // 0.04 Earth like gravity
    gravity: 0,
    // atmosphere: 0.01, // space 0 - solid 1?? maybe air would be 0.2, water 0.4??
    atmosphere: 0.05, // space 0 - solid 1?? maybe air would be 0.2, water 0.4??
    missions: [ms1],
  },
];

export function getMissionAssetKeys(levelKey, missionKey) {
  const mission = getMission(levelKey, missionKey);
  return uniq(
    propOr([], 'actors')(mission)
      .concat(propOr([], 'passiveActors')(mission))
      .concat(prop('player')(mission))
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
  const mission = getMission(game.levelKey, game.missionKey);
  return pathOr(1, ['time', 'mission', 'elapsedMs'])(game) >= mission.allowedTimeMs;
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
