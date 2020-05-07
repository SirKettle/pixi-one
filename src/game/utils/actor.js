import { path, propEq } from 'ramda';
import { getAsset } from '../store/pixiAssets';
import { getSpecs } from '../specs/getSpecs';
import { getDistance } from './physics';

export const getActorByUid = ({ player, actors, bullets }) => (uid) => {
  if (player.uid === uid) {
    return player;
  }
  const actor = actors.find(propEq('uid', uid));

  return actor || bullets.find(propEq('uid', uid));
};

export const getActorRadius = ({ assetKey, spriteId }) => {
  const specs = getSpecs(assetKey);
  return getSpriteRadius(
    getAsset(spriteId),
    path(['hitArea', 'basic', 'radius'])(specs)
  );
};

export const getSpriteRadius = (sprite, percentage = 0.5) =>
  Math.max(sprite.width, sprite.height) * percentage;

export const getAllActors = (pixiGame) =>
  pixiGame.actors.concat(pixiGame.bullets, [pixiGame.player]);

export const getAllActorsInTeams = (pixiGame, teams = []) => {
  const allActors = getAllActors(pixiGame);
  return allActors.filter((a) => teams.includes(path(['data', 'team'])(a)));
};

export const sortByNearest = (actor) => (targetA, targetB) => {
  const dA = getDistance(actor.data, targetA.data);
  const dB = getDistance(actor.data, targetB.data);
  return dA > dB ? 1 : -1;
};
