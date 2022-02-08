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
  OBJECTIVE_TYPE_ELIMINATE_TARGET,
} from '../utils/objective';
import { onCompleteLevel } from '../index';
import { playRadioMessage, queueSpeech } from '../../sound';

const mission = generateMission({
  key: 'm1',
  description: 'Trying something new!',
  allowedTimeMs: 180 * 1000,
  player: {
    hostileTeams: ['bad'],
    team: 'good',
    // assetKey: 'craftNcfc',
    // assetKey: 'craftH1',
    assetKey: 'spacecraft',
    // hostileTeams: ['good'],
    // team: 'bad',
    // assetKey: 'tCraft',
  },
  objectives: [],
  actors: [
    {
      uid: 'queen-bee',
      team: 'bad',
      assetKey: 'tCraft',
      hostileTeams: ['good'],
      ai: true,
      x: 0,
      y: 500,
      order: {
        ...getOrder({
          type: ORDER.PATROL,
          points: [
            { x: 0, y: -5000 },
            { x: 1000, y: -5000 },
            { x: 500, y: -3500 },
          ],
        }),
      },
    },
  ],
  actorGroups: [
    {
      count: 250,
      team: 'bad',
      assetKey: 'tCraft',
      hostileTeams: ['good'],
      ai: true,
      x: 0,
      y: 500,
      order: {
        ...getOrder({
          type: ORDER.PATROL,
          points: [
            { x: 2500, y: 500 },
            { x: 0, y: 500 },
          ],
        }),
      },
    },
  ],
});

export default {
  ...defaultLevel,
  key: 'level003',
  title: 'Special assignment',
  description: "Patrol the system's inner rim",
  intro: [
    'You are being assigned to a top secret mission',
    'We have detected large numbers of hostiles in the area',
    'Patrol the system’s inner rim and await further instructions',
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
          type: OBJECTIVE_TYPE_ELIMINATE_TARGET,
          title: 'The Queen Bee',
          description: 'Eliminate the mother ship, and the rest will drop like flies',
          target: 'queen-bee',
          onComplete: (game) => {
            queueSpeech('Mission successful. The target has been destroyed');
            setTimeout(() => playRadioMessage('message_we_did_it_kid_back_to_base'), 1500);
            addObjective(
              game,
              createWaypointObjective({
                title: 'Report back to HQ',
                description: 'The nearest star gate has now been activated. Be careful to avoid other hostiles in the area',
                waypoint: { position: { x: 1500, y: 2100 }, radius: 150 },
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
  unlocksLevels: [],
  soundtrack: [
    'music-wiffy',
    //'transition-wiffy2aha',
    'music-aha',
  ],
  // introSound: {
  //   id: 'episode-24',
  //   startDelay: 2000,
  // },
};
