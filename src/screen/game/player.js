import { path, pathOr } from 'ramda';
import {
  FIRE_ONE,
  getButtonPressedMs,
  getForwardThruster,
  getReverseThruster,
  getStrafeThruster,
  getTurnThruster,
  getJoystick,
  isButtonUp,
} from '../../input';
import { updateTexture } from '../../utils/textures';
import { getAsset } from '../../utils/assetStore';
import { normalizeDirection } from '../../utils/physics';
import { generateBulletData } from '../../specs/bullets';
import { getSpecs } from '../../specs/getSpecs';
import { playSound } from '../../sound';
import {
  applyThrusters,
  createActor,
  moveTowardsDirection,
  updateActorPosition
} from './actor';
import { updateDash } from './dash';
import { assignToChunk } from './world';
import { SCREEN_LEVEL_SELECT } from '../../utils/screen';

export function updatePlayer({ game, level, delta, deltaMs, sinVariant }) {
  const player = game.player;
  const playerSpecs = getSpecs(player.assetKey);
  const playerSprite = getAsset(player.spriteId);
  const world = getAsset(game.containers.world);

  const joystick = getJoystick();
  if (joystick) {
    moveTowardsDirection(player, joystick.direction, playerSpecs, delta, joystick.force);
  } else {
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
        player.data.rotation +
          turnThruster * 0.1 * delta * pathOr(1, ['thrust', 'turn'])(playerSpecs)
      );
      playerSprite.rotation = player.data.rotation;
    } else {
      updateTexture(player, 'DEFAULT');
    }

    // look for keyboard thrusters
    applyThrusters({
      actor: player,
      delta,
      thrustDirection: 'forward',
      forward:
        pathOr(0.1, ['thrust', 'forward'])(playerSpecs) *
        (getForwardThruster() - getReverseThruster()),
      side: getStrafeThruster(),
    });
  }

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
    game.bulletMap[newBullet.uid] = newBullet;
  }

  // draw player graphics here
  updateDash({ game, deltaMs, sinVariant, fireButtonPressedTime, firePower });

  if (path(['data', 'life'])(player) <= 0) {
    console.log('DEAD');
    game.handlers.onQuit(game, SCREEN_LEVEL_SELECT);
    // setTimeout(() => {
    // }, 1000);
  } else {
    assignToChunk({game, uid: player.uid, x: player.data.x, y: player.data.y });
  }
}
