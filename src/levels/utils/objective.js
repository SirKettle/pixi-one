import { v4 as generateUid } from 'uuid';
import { path, pathEq, pathOr, prop, propEq, propOr } from 'ramda';
import { drawCircle } from '../../utils/graphics';
import { ORANGE } from '../../constants/color';
import { getDistance } from '../../utils/physics';
import { getAllActorsInTeams } from '../../utils/actor';

export const OBJECTIVE_TYPE_GO_TO_WAYPOINT = 'OBJECTIVE_TYPE_GO_TO_WAYPOINT';
export const OBJECTIVE_TYPE_GO_TO_TARGET = 'OBJECTIVE_TYPE_GO_TO_TARGET';
export const OBJECTIVE_TYPE_ELIMINATE_ALL_HOSTILES = 'OBJECTIVE_TYPE_ELIMINATE_ALL_HOSTILES';
export const OBJECTIVE_TYPE_ELIMINATE_TARGET = 'OBJECTIVE_TYPE_ELIMINATE_TARGET';

export function createObjective({
  type,
  uid = generateUid(),
  title = 'Objective',
  description = 'blah',
  onComplete = () => {},
  isComplete = false,
  isFail = false,
  isRead = false,
  ...details
}) {
  return {
    uid,
    type,
    title,
    isComplete,
    isFail,
    isRead,
    onComplete,
    description,
    ...details,
  };
}

export function createWaypointObjective(objective) {
  return createObjective({ ...objective, type: OBJECTIVE_TYPE_GO_TO_WAYPOINT });
}

export function addObjective(game, objective) {
  if (objective.replaceAll) {
    game.objectives = [objective];
    return;
  }
  game.objectives = [...game.objectives, objective];
}

export function updateObjectives(game, delta, deltaMs, sinVariant) {
  const graphic = getAsset(game.dash.nearestTargetId);
  const hasUnread = game.objectives.some(propEq('isRead', false));

  if (hasUnread && pathEq(['time', 'paused'], false)(game)) {
    // console.log('has unread objectives - pause now');
    // game.handlers.onPauseToggle(game);
    // return;
  }

  const currentObjectives = game.objectives
    .filter(propEq('isComplete', false))
    .filter(propEq('isFail', false));

  currentObjectives.forEach((objective) => {
    switch (prop('type')(objective)) {
      case OBJECTIVE_TYPE_GO_TO_WAYPOINT: {
        const targetPoint = path(['waypoint', 'position'])(objective);
        if (!targetPoint) {
          break;
        }
        const distance = getDistance(game.player.data, targetPoint);
        const targetRadius = pathOr(25, ['waypoint', 'radius'])(objective);
        if (distance < targetRadius) {
          objective.isComplete = true;
          objective.onComplete(game);
        }

        // replace with isOnScreen util method
        if (distance < 1500) {
          drawCircle({
            graphic,
            lineWidth: 2,
            lineColor: ORANGE,
            lineAlpha: 0.5,
            fillColor: ORANGE,
            fillAlpha: 0.1 + 0.025 * sinVariant,
            x: targetPoint.x,
            y: targetPoint.y,
            radius: targetRadius,
          });
        }

        break;
      }

      case OBJECTIVE_TYPE_ELIMINATE_TARGET: {
        const target = game.actors.find(propEq('uid', prop('target')(objective)));

        if (!target) {
          objective.isComplete = true;
          objective.onComplete(game);
        }

        break;
      }

      case OBJECTIVE_TYPE_ELIMINATE_ALL_HOSTILES: {
        const hostileTeams = game.player.data.hostileTeams || [];
        const hostileCount = getAllActorsInTeams(game, hostileTeams).length;

        if (hostileCount <= 0) {
          objective.isComplete = true;
          objective.onComplete(game);
        }
        break;
      }
    }
  });
}
