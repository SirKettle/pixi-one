import defaultLevel from '../utils/defaultLevel';
import { starsParallax } from '../../utils/parallax';
import { generateMission } from '../utils/mission';
import { newObjectiveEvent, phoneMessageEvent, radioMessageEvent } from '../utils/events';
import { addObjective, createWaypointObjective } from '../utils/objective';
import { onCompleteLevel } from '../index';
import { playPhoneMessage, playRadioMessage } from '../../sound';

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
      assetKey: 'craftGarbage1',
    },
    objectives: [],
    actors: [
      {
        team: 'bad',
        assetKey: 'starDestroyer',
        hostileTeams: [],
        ai: false,
        x: 1000,
        y: 1000,
      },
    ],
  }),
  events: [
    phoneMessageEvent('message_nana_crisps', 6500),
    radioMessageEvent('message_boss_backtowork', 25000),
    newObjectiveEvent(
      () =>
        createWaypointObjective({
          title: 'Get to the space dump',
          description: 'Follow the navigation system to the new waypoint',
          waypoint: { position: { x: 7000, y: 3500 }, radius: 300 },
          onComplete: (game) => {
            playRadioMessage('message_boss_finally');
            playPhoneMessage('message_nana_bad_news');
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
      22000
    ),
  ],
  unlocksLevels: ['level002'],
  soundtrack: ['music-aha', 'music-wiffy'],
};
