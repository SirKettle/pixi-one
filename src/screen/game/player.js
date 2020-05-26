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
import { updateTexture } from '../../utils/textures';
import { getAsset } from '../../utils/assetStore';
import { normalizeDirection } from '../../utils/physics';
import { generateBulletData } from '../../specs/bullets';
import { getSpecs } from '../../specs/getSpecs';
import { playSound } from '../../sound';
import { applyThrusters, createActor, updateActorPosition } from './actor';
import { updateDash } from './dash';
import { SCREEN_LEVEL_SELECT } from '../../utils/screen';

export function updatePlayer({ game, level, delta, deltaMs, sinVariant }) {
  const player = game.player;
  const playerSpecs = getSpecs(player.assetKey);
  const playerSprite = getAsset(player.spriteId);
  const world = getAsset(game.containers.world);

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
  const fireButtonPressedTime = getButtonPressedMs(FIRE_ONE);
  const firePower = Math.min(1, fireButtonPressedTime / 500) * 0.8 + 0.2;
  if (isButtonUp(FIRE_ONE)) {
    const newBullet = createActor(world)(
      generateBulletData({
        host: player,
        hostFirePower: firePower,
      })
    );

    playSound(firePower > 0.8 ? 'bigLaser' : 'laser', firePower);
    // debugger;
    game.bullets.push(newBullet);
  }

  // draw player graphics here
  updateDash({ game, deltaMs, sinVariant, fireButtonPressedTime, firePower });

  if (path(['data', 'life'])(player) <= 0) {
    console.log('DEAD');
    game.handlers.onQuit(game, SCREEN_LEVEL_SELECT);
    // setTimeout(() => {
    // }, 1000);
  }
}
