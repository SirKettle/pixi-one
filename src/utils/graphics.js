import { getAsset } from './assetStore';
import { WHITE } from '../constants/color';

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
}) => {
  const circleGraphic = graphic || getAsset(graphicId);

  if (graphicId) {
    circleGraphic.clear();
  }

  circleGraphic.lineStyle(lineWidth, lineColor, lineAlpha);
  circleGraphic.beginFill(fillColor, fillAlpha);
  circleGraphic.drawCircle(x, y, radius);

  circleGraphic.endFill();
};
