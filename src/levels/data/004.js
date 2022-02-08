import defaultLevel from '../utils/defaultLevel';
import { starsParallax } from '../../utils/parallax';
import { generateMission, getOrder, ORDER } from '../utils/mission';
import { getRandomInt } from '../../utils/random';
import { newObjectiveEvent, phoneMessageEvent, radioMessageEvent } from '../utils/events';
import {
  addObjective,
  createObjective,
  createWaypointObjective,
  OBJECTIVE_TYPE_ELIMINATE_ALL_HOSTILES,
} from '../utils/objective';
import { onCompleteLevel } from '../index';
import { playRadioMessage } from '../../sound';

const mission = generateMission({
  key: 'm1',
  description: 'Destroy all targets!',
  allowedTimeMs: 3660 * 1000,
  player: {
    hostileTeams: ['bad'],
    team: 'good',
    // assetKey: 'craftNcfc',
    assetKey: 'spacecraft',
    // hostileTeams: ['good'],
    // team: 'bad',
    // assetKey: 'tCraft',
  },
  objectives: [],
  actors: [
    {
      team: 'bad',
      assetKey: 'starDestroyer',
      hostileTeams: [],
      ai: true,
      x: 1000,
      y: 1000,
      order: getOrder({
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
      order: getOrder({
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

export default {
  ...defaultLevel,
  key: 'level004',
  title: 'Testing',
  description: 'A lot of space violence!',
  intro: [
    'Testing collision and avoidance capabilities',
    'Let’s do this...',
  ],
  time: {},
  tiles: starsParallax,
  gravity: 0,
  atmosphere: 0.05,
  mission,
  events: [
    newObjectiveEvent(
      () =>
        createObjective({
          type: OBJECTIVE_TYPE_ELIMINATE_ALL_HOSTILES,
          title: 'Kill or be killed!',
          description: 'Eliminate all hostile targets',
          onComplete: (game) => {
            setTimeout(() => playRadioMessage('message_we_did_it_kid_back_to_base'), 1500);
            addObjective(
              game,
              createWaypointObjective({
                title: 'Now back to HQ',
                description: 'Now time to return to base',
                waypoint: { position: { x: -3500, y: -500 }, radius: 150 },
                onComplete: (game) => {
                  setTimeout(() => onCompleteLevel(game), 2000);
                },
              })
            );
          },
        }),
      4000
    ),
  ],
  unlocksLevels: ['level003'],
  soundtrack: [
    'music-wiffy',
    //'transition-wiffy2aha',
    'music-aha',
  ],
};
