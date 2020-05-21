import { getAsset } from './assetStore';
import { RED, WHITE } from '../constants/color';
import { combineVelocity, getDirection, getVelocity } from './physics';

export const drawCircle = ({
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
}) => {
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
};

export const drawDirection = ({
  fromPoint,
  targetPoint,
  startRadius = 0,
  length = 100,
  ...otherProps
}) => {
  if (!fromPoint || !targetPoint) {
    return;
  }
  const direction = getDirection(fromPoint, targetPoint);
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
};

export const drawLine = ({
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
}) => {
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
};
