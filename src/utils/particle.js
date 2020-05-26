import { getAnimatedTextureIds } from './textures';
import { getAsset } from './assetStore';
import { AnimatedSprite } from 'pixi.js';

export function addAnimatedParticle({
  assetKey,
  container,
  x,
  y,
  scale = 1,
  rotation = Math.random() * Math.PI,
  loop = false,
}) {
  try {
    const textures = getAnimatedTextureIds(assetKey).map(getAsset);
    const sprite = new AnimatedSprite(textures);

    sprite.x = x;
    sprite.y = y;
    sprite.anchor.set(0.5);
    sprite.rotation = rotation;
    sprite.scale.set(scale);
    sprite.loop = loop;
    sprite.gotoAndPlay(0);
    container.addChild(sprite);
  } catch (e) {
    console.error('addAnimatedParticle error', e);
  }
}

export function addExplosion({ container, scale = 1, x, y }) {
  return addAnimatedParticle({ container, scale, x, y, assetKey: 'explosion200', loop: false });
}
