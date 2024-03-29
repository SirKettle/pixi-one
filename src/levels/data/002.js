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
import { playRadioMessage, queueSpeech } from '../../sound';

const mission = generateMission({
  key: 'm1',
  description: 'Destroy all targets!',
  allowedTimeMs: 180 * 1000,
  player: {
    hostileTeams: ['bad'],
    team: 'good',
    // assetKey: 'craftNcfc',
    assetKey: 'craftH1',
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
    { team: 'bad', assetKey: 'tCraft', hostileTeams: ['good'], count: 100 },
    { team: 'good', assetKey: 'xWing', hostileTeams: ['bad'], count: 60 },
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
  key: 'level002',
  title: 'Carnage!',
  description: 'A lot of space violence!',
  intro: [
    'In a micro galaxy, not so far away, where inter planetary travel is the norm and peace has been commonplace for centuries, a mysterious dark force has emerged',
    'Not the kind of dark force that leaks from your uncle’s bum hole after a roast dinner. No, a far more sinister force.',
    'A war has erupted and as a qualified pilot, you have been called up to the navy.',
    'This is a time when sophisticated weaponry has not been invented yet (I know, stay with me).',
    'Pilots (because no one has thought of using drones yet), rely on shooting shiny glowy things at each other called “lasers”.',
    'These nasty lasers can cause minor eye irritation and also inexplicably blow up other space craft.',
  ],
  time: {},
  tiles: starsParallax,
  gravity: 0,
  atmosphere: 0.05,
  mission,
  events: [
    radioMessageEvent('message_navy_return_fire', 3000),
    phoneMessageEvent('message_nan_congrats_navy_job', 25000),
    newObjectiveEvent(
      () =>
        createObjective({
          type: OBJECTIVE_TYPE_ELIMINATE_ALL_HOSTILES,
          title: 'Destroy all enemy targets',
          description: 'All hostiles must be eliminated to ensure the safety of the galaxy',
          onComplete: (game) => {
            queueSpeech('Mission successful. Zero hostiles detected');
            setTimeout(() => playRadioMessage('message_we_did_it_kid_back_to_base'), 1500);
            addObjective(
              game,
              createWaypointObjective({
                title: 'Report back to HQ',
                description: 'The nearest star gate has now been activated',
                waypoint: { position: { x: 3500, y: 4500 }, radius: 200 },
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
  introSound: {
    id: 'episode-24',
    startDelay: 2000,
  },
};
