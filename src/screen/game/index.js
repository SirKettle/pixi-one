import { pathEq } from 'ramda';
import { Graphics } from 'pixi.js';
import { getAsset } from '../../utils/assetStore';
import { getVelocitySpeed } from '../../utils/physics';
import { clearDash, dashLog, elapsedTime, logMeter, startTimer } from '../../utils/dash';
import { createActor, createTile, updateActors, updateActorsAi, updateTiles } from './actor';
import { updatePauseScreen } from './pauseScreen';
import { getLevel } from '../../levels';
import { updatePlayer } from './player';
import { handleCollisions, getUniqCollisionPairsB, getUniqCollisionPairsC } from './collision';
import { updateCamera } from './camera';
import { updateDiscoveredWorld, addKeysToSurroundingChunks } from './world';
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
  game.actorMap = Object.entries(game.actorMap).reduce((acc, [uid, data]) => ({
    ...acc,
    [uid]: createActor(worldNear)({ ...data, uid })
  }), {});

  game.player = createActor(worldNear)({
    ...game.player,
    x: app.screen.width / 2,
    y: app.screen.height / 2,
    rotation: 0,
    direction: 0,
    distanceFromCenter: 0,
  });
  const graphic = new Graphics();
  worldNear.addChild(graphic);
  game.player.graphicId = setAsset(graphic, { removable: true });

  game.time.paused = false;

  // reset world position/pivot
  // Update world container
  world.position.set(app.screen.width / 2, app.screen.height / 2);
  world.pivot.x = game.player.data.x;
  world.pivot.y = game.player.data.y;
}

