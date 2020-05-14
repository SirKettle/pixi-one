import { getAsset } from '../../utils/assetStore';

export function updateCamera(game) {
  const player = game.player;
  const world = getAsset(game.containers.world);
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
  //   const background = getAsset(game.containers.background);
  //   background.pivot.x = player.data.x;
  //   background.pivot.y = player.data.y;
  //   background.rotation = 0 - playerSprite.rotation;
  // }
}
