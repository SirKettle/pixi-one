import { v4 as generateUid } from 'uuid';
import { path, pathEq, pathOr, propEq, propOr } from 'ramda';
import { drawCircle, drawDirection } from '../../utils/graphics';
import { ORANGE, RED, WHITE } from '../../constants/color';
import { getDistance } from '../../utils/physics';

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
  graphic.clear();
  const objectives = propOr([], 'objectives')(game);
  const hasUnread = objectives.some(propEq('isRead', false));

  if (hasUnread && pathEq(['time', 'paused'], false)(game)) {
    console.log('has unread objectives - pause now');
    // game.handlers.onPauseToggle(game);
    // return;
  }

  objectives.forEach((objective) => {
    if (objective.isComplete || objective.isFail) {
      return;
    }

    if (propEq('type', OBJECTIVE_TYPE_GO_TO_WAYPOINT)(objective)) {
      const targetPoint = path(['waypoint', 'position'])(objective);
      if (!targetPoint) {
        return;
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

      drawDirection({
        graphic,
        fromPoint: game.player.data,
        targetPoint,
        startRadius: game.player.performance.radiusPx + 50,
        lineColor: ORANGE,
        length: 50 + Math.min(distance / 20, 300),
      });
    }
  });
}
