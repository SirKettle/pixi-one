import { path, pathOr } from 'ramda';
import {
  FIRE_ONE,
  getButtonPressedMs,
  getForwardThruster,
  getReverseThruster,
  getStrafeThruster,
  getTurnThruster,
  isButtonUp,
} from '../../input';
import { updateTexture } from '../store/textures';
import { getAsset } from '../store/pixiAssets';
import { normalizeDirection } from '../utils/physics';
import { play as playAudio } from '../utils/audio';
import { drawHitCircles, getSpriteRadius } from '../utils/actor';
import { drawCircle } from '../utils/graphics';
import { generateBulletData } from '../specs/bullets';
import { getSpecs } from '../specs/getSpecs';
import { applyThrusters, createActor, updateActorPosition } from './actor';

export function updatePlayer({ pixiGame, level, delta, sinVariant }) {
  const player = pixiGame.player;
  const playerSpecs = getSpecs(player.assetKey);
  const playerSprite = getAsset(player.spriteId);
  const world = getAsset(pixiGame.containers.world);

  // a) turn thrusters to rotate player
  const turnThruster = getTurnThruster();
  const minTurnThrust = 0.3;
  const hardTurnThrust = 0.9; // just for texture frame;
  const isTurning = Math.abs(turnThruster) > minTurnThrust;

  if (isTurning) {
    const isHardTurn = Math.abs(turnThruster) > hardTurnThrust;
    const leftTurn = turnThruster < 0;
    if (leftTurn) {
      updateTexture(player, isHardTurn ? 'hardLeft' : 'left');
    } else {
      updateTexture(player, isHardTurn ? 'hardRight' : 'right');
    }
    // todo: replace hard coded turn speed with settings/data
    player.data.rotation = normalizeDirection(
      player.data.rotation + turnThruster * 0.1 * delta * pathOr(1, ['thrust', 'turn'])(playerSpecs)
    );
    playerSprite.rotation = player.data.rotation;
  } else {
    updateTexture(player, 'DEFAULT');
  }

  // b) thrusters to move player
  applyThrusters({
    actor: player,
    delta,
    thrustDirection: 'forward',
    forward: getForwardThruster() - getReverseThruster(),
    side: getStrafeThruster(),
  });

  updateActorPosition(player, level, delta);

  // 3. fire weapon
  const firePower = Math.min(1, getButtonPressedMs(FIRE_ONE) / 500) * 0.8 + 0.2;
  if (isButtonUp(FIRE_ONE)) {
    const newBullet = createActor(world)(
      generateBulletData({
        host: player,
        hostFirePower: firePower,
      })
    );

    playAudio(firePower > 0.8 ? 'bigLaser' : 'laser', firePower);
    // debugger;
    pixiGame.bullets.push(newBullet);
  }

  const spriteRadius = getSpriteRadius(playerSprite);
  const lineWidth = firePower * spriteRadius + sinVariant * 5;

  drawCircle({
    graphicId: player.graphicId,
    lineWidth,
    lineColor: 0x00aaff,
    lineAlpha: firePower * 0.3,
    x: path(['data', 'x'])(player),
    y: path(['data', 'y'])(player),
    radius: spriteRadius * 1.6 + lineWidth - sinVariant,
  });

  if (pixiGame.isDebugCollsionMode) {
    drawHitCircles(player);
  }
}
