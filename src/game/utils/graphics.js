import { getAsset } from '../store/pixiAssets';

export const drawCircle = ({
  graphicId,
  graphic,
  lineWidth = 2,
  lineColor = 0xffffff,
  lineAlpha = 1,
  fillColor = 0xffffff,
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
