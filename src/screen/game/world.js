import { pathOr } from 'ramda';
import { getRandomInt } from '../../utils/random';
import { getAsset } from '../../utils/assetStore';
import { createActor } from './actor';
import { CHUNK_SIZE } from '../../constants/chunk';

const screenWidth = window.innerWidth;
const screenHeight = window.innerWidth;

// const chunkSize = Math.floor(Math.min(screenWidth, screenHeight) * 0.75);

export function getAreaCode({ x, y }) {
  return [Math.floor(x / CHUNK_SIZE), Math.floor(y / CHUNK_SIZE)];
}

export function getAreaCodeKey(code) {
  return JSON.stringify(code);
}

export function assignToChunk({game, uid, x, y}) {
  const code = getAreaCode({ x, y });
  const key = getAreaCodeKey(code);

  game.chunkAreas = {
    ...game.chunkAreas,
    [key]: {
      code,
      uids: [...(game.chunkAreas[key]?.uids || []), uid ]
    }
  };
  return key;
}

export function addKeysToSurroundingChunks(game) {
  game.expandedChunkAreas = Object.entries(game.chunkAreas)
    .reduce((acc, [key, chunkArea]) => {
      const allUids = getSurroundingAreaCodeKeys(chunkArea.code).flatMap(k => {
        return game.chunkAreas[k]?.uids || [];
      });

      return {
        ...acc,
        [key]: {
          code: chunkArea.code,
          uids: allUids
        }
      }
    }, {});
}

// function getAreaCode({ x, y }) {
//   return [Math.floor(x / screenWidth), Math.floor(y / screenHeight)];
// }

// function getAreaCodeKey([x, y]) {
//   return `(${x}:${y})`;
// }

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

function getSurroundingAreaCodeKeys(areaCode) {
  const [x, y] = areaCode;
  const xLeft = x - 1;
  const xRight = x + 1;
  const yUp = y - 1;
  const yDown = y + 1;
  return [
    getAreaCodeKey([xLeft, yUp]),
    getAreaCodeKey([xLeft, y]),
    getAreaCodeKey([xLeft, yDown]),
    getAreaCodeKey([x, yUp]),
    getAreaCodeKey([x, y]),
    getAreaCodeKey([x, yDown]),
    getAreaCodeKey([xRight, yUp]),
    getAreaCodeKey([xRight, y]),
    getAreaCodeKey([xRight, yDown]),
  ];
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
