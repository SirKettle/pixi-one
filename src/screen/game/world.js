import { pathOr } from 'ramda';
import { getRandomInt } from '../../utils/random';
import { getAsset } from '../../utils/assetStore';
import { createActor } from './actor';

const screenWidth = window.innerWidth;
const screenHeight = window.innerWidth;

function getAreaCode({ x, y }) {
  return [Math.floor(x / screenWidth), Math.floor(y / screenHeight)];
}

function getAreaCodeKey([x, y]) {
  return `(${x}:${y})`;
}

function getAreaBoundsByCode([x, y]) {
  return {
    from: {
      x: x * screenWidth,
      y: y * screenHeight,
    },
    to: {
      x: x * screenWidth + screenWidth,
      y: y * screenHeight + screenHeight,
    },
  };
}

function getOuterAreaCodes({ x, y }) {
  return [
    getAreaCode({ x: x - screenWidth, y: y - screenHeight }),
    getAreaCode({ x: x - screenWidth, y }),
    getAreaCode({ x: x - screenWidth, y: y + screenHeight }),
    getAreaCode({ x, y: y - screenHeight }),
    getAreaCode({ x, y }),
    getAreaCode({ x, y: y + screenHeight }),
    getAreaCode({ x: x + screenWidth, y: y - screenHeight }),
    getAreaCode({ x: x + screenWidth, y }),
    getAreaCode({ x: x + screenWidth, y: y + screenHeight }),
  ];
}

export function updateDiscoveredWorld(game) {
  const world = getAsset(game.containers.worldFar);
  const { cachedAreaKey, discoveredAreas } = game;
  const currentAreaCode = getAreaCode(game.player.data);
  const currentAreaCodeKey = getAreaCodeKey(currentAreaCode);

  if (cachedAreaKey !== currentAreaCodeKey) {
    const outerCodes = getOuterAreaCodes(game.player.data);

    const newCodes = outerCodes.filter((code) => !discoveredAreas[getAreaCodeKey(code)]);

    if (newCodes.length) {
      newCodes.forEach((code) => {
        discoveredAreas[getAreaCodeKey(code)] = [...code];
        // const bounds = getAreaBoundsByCode(code);
        //
        // const x = getRandomInt(pathOr(0, ['from', 'x'])(bounds), pathOr(1000, ['to', 'x'])(bounds));
        // const y = getRandomInt(pathOr(0, ['from', 'y'])(bounds), pathOr(1000, ['to', 'y'])(bounds));
        //
        // createActor(world)({
        //   assetKey: 'starSun',
        //   scale: 12,
        //   count: 2,
        //   rotationSpeed: -0.02,
        //   x,
        //   y,
        // });
        //
        // console.log(
        //   'updateDiscoveredWorld - new area discovered',
        //   'generate sun at ',
        //   x,
        //   y,
        //   getAreaCodeKey(code),
        //   getAreaBoundsByCode(code)
        // );
      });
    }
  }

  game.cachedAreaKey = currentAreaCodeKey;
}
