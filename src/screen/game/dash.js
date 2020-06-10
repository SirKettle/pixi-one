import { path, prop, propEq } from 'ramda';
import {
  drawHitCircles,
  getAllActorsInTeams,
  getSpriteRadius,
  sortByNearest,
} from '../../utils/actor';
import { GREEN, ORANGE, RED, WHITE, YELLOW } from '../../constants/color';
import { drawCircle, drawDirection, drawNavigationArrow } from '../../utils/graphics';
import {
  OBJECTIVE_TYPE_ELIMINATE_TARGET,
  OBJECTIVE_TYPE_GO_TO_WAYPOINT,
} from '../../levels/utils/objective';
import { getAsset } from '../../utils/assetStore';
import { onResetText, onUpdateText } from '../../utils/animateText';

const cache = {};

export function updateDash({ game, deltaMs, sinVariant, fireButtonPressedTime, firePower }) {
  const player = game.player;
  const playerSprite = getAsset(player.spriteId);
  const spriteRadius = getSpriteRadius(playerSprite);
  const graphic = getAsset(player.graphicId);

  const minRadius = spriteRadius * 1.4 + 10;
  const firePowerLineWidth = firePower * 32;
  const healthPercentage = player.data.life / player.performance.startLife;
  const healthColor = healthPercentage > 0.75 ? GREEN : healthPercentage > 0.25 ? YELLOW : RED;
  const healthLineWidth = 12;

  // health bar
  drawCircle({
    graphic,
    lineWidth: healthLineWidth,
    lineColor: healthColor,
    lineAlpha: 0.3 + sinVariant * 0.15 * (1 - healthPercentage),
    x: path(['data', 'x'])(player),
    y: path(['data', 'y'])(player),
    radius: minRadius - sinVariant,
  });

  // Firepower circle
  if (fireButtonPressedTime > 0) {
    drawCircle({
      graphic,
      lineWidth: firePowerLineWidth,
      lineColor: 0x00aaff,
      lineAlpha: firePower * 0.3,
      x: path(['data', 'x'])(player),
      y: path(['data', 'y'])(player),
      radius: minRadius + healthLineWidth * 0.5 + 5 - sinVariant + firePowerLineWidth * 0.5,
    });
  }

  const targetRadius = minRadius + 100;

  drawCircle({
    graphic,
    lineWidth: 3,
    lineColor: WHITE,
    lineAlpha: 0.05,
    x: path(['data', 'x'])(player),
    y: path(['data', 'y'])(player),
    radius: targetRadius, // - sinVariant,
  });

  //

  [
    0,
    0.25 * Math.PI,
    0.5 * Math.PI,
    0.75 * Math.PI,
    Math.PI,
    1.25 * Math.PI,
    1.5 * Math.PI,
    1.75 * Math.PI,
  ].forEach((direction) => {
    drawDirection({
      graphic,
      fromPoint: player.data,
      direction: direction,
      startRadius: targetRadius - 10,
      length: 20,
      lineAlpha: 0.1,
      lineWidth: 3,
    });
  });

  drawDirection({
    graphic,
    fromPoint: player.data,
    direction: player.data.rotation,
    startRadius: targetRadius - 15,
    length: 30,
    lineAlpha: 0.1,
    lineWidth: 3,
  });

  const potentialTargets = getAllActorsInTeams(game, path(['data', 'hostileTeams'])(player));
  const sortedPotentialTargets = potentialTargets.sort(sortByNearest(player));
  const nearestTarget = sortedPotentialTargets[0];
  if (nearestTarget) {
    drawNavigationArrow({
      graphic,
      actor: player,
      targetPoint: nearestTarget.data,
      color: RED,
      startRadius: targetRadius - 15,
      length: 30,
    });
  }

  const currentObjectives = game.objectives
    .filter(propEq('isComplete', false))
    .filter(propEq('isFail', false));

  const no1Objective = currentObjectives[0];

  const text = getAsset(game.objectivesDisplayTextId);
  if (no1Objective && no1Objective.uid !== cache.no1ObjectiveUid) {
    cache.no1ObjectiveUid = no1Objective.uid;
    console.log('new mission objective', no1Objective);
    text.text = no1Objective.description;
    onResetText();
  }

  if (!no1Objective) {
    onResetText();
    text.text = 'No objective set...';
  } else {
    onUpdateText({
      fixedStartCopy: `${no1Objective.title}\n\n\n`,
      sentences: [no1Objective.description],
      bitmapText: text,
      deltaMs,
      updateCharMs: 80,
      onComplete: () => {
        setTimeout(onResetText, 4000);
      },
    });
  }

  currentObjectives.forEach((objective) => {
    switch (prop('type')(objective)) {
      case OBJECTIVE_TYPE_GO_TO_WAYPOINT: {
        const targetPoint = path(['waypoint', 'position'])(objective);
        if (!targetPoint) {
          break;
        }

        const pulseVariant = sinVariant * 6;

        drawNavigationArrow({
          graphic,
          actor: player,
          targetPoint,
          color: ORANGE,
          startRadius: targetRadius - 15 - pulseVariant * 0.25,
          lineWidth: 3 + sinVariant,
          length: 30 + pulseVariant,
          alpha: 0.5 + sinVariant * 0.25,
        });
        break;
      }

      case OBJECTIVE_TYPE_ELIMINATE_TARGET: {
        const target = game.actors.find(propEq('uid', prop('target')(objective)));

        if (!target) {
          break;
        }

        const pulseVariant = sinVariant * 6;

        drawNavigationArrow({
          graphic,
          actor: player,
          targetPoint: target.data,
          color: RED,
          startRadius: targetRadius - 15 - pulseVariant * 0.25,
          lineWidth: 3 + sinVariant,
          length: 30 + pulseVariant,
          alpha: 0.5 + sinVariant * 0.25,
        });
        break;
      }

      default: {
        break;
      }
    }
  });

  if (game.settings.isDebugCollisionMode) {
    drawHitCircles(game, player);
  }
}
