import { uniq } from 'ramda';
import { getLevel, getLevelAssetKeys, getMission, getTileAssetKeys } from '../specs/levels';
import { loadAssets } from '../utils/loader';
import { goTo, SCREEN_LEVEL_INTRO, SCREEN_LOADING } from '../utils/screen';
import { getAsset } from '../utils/assetStore';

export function showLevelSelect(game) {
  const dashboardDisplayText = getAsset(game.dashboardDisplayTextId);
  dashboardDisplayText.text =
    'Level Select - Will auto select and  start new game in a few moments...';

  setTimeout(() => {
    loadLevel(game, { levelKey: 'space_1' });
  }, 0);
}

function loadLevel(game, { levelKey, missionKey }) {
  const app = getAsset(game.app);

  const level = getLevel(levelKey);
  const mission = missionKey ? getMission(levelKey, missionKey) : level.missions[0];

  game.player = mission.player;
  game.passiveActors = mission.passiveActors || [];
  game.actors = mission.actors || [];
  game.bullets = [];
  game.tiles = level.tiles;
  game.levelKey = level.key;
  game.missionKey = mission.key;

  goTo(game, SCREEN_LOADING);
  loadAssets({
    loader: app.loader,
    assetKeys: uniq(['bullet'].concat(getLevelAssetKeys(levelKey))),
    tileAssetKeys: getTileAssetKeys(levelKey),
    // soundAssetKeys: level.soundAssetKeys
  }).then(() => {
    goTo(game, SCREEN_LEVEL_INTRO);
  });
}