export function onUpdate(game, delta, deltaMs) {
  const app = getAsset(game.app);
  startTimer('game.onUpdate');

  const graphic = getAsset(game.dash.nearestTargetId);
  graphic.clear();


  startTimer('updateMission');
  updateMission(game, delta, deltaMs);
  updatePauseScreen(game);
  const updateMissionTime = elapsedTime('updateMission');

  const shouldUpdate = pathEq(['time', 'paused'], false)(game);

  if (!shouldUpdate) {
    return;
  }
  clearDash();


  startTimer('objectives')
  const sinVariant = (1 + Math.sin(game.time.session.elapsedMs / 100)) * 0.5;
  updateObjectives(game, delta, deltaMs, sinVariant);
  const updateObjectivesTime = elapsedTime('objectives');

  game.chunkAreas = {};
  game.expandedChunkAreas = {};


  const player = game.player;
  const level = getLevel(game.levelKey);

  const { actorMap, bulletMap } = game;

  const playerGraphic = getAsset(game.player.graphicId);
  playerGraphic.clear();


  startTimer('actors');
  // 1. Update Actors position
  updateActors({ actorMap: bulletMap, level, delta, game });
  updateActors({ actorMap, level, delta, game });
  // updateActors(game.passiveActors, level, delta, game);
  // updateActors(game.particles, level, delta, game);
  const updateActorsTime = elapsedTime('actors');
  
  startTimer('player');
  // 2. Update player
  updatePlayer({ game, level, delta, deltaMs, sinVariant });
  const updatePlayerTime = elapsedTime('player');

  // 3. Move parallax backgrounds
  updateTiles(game.tiles, player.data);

  // TODO:
  // 1. calculate outerchunks by adding all chunks data into their surrounding chunks
  // 2. add count('collision') method and clearCounts/getCounts
  // 3. collision - use slice(index) on inner loop??
  // 4. draw collision lines (arrows if poss)
  // 5. draw nearest target lines (arrows if poss)

  addKeysToSurroundingChunks(game);

  startTimer('ai');
  updateActorsAi({ actorMap, delta, deltaMs, game });
  const aiTime = elapsedTime('ai');
  
  // 4. Collision detection
  startTimer('collision');
  handleCollisions(game, game.collisionMode);
  const collisionTime = elapsedTime('collision');
  // 4. Collision detection
  // startTimer('getUniqCollisionPairsB');
  // const bPairs = getUniqCollisionPairsB(game).length;
  // const collisionTimeB = elapsedTime('getUniqCollisionPairsB');
  // // 4. Collision detection
  // startTimer('getUniqCollisionPairsC');
  // const cPairs = getUniqCollisionPairsC(game).length;
  // const collisionTimeC = elapsedTime('getUniqCollisionPairsC');
  // dashLog('bPairs', bPairs);
  // dashLog('cPairs', cPairs);

  // getCollisionMetrics(game).then(res => {
  //   console.log(JSON.stringify(res))//, null, 2))
  // });

  const chunkAreaCount = Object.keys(game.expandedChunkAreas).length;
  
  // 5. Move camera to follow Player
  updateCamera(game);
  
  // 6. Update world - spawn new tiles/passive actors
  updateDiscoveredWorld(game);
  
  const gameUpdateTime = elapsedTime('game.onUpdate');

  // dashLog('chunk areas', chunkAreaCount);
  logMeter({key: '.......F.P.S.', value: Math.floor(app.ticker.FPS), max: 75, steps: 20, desiredMax: 60 });
  // dashLog('delta', delta);
  // dashLog('deltaMs', deltaMs);
  logMeter({key: '.....Delta MS', value: deltaMs, label: Math.round(deltaMs), max: 48, steps: 20, desiredMax: 16 });
  logMeter({key: '........Delta', value: delta, label: new Intl.NumberFormat('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(delta), max: 3, steps: 20, desiredMax: 1 });
  logMeter({key: '....Game loop', value: gameUpdateTime, max: 20, steps: 20, desiredMax: 16 });
  // logMeter({key: '...Collisions', value: collisionTime, max: 20, steps: 20, desiredMax: 5 });
  // logMeter({key: '...........AI', value: aiTime, max: 20, steps: 20, desiredMax: 4 });
  // logMeter({key: '......Mission', value: updateMissionTime, max: 20, steps: 20 })
  // logMeter({key: '...Objectives', value: updateObjectivesTime, max: 20, steps: 20 })
  // logMeter({key: '.......Player', value: updatePlayerTime, max: 20, steps: 20 })
  // logMeter({key: '.......Actors', value: updateActorsTime, max: 20, steps: 20 })
  logMeter({key: '........Speed', value: Math.floor(getVelocitySpeed(player.data.velocity)), max: 32, steps: 20, desiredMax: 10 }); 

  // logMeter({key: 'Collisions(B)', value: collisionTimeB, max: 16, steps: 32, desiredMax: 5 });
  // logMeter({key: 'Collisions(C)', value: collisionTimeC, max: 16, steps: 32, desiredMax: 5 });

  if (game.tickCount % 200 === 0) {
    // console.log('do around every 3 seconds ticks', game.tickCount);
    getCollisionMetrics(game).then(res => {
      // console.log(JSON.stringify(res))
      // console.log(res[0].key + ' is the fastest', res[0].executionTime);
      // console.log(res[1].key + ' is the slowest', res[1].executionTime);
      game.collisionMode = res[0].key;
    })
  }

}

function getCollisionMetrics(game) {
  return new Promise((resolve) => {
    startTimer('getUniqCollisionPairsBTest');
    const bPairs = getUniqCollisionPairsB(game).length;
    const collisionTimeB = elapsedTime('getUniqCollisionPairsBTest');
    // 4. Collision detection
    startTimer('getUniqCollisionPairsCTest');
    const cPairs = getUniqCollisionPairsC(game).length;
    const collisionTimeC = elapsedTime('getUniqCollisionPairsCTest');
    resolve([{
      key: 'spacial',
      pairs: bPairs,
      executionTime: collisionTimeB
    }, {
      key: 'simple',
      pairs: cPairs,
      executionTime: collisionTimeC
    }].sort((a,b)=> a.executionTime > b.executionTime ? 1 : -1));
  });
}