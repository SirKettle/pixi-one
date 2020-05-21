import { uniq } from 'ramda';
import {
  getAvailableLevels,
  getLevel,
  getLevelAssetKeys,
  getMission,
  getTileAssetKeys,
} from '../levels';
import { loadAssets } from '../utils/loader';
import { goTo, SCREEN_LEVEL_INTRO, SCREEN_LOADING } from '../utils/screen';
import { getAsset } from '../utils/assetStore';
import { textButton } from '../utils/button';

function goToScreen(game, screen) {
  // reset state
  reset(game);
  goTo(game, screen);
}

function reset(game) {
  const container = getAsset(game.containers.info);
  container.removeChildren();
}

function getLevelButtonPosition(app, index, count) {
  const buttonSize = 270;
  const columns = 3;
  const rows = Math.ceil(count / columns);
  const column = index % columns;
  const row = Math.floor(index / columns);

  // app.screen.width / 2, app.screen.height / 2
  return {
    x: column * buttonSize + app.screen.width / 2 - Math.floor(columns * 0.5) * buttonSize,
    y: row * buttonSize + app.screen.height / 2 - Math.floor(rows * 0.5) * buttonSize,
  };
}

export function showLevelSelect(game) {
  const app = getAsset(game.app);
  const container = getAsset(game.containers.info);

  const availableLevels = getAvailableLevels(game);
  availableLevels.forEach((level, index) => {
    const newGameButton = textButton(level.title, { fixedRadius: 100 });
    const position = getLevelButtonPosition(app, index, availableLevels.length);
    newGameButton.position.set(position.x, position.y);
    newGameButton.on('pointerdown', () => loadLevel(game, { levelKey: level.key }));
    container.addChild(newGameButton);
  });

  //
  // const dashboardDisplayText = getAsset(game.dashboardDisplayTextId);
  // dashboardDisplayText.text =
  //   'Level Select - Will auto select and  start new game in a few moments...';
  //
  // setTimeout(() => {
  //   loadLevel(game, { levelKey: 'level001' });
  // }, 0);
}

function loadLevel(game, { levelKey }) {
  const app = getAsset(game.app);

  const level = getLevel(levelKey);
  const mission = getMission(levelKey);

  game.player = mission.player;
  game.passiveActors = mission.passiveActors || [];
  game.actors = mission.actors || [];
  game.bullets = [];
  game.tiles = level.tiles;
  game.levelKey = level.key;
  game.levelData = {
    score: 0,
    eventHistory: [],
  };
  game.objectives = mission.objectives;
  game.events = level.events;
  game.time.mission.elapsedMs = 0;

  goToScreen(game, SCREEN_LOADING);
  loadAssets({
    loader: app.loader,
    assetKeys: uniq(['bullet'].concat(getLevelAssetKeys(levelKey))),
    tileAssetKeys: getTileAssetKeys(levelKey),
    // soundAssetKeys: level.soundAssetKeys
  }).then(() => {
    goToScreen(game, SCREEN_LEVEL_INTRO);
  });
}
