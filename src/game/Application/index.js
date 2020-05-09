import { Application, BitmapText, Container, Graphics } from 'pixi.js';
import { path, pathOr, pick, prop, uniq } from 'ramda';

import { getAsset, setAsset } from '../store/pixiAssets';
import {
  subscribe as inputsSubscribe,
  unsubscribe as inputsUnsubscribe,
  onUpdate as onUpdateInputs,
  isButtonUp,
  FIRE_ONE,
  getButtonPressedMs,
  getForwardThruster,
  getReverseThruster,
  getTurnThruster,
  getStrafeThruster,
} from '../../input';
import { generateBulletData } from '../specs/bullets';
import {
  getLevel,
  getMissionAssetKeys,
  getTileAssetKeys,
  levels,
} from '../specs/levels';
import { updateTexture } from '../store/textures';

import { loadAssets } from './loader';
import { handleCollisions } from './collision';
import {
  applyThrusters,
  createActor,
  createTile,
  updateActorPosition,
  updateActors,
  updateTilePosition,
} from './actor';
import { getSpriteRadius } from '../utils/actor';
import { normalizeDirection } from '../utils/physics';
import { drawCircle } from '../utils/graphics';
import { getSpecs } from '../specs/getSpecs';

import displaydashFont from '../../assets/font/displaydash.xml';

const updateTime = (pixiGame, delta, deltaMs, ticker) => {
  const prevSession = pixiGame.time.session;
  const elapsedMs = prevSession.elapsedMs + deltaMs;
  const elapsedS = Math.floor(elapsedMs / 1000);

  if (elapsedS !== prevSession.elapsedS) {
    // onSaveGame(state);
  }
  pixiGame.dashboardDisplayText.text = `
    Mission time: ${elapsedS}
    
    deltaMs: ${Math.floor(deltaMs)}
    
    FPS: ${Math.floor(ticker.FPS)}`;
  //
  // if (elapsedS !== prevSession.elapsedS && elapsedS === 22) {
  //   console.log('time up - to save and exit');
  //   // onSaveAndExitGame(state);
  // }

  return {
    ...pixiGame.time,
    session: {
      elapsedMs,
      elapsedS,
    },
  };
};

const updateState = (pixiGame, delta, deltaMs) => {
  if (isButtonUp('q')) {
    pixiGame.handlers.onQuit();
    return;
  }
  if (isButtonUp('d')) {
    pixiGame.isDebugMode = !pixiGame.isDebugMode;
  }

  const sinVariant =
    (1 + Math.sin(pixiGame.time.session.elapsedMs / 100)) * 0.5;
  const world = getAsset(pixiGame.containers.world);
  const player = pixiGame.player;
  const playerSpecs = getSpecs(player.assetKey);
  const playerSprite = getAsset(player.spriteId);

  // 1. Update Actors position
  const level = getLevel(pixiGame.levelKey);
  updateActors(pixiGame.bullets, level, delta, deltaMs, pixiGame);
  updateActors(pixiGame.actors, level, delta, deltaMs, pixiGame);
  updateActors(pixiGame.passiveActors, level, delta, deltaMs, pixiGame);

  // 2. Handle user interactions (Keyboard / mouse / touch)
  // a) turn thrusters to rotate player
  const turnThruster = getTurnThruster();
  const minTurnThrust = 0.3;
  const hardTurnThrust = 0.9; // just for texture frame;
  const isTurning = Math.abs(turnThruster) > minTurnThrust;
  if (isTurning) {
    const isHardTurn = Math.abs(turnThruster) > hardTurnThrust;
    const leftTurn = turnThruster < 0;
    if (leftTurn) {
      updateTexture(player, isHardTurn ? 'hardLeft' : 'left');
    } else {
      updateTexture(player, isHardTurn ? 'hardRight' : 'right');
    }
    // todo: replace hard coded turn speed with settings/data
    player.data.rotation = normalizeDirection(
      player.data.rotation +
        turnThruster * 0.1 * delta * pathOr(1, ['thrust', 'turn'])(playerSpecs)
    );
    playerSprite.rotation = player.data.rotation;
  } else {
    updateTexture(player, 'DEFAULT');
  }

  // b) thrusters to move player
  applyThrusters({
    actor: player,
    delta,
    thrustDirection: 'forward',
    forward: getForwardThruster() - getReverseThruster(),
    side: getStrafeThruster(),
  });

  updateActorPosition(player, level, delta);

  // 3. fire weapon
  const firePower = Math.min(1, getButtonPressedMs(FIRE_ONE) / 500);
  if (isButtonUp(FIRE_ONE)) {
    console.log('Fire', firePower);
    const newBullet = createActor(world)(
      generateBulletData({ host: player, hostFirePower: firePower })
    );
    // debugger;
    pixiGame.bullets.push(newBullet);
  }

  // 4. Move parallax backgrounds
  pixiGame.tiles.forEach(({ data, spriteId }) => {
    updateTilePosition({ data, spriteId, offsetPoint: playerSprite.position });
    if (data.assetKey === 'parallax0' || data.assetKey === 'parallax1') {
      // oscillate the alpha of the grid tiles
      getAsset(spriteId).alpha = (0.7 + 0.3 * sinVariant) * (data.alpha || 1);
    }
  });

  // 5. Collision detection
  handleCollisions(pixiGame);

  const spriteRadius = getSpriteRadius(playerSprite);
  const lineWidth = firePower * spriteRadius + sinVariant * 5;

  drawCircle({
    graphicId: player.graphicId,
    lineWidth,
    lineColor: 0x00aaff,
    lineAlpha: firePower * 0.3,
    x: path(['data', 'x'])(player),
    y: path(['data', 'y'])(player),
    radius: spriteRadius * 1.6 + lineWidth - sinVariant,
  });

  // 6. Move camera to follow Player
  world.pivot.x = player.data.x;
  world.pivot.y = player.data.y;

  // LERP it
  // world.pivot.x += (player.data.x - world.pivot.x) * 0.2;
  // world.pivot.y += (player.data.y - world.pivot.y) * 0.2;

  // // const alwaysFaceFrontMode = false;
  // const alwaysFaceFrontMode = true;
  // if (alwaysFaceFrontMode) {
  //   // keep the player facing up
  //   world.rotation = 0 - playerSprite.rotation;
  // }

  onUpdateInputs(deltaMs);
};

