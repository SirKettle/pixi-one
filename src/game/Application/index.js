import { Application, Container } from 'pixi.js';
import { prop } from 'ramda';

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
  isButtonDown,
} from '../../input';

import {
  applyThrusters,
  movePlayer,
  updateActors,
  updateTexture,
  updateTilePosition,
} from './sprite';
import { loadAssets } from './loader';
import {
  getActorDamage,
  getSpriteRadius,
  handleCollisions,
  isCollision,
} from './collision';
import { createActor, createTile, initActor } from './actor';
import { generateBulletData } from '../specs/bullets';
import { getLevel, getTileAssetKeys } from '../specs/levels';

const updateTime = (pixiGame, delta) => {
  const prevSession = pixiGame.time.session;
  const elapsedMs =
    prevSession.elapsedMs + getAsset(pixiGame.app).ticker.elapsedMS;
  const elapsedS = Math.floor(elapsedMs / 1000);

  if (elapsedS !== prevSession.elapsedS && elapsedS % 5 === 0) {
    console.log('every 5 sec save');
    // onSaveGame(state);
  }

  if (elapsedS !== prevSession.elapsedS && elapsedS === 22) {
    console.log('time up - to save and exit');
    // onSaveAndExitGame(state);
  }

  return {
    ...pixiGame.time,
    session: {
      elapsedMs,
      elapsedS,
    },
  };
};

const updateState = (pixiGame, delta) => {
  if (isButtonUp('q')) {
    pixiGame.handlers.onQuit();
    return;
  }

  const sinVariant =
    (1 + Math.sin(pixiGame.time.session.elapsedMs / 100)) * 0.5;
  const world = getAsset(pixiGame.containers.world);
  const player = pixiGame.player;
  const playerSprite = getAsset(player.spriteId);

  // 1. Update Actors position
  updateActors(pixiGame.bullets, delta);
  updateActors(pixiGame.actors, delta);
  updateActors(pixiGame.passiveActors, delta);

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
    player.data.rotation += turnThruster * 0.1 * delta;
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

  movePlayer(player, delta);

  // 3. fire weapon
  const firePower = Math.min(1, getButtonPressedMs(FIRE_ONE) / 500);
  if (isButtonUp(FIRE_ONE)) {
    console.log('Fire', firePower);
    const newBullet = createActor(world)(generateBulletData(player, firePower));
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
  const circleGraphic = getAsset(player.circleGraphicId);

  circleGraphic.clear();
  circleGraphic.lineStyle(lineWidth, 0x00aaff, firePower * 0.3);
  circleGraphic.beginFill(0xffffff, 0);
  circleGraphic.drawCircle(
    player.data.x,
    player.data.y,
    spriteRadius * 1.6 + lineWidth - sinVariant
  );
  circleGraphic.endFill();

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

  onUpdateInputs(getAsset(pixiGame.app).ticker.elapsedMS);
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
  pixiGame.passiveActors = pixiGame.passiveActors.map(createActor(world));
  pixiGame.actors = pixiGame.actors.map(createActor(world));

  // Player
  pixiGame.player = initActor({
    assetKey: 'spacecraft',
    overrides: {
      assetKey: 'spacecraft',
      x: app.screen.width / 2,
      y: app.screen.height / 2,
      rotation: 0,
      direction: 0,
      life: 3,
    },
  });

  const playerSprite = getAsset(pixiGame.player.spriteId);
  world.addChild(getAsset(pixiGame.player.circleGraphicId));
  world.addChild(playerSprite);
  world.position.set(app.screen.width / 2, app.screen.height / 2);
  world.pivot.copyFrom(playerSprite.position);
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
  const actors = mission.actors;
  const passiveActors = mission.passiveActors;
  // }

  // const
  //
  // if (gameState.level) {
  //
  // }

  const pixiGame = {
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
          player: { ...prop('data')(pixiGame.player) },
          actors: pixiGame.actors.map(prop('data')),
          passiveActors: pixiGame.passiveActors.map(prop('data')),
          bullets: pixiGame.bullets.map(prop('data')),
          level: { ...pixiGame.level },
          time: { ...pixiGame.time },
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
    pixiGame.time = updateTime(pixiGame, delta);
    updateState(pixiGame, delta);
  };

  app.loader.load(() => {
    loadAssets({
      loader: app.loader,
      assetKeys: [
        'spacecraft',
        'bullet',
        'planetGreen',
        'planetSandy',
        'starSun',
      ],
      tileAssetKeys: getTileAssetKeys(levelKey),
    }).then(() => {
      addInitialActors(pixiGame);
      app.ticker.add(gameLoop);
    });
  });
};
