import { getAsset } from './assetStore';
import { ORANGE, RED, WHITE } from '../constants/color';
import { combineVelocity, getDirection, getDistance, getVelocity } from './physics';

export function drawCircle({
  graphicId,
  graphic,
  lineWidth = 2,
  lineColor = WHITE,
  lineAlpha = 1,
  fillColor = WHITE,
  fillAlpha = 0,
  x,
  y,
  radius,
  clear = false,
}) {
  const circleGraphic = graphic || getAsset(graphicId);

  if (!circleGraphic) {
    return;
  }

  if (clear) {
    circleGraphic.clear();
  }

  circleGraphic.lineStyle(lineWidth, lineColor, lineAlpha);
  circleGraphic.beginFill(fillColor, fillAlpha);
  circleGraphic.drawCircle(x, y, radius);

  circleGraphic.endFill();
}

function getAlpha(alpha, distance, fromPoint, targetPoint) {
  if (typeof alpha === 'number') {
    return alpha;
  }
  const dist = typeof distance === 'number' ? distance : getDistance(fromPoint, targetPoint);
  return 0.2 + 0.8 * (Math.max(0, 3000 - dist) / 3000);
}

export function drawNavigationArrow({
  graphic,
  actor,
  targetPoint,
  distance,
  startRadius = 0,
  alpha,
  length = 100,
  lineWidth = 3,
  color = ORANGE,
}) {
  const lineAlpha = getAlpha(alpha, distance, actor.data, targetPoint);
  const direction = getDirection(actor.data, targetPoint);

  drawDirection({
    graphic,
    direction,
    fromPoint: actor.data,
    startRadius,
    lineColor: color,
    lineWidth,
    length,
    lineAlpha,
  });
}

export function drawDirection({
  fromPoint,
  direction,
  startRadius = 0,
  length = 100,
  ...otherProps
}) {
  if (!fromPoint || typeof direction !== 'number') {
    return;
  }
  const startVelocity = getVelocity({ speed: startRadius, direction });
  const lengthVelocity = getVelocity({ speed: length, direction });
  const startPoint = combineVelocity(startVelocity, fromPoint);
  const endPoint = combineVelocity(lengthVelocity, startPoint);

  drawLine({
    fromX: startPoint.x,
    fromY: startPoint.y,
    toX: endPoint.x,
    toY: endPoint.y,
    ...otherProps,
  });
}

export function drawLine({
  graphicId,
  graphic,
  fromX,
  fromY,
  toX,
  toY,
  lineWidth = 2,
  lineColor = WHITE,
  lineAlpha = 1,
  fillColor = WHITE,
  fillAlpha = 0,
  clear = false,
}) {
  const lineGraphic = graphic || getAsset(graphicId);

  if (!lineGraphic) {
    return;
  }

  if (clear) {
    lineGraphic.clear();
  }

  lineGraphic.lineStyle(lineWidth, lineColor, lineAlpha);
  lineGraphic.beginFill(fillColor, fillAlpha);

  lineGraphic.moveTo(fromX, fromY);
  lineGraphic.lineTo(toX, toY);
  lineGraphic.closePath();
  lineGraphic.endFill();
}