const addInitialActors = (pixiGame) => {
  const app = getAsset(pixiGame.app);

  // Containers
  const background = new Container();
  const world = new Container();
  pixiGame.containers.background = setAsset(background);
  pixiGame.containers.world = setAsset(world);
  app.stage.addChild(background);
  app.stage.addChild(world);

  // Add tiles and actors
  pixiGame.tiles = pixiGame.tiles.map(createTile(app, background));

  pixiGame.dashboardDisplayText = new BitmapText('', {
    font: '20px Digital-7 Mono',
    align: 'left',
  });

  pixiGame.dashboardDisplayText.x = 25;
  pixiGame.dashboardDisplayText.y = 25;

  background.addChild(pixiGame.dashboardDisplayText);

  pixiGame.passiveActors = pixiGame.passiveActors.map(createActor(world));
  pixiGame.actors = pixiGame.actors.map(createActor(world));

  // Player
  const player = createActor(world)({
    team: 'good',
    assetKey: 'xWing',
    x: app.screen.width / 2,
    y: app.screen.height / 2,
    rotation: 0,
    direction: 0,
  });
  // const player = createActor(world)({
  //   team: 'bad',
  //   assetKey: 'tCraft',
  //   x: app.screen.width / 2,
  //   y: app.screen.height / 2,
  //   rotation: 0,
  //   direction: 0,
  // });

  pixiGame.player = player;

  // Dash - Instruments, radars, dashboard etc
  const nearestTarget = new Graphics();
  world.addChild(nearestTarget);
  pixiGame.dash = {
    nearestTargetId: setAsset(nearestTarget),
  };

  // Update world container
  world.position.set(app.screen.width / 2, app.screen.height / 2);
  world.pivot.copyFrom(getAsset(player.spriteId).position);
};

export const initPixi = ({
  view,
  gameState,
  onSaveGame,
  onSaveAndExitGame,
  onQuitGame,
}) => {
  // const store = { ...gameState }; // initial state (perhaps from a loaded game)

  inputsSubscribe();

  const app = new Application({
    view,
    // width: window.innerWidth / window.devicePixelRatio,
    // height: window.innerHeight / window.devicePixelRatio,
    // resolution: window.devicePixelRatio,
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: 1,
  });

  // Mutable game objects

  // name: "noob"
  // id: "915eced1-dd30-4b78-ba74-f38033417eee"
  // modifiedDate: "2020-05-01T20:18:31.072Z"
  // startDate: "2020-05-01T20:18:31.072Z"
  console.log(gameState);

  const isNewGame = gameState.modifiedDate === gameState.startDate;

  // const levelData = getLevel(pathOr('space_1', ['level', 'key'])(gameState));
  // const levelData = getLevel(pathOr('space_1', ['level', 'key'])(gameState));

  // const initialGameData = {
  //   ...gameState,
  //   ...{isNewGame? }
  // }

  // if (isNewGame) {

  const levelKey = 'space_1';
  const level = getLevel(levelKey);
  const mission = level.missions[0];
  const missionKey = mission.key;
  const actors = mission.actors || [];
  const passiveActors = mission.passiveActors || [];
  // }

  // const
  //
  // if (gameState.level) {
  //
  // }

  const pixiGame = {
    isDebugMode: false,
    id: gameState.id,
    name: gameState.name,
    app: setAsset(app),
    containers: {},
    player: {},
    passiveActors,
    actors,
    bullets: [],
    tiles: level.tiles,
    levelKey: level.key,
    missionKey: level.missions[0].key,
    time: {
      session: {
        elapsedMs: 0,
        elapsedS: 0,
      },
      mission: {
        elapsedMs: 0,
        elapsedS: 0,
      },
    },
    handlers: {
      onQuit: () => {
        const saveData = {
          ...pick(['id', 'name', 'time'])(pixiGame),
          player: { ...prop('data')(pixiGame.player) },
          actors: pixiGame.actors.map(prop('data')),
          passiveActors: pixiGame.passiveActors.map(prop('data')),
          bullets: pixiGame.bullets.map(prop('data')),
          level: { ...pixiGame.level },
        };

        onSaveGame(saveData);

        // remove event listeners
        inputsUnsubscribe();

        // clean up Pixi
        getAsset(pixiGame.app).destroy();

        // update the react app
        onQuitGame();
      },
    },
  };

  window.pixiGame = pixiGame;

  const gameLoop = (delta) => {
    const deltaMs = app.ticker.elapsedMS;
    pixiGame.time = updateTime(pixiGame, delta, deltaMs, app.ticker);
    updateState(pixiGame, delta, deltaMs);
  };

  app.loader.add('dashfont', displaydashFont);

  app.loader.load(() => {
    loadAssets({
      loader: app.loader,
      assetKeys: uniq(
        ['spacecraft', 'bullet'].concat(
          getMissionAssetKeys(levelKey, missionKey)
        )
      ),
      tileAssetKeys: getTileAssetKeys(levelKey),
    }).then(() => {
      addInitialActors(pixiGame);
      app.ticker.add(gameLoop);
    });
  });
};
