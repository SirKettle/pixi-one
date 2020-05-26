import { getAsset } from '../../utils/assetStore';
import { createActor, createTile, updateActors, updateTiles } from './actor';
import { updatePauseScreen } from './pauseScreen';
import { pathEq } from 'ramda';
import { getLevel } from '../../levels';
import { updatePlayer } from './player';
import { handleCollisions } from './collision';
import { updateCamera } from './camera';
import { updateDiscoveredWorld } from './world';
import { updateMission } from './mission';
import { updateObjectives } from '../../levels/utils/objective';

export function showPlay(game) {
  const dashboardDisplayText = getAsset(game.dashboardDisplayTextId);
  dashboardDisplayText.text = 'Playing!';
  addLevelAssets(game);
}

function addLevelAssets(game) {
  const app = getAsset(game.app);
  const background = getAsset(game.containers.background);
  const world = getAsset(game.containers.world);
  const worldFar = getAsset(game.containers.worldFar);
  const worldNear = getAsset(game.containers.worldNear);

  game.tiles = game.tiles.map(createTile(app, background));
  game.passiveActors = game.passiveActors.map(createActor(worldFar));
  game.actors = game.actors.map(createActor(worldNear));

  game.player = createActor(worldNear)({
    ...game.player,
    x: app.screen.width / 2,
    y: app.screen.height / 2,
    rotation: 0,
    direction: 0,
    distanceFromCenter: 0,
  });

  game.time.paused = false;

  // reset world position/pivot
  // Update world container
  world.position.set(app.screen.width / 2, app.screen.height / 2);
  world.pivot.x = game.player.data.x;
  world.pivot.y = game.player.data.y;
}

export function onUpdate(game, delta, deltaMs) {
  const graphic = getAsset(game.dash.nearestTargetId);
  graphic.clear();

  updateMission(game, delta, deltaMs);
  updatePauseScreen(game);

  const shouldUpdate = pathEq(['time', 'paused'], false)(game);

  if (!shouldUpdate) {
    return;
  }

  const sinVariant = (1 + Math.sin(game.time.session.elapsedMs / 100)) * 0.5;
  updateObjectives(game, delta, deltaMs, sinVariant);

  const player = game.player;
  const level = getLevel(game.levelKey);

  // 1. Update Actors position
  updateActors(game.bullets, level, delta, deltaMs, game);
  updateActors(game.actors, level, delta, deltaMs, game);
  updateActors(game.passiveActors, level, delta, deltaMs, game);
  updateActors(game.particles, level, delta, deltaMs, game);

  // 2. Update player
  updatePlayer({ game, level, delta, deltaMs, sinVariant });

  // 3. Move parallax backgrounds
  updateTiles(game.tiles, player.data);

  // 4. Collision detection
  handleCollisions(game);

  // 5. Move camera to follow Player
  updateCamera(game);

  // 6. Update world - spawn new tiles/passive actors
  updateDiscoveredWorld(game);
}
