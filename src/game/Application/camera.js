import { getAsset } from '../store/pixiAssets';

export function updateCamera(pixiGame) {
  const player = pixiGame.player;
  const world = getAsset(pixiGame.containers.world);
  // world.pivot.x = player.data.x;
  // world.pivot.y = player.data.y;
  // LERP it
  world.pivot.x += (player.data.x - world.pivot.x) * 0.15;
  world.pivot.y += (player.data.y - world.pivot.y) * 0.15;

  // // const alwaysFaceFrontMode = false;
  // const alwaysFaceFrontMode = true;
  // if (alwaysFaceFrontMode) {
  //   // keep the player facing up
  //   world.rotation = 0 - playerSprite.rotation;
  //   const background = getAsset(pixiGame.containers.background);
  //   background.pivot.x = player.data.x;
  //   background.pivot.y = player.data.y;
  //   background.rotation = 0 - playerSprite.rotation;
  // }
}
