import defaultLevel from '../utils/defaultLevel';
import { starsParallax } from '../../utils/parallax';
import { generateMission } from '../utils/mission';
import { messageEvent, newObjectiveEvent } from '../utils/events';
import { addObjective, createWaypointObjective } from '../utils/objective';
import { onCompleteLevel } from '../index';

const allowedTimeMs = 10 * 60 * 1000;

export default {
  ...defaultLevel,
  key: 'level001',
  title: 'Small beginnings',
  description: 'Take out the trash!',
  intro: [
    'The year is 2089...',
    'Rubbish is big business. Land is scarce and so rubbish is now exported to new space dumps.',
    'Pilots ferry large quantities of trash to the outer limits of the solar system',
  ],
  time: {},
  tiles: starsParallax,
  gravity: 0,
  atmosphere: 0.05,
  mission: generateMission({
    key: 'm1',
    description: 'Deliver the trash to the drop off point and return to HQ',
    allowedTimeMs,
    player: {
      hostileTeams: ['bad'],
      team: 'good',
      assetKey: 'tantiveIV',
    },
    objectives: [],
    actors: [
      {
        team: 'bad',
        assetKey: 'starDestroyer',
        hostileTeams: ['good'],
        ai: false,
        x: 1000,
        y: 1000,
      },
    ],
  }),
  events: [
    messageEvent('message_nana_crisps', 6500),
    messageEvent('message_boss_backtowork', 25000),
    newObjectiveEvent(
      createWaypointObjective({
        title: 'Get to the space dump',
        description: 'Follow the navigation system to the new waypoint',
        waypoint: { position: { x: 7000, y: 3500 }, radius: 300 },
        onComplete: (game) => {
          addObjective(
            game,
            createWaypointObjective({
              title: 'Now back to HQ',
              description: 'Now time to return to base',
              waypoint: { position: { x: -3500, y: -500 }, radius: 150 },
              onComplete: (game) => {
                onCompleteLevel(game);
              },
            })
          );
        },
      }),
      40000
    ),
  ],
  unlocksLevels: ['level002'],
  soundtrack: [
    'mobyInThisWorld',
    'transition_moby_comfortably_numb',
    'scissorSistersComfortablyNumb',
    'transition_comfortably_numb_to_danger',
    'radioSoulwax23DangerHighVoltage',
    'portisheadMysterons',
  ],
};
