import { v4 as generateUid } from 'uuid';
import { playMessage } from '../../sound';
import { addObjective } from './objective';

export const EVENT_TYPE_MESSAGE = 'EVENT_TYPE_MESSAGE';
export const EVENT_TYPE_NEW_OBJECTIVE = 'EVENT_TYPE_NEW_OBJECTIVE';

export function addEvent(game, event) {
  game.events = [...game.events, event];
}

export function messageEvent(trackId, startTimeMs) {
  return {
    uid: generateUid(),
    type: EVENT_TYPE_MESSAGE,
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

export function actionEvent(game, event) {
  switch (event.type) {
    case EVENT_TYPE_MESSAGE:
      playMessage(event.trackId, 1);
      return;
    case EVENT_TYPE_NEW_OBJECTIVE:
      addObjective(game, event.objective);
      // at this point, we need to add the objective to the list of
      // current objectives, or replace them all? (with a replace param)
      // Also, we need to alert the user of new objective somehow
      console.log('new objective', event.objective);
      // maybe the mission engine should listen for new objectives!

      return;
    default:
      return;
  }
}
