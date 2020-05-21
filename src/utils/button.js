import { BitmapText, Container, Graphics } from 'pixi.js';
import { drawCircle } from './graphics';
import { BLACK, GREEN, RED } from '../constants/color';

export function textButton(text, args = {}) {
  const container = new Container();
  const sprite = new BitmapText(text, {
    font: '25px Digital-7 Mono',
    align: 'center',
    tint: BLACK, // todo: change font color to white so tint works better
    ...args.style,
  });

  const border = new Graphics();
  drawCircle({
    graphic: border,
    radius: args.fixedRadius ? args.fixedRadius : sprite.width * 0.85,
    fillColor: GREEN,
    fillAlpha: 1,
    lineWidth: 0,
  });

  container.addChild(border);
  container.addChild(sprite);
  sprite.anchor.set(0.5);
  container.interactive = true;
  container.buttonMode = true;
  return container;
}
