import { path, prop, propEq, propOr, uniq } from 'ramda';
import level001 from './data/001';
import level002 from './data/002';
import level003 from './data/003';
import level004 from './data/004';
import { SCREEN_LEVEL_SELECT } from '../utils/screen';

const levels = {
  all: [level001, level002, level003, level004],
  availableKeys: [
    'level001', 
    'level002',
    'level003',
    'level004'
  ],
};

export function getLevelAssetKeys(levelKey) {
  const mission = getMission(levelKey);
  const missionActors = Object.values(mission.actorMap) || [];

  return uniq(
    missionActors
      .concat(propOr([], 'passiveActors')(mission))
      .concat(prop('player')(mission))
      .map(prop('assetKey'))
  );
}

export function getTileAssetKeys(key) {
  const level = getLevel(key);
  return uniq(propOr([], 'tiles')(level).map(path(['data', 'assetKey'])));
}

export function getLevel(key) {
  return getLevels().find(propEq('key', key));
}

export function getMission(levelKey) {
  const level = getLevel(levelKey);
  return prop('mission')(level);
}

export function getLevels() {
  return levels.all.slice();
}

export function getAvailableLevels(game) {
  return levels.availableKeys.map(getLevel);
}

export function onCompleteLevel(game) {
  const currentLevel = getLevel(game.levelKey);
  levels.availableKeys = uniq([
    ...levels.availableKeys,
    ...propOr([], 'unlocksLevels')(currentLevel),
  ]);

  game.handlers.onQuit(game, SCREEN_LEVEL_SELECT);
}
