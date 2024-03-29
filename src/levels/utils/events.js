import { v4 as generateUid } from 'uuid';
import { playPhoneMessage, playRadioMessage } from '../../sound';
import { addObjective } from './objective';

export const EVENT_TYPE_PHONE_MESSAGE = 'EVENT_TYPE_PHONE_MESSAGE';
export const EVENT_TYPE_RADIO_MESSAGE = 'EVENT_TYPE_RADIO_MESSAGE';
export const EVENT_TYPE_NEW_OBJECTIVE = 'EVENT_TYPE_NEW_OBJECTIVE';

export function addEvent(game, event) {
  game.events = [...game.events, event];
}

export function phoneMessageEvent(trackId, startTimeMs) {
  return {
    uid: generateUid(),
    type: EVENT_TYPE_PHONE_MESSAGE,
    startTimeMs,
    trackId,
  };
}

export function radioMessageEvent(trackId, startTimeMs) {
  return {
    uid: generateUid(),
    type: EVENT_TYPE_RADIO_MESSAGE,
    startTimeMs,
    trackId,
  };
}

export function newObjectiveEvent(objective, startTimeMs) {
  return {
    uid: generateUid(),
    type: EVENT_TYPE_NEW_OBJECTIVE,
    startTimeMs,
    objective,
  };
}

// export function speechEvent(message, startTimeMs) {
//   return {
//     uid: generateUid(),
//     type: EVENT_TYPE_NEW_OBJECTIVE,
//     startTimeMs,
//     message,
//   };
// }

export function actionEvent(game, event) {
  switch (event.type) {
    case EVENT_TYPE_PHONE_MESSAGE:
      playPhoneMessage(event.trackId, 1);
      return;
    case EVENT_TYPE_RADIO_MESSAGE:
      playRadioMessage(event.trackId, 1);
      return;
    case EVENT_TYPE_NEW_OBJECTIVE:
      addObjective(game, event.objective());
      return;
    default:
      return;
  }
}
