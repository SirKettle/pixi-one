import { Application, BitmapText, Container, filters, Graphics } from 'pixi.js';
import { path, pathEq, pathOr, pick, prop, uniq } from 'ramda';

import { destroyAllAssets, getAsset, setAsset } from '../store/pixiAssets';
import {
  subscribe as inputsSubscribe,
  unsubscribe as inputsUnsubscribe,
  onUpdate as onUpdateInputs,
  isButtonUp,
} from '../../input';
import { getLevel, getMissionAssetKeys, getTileAssetKeys } from '../specs/levels';

import { loadAssets } from './loader';
import { handleCollisions } from './collision';
import { createActor, createTile, updateActors, updateTiles } from './actor';

import fontDashDisplay from '../../assets/font/displaydash.xml';
import { updateMission } from './mission';
import { updatePauseScreen } from './pauseScreen';
import {
  toggleMusic,
  setVolume,
  getSettings as getAudioSettings,
  toggleAudio,
} from '../utils/audio';
import { updatePlayer } from './player';
import { updateCamera } from './camera';
import { updateDiscoveredWorld } from './world';

function handleUserInput(pixiGame) {
  if (isButtonUp('q')) {
    pixiGame.handlers.onQuit(pixiGame);
    return;
  }
  if (isButtonUp('p')) {
    pixiGame.handlers.onPauseToggle(pixiGame);
  }
  if (isButtonUp('d')) {
    pixiGame.isDebugDisplayMode = !pixiGame.isDebugDisplayMode;
  }
  if (isButtonUp('c')) {
    pixiGame.isDebugCollsionMode = !pixiGame.isDebugCollsionMode;
  }
  if (isButtonUp('a')) {
    toggleAudio();
  }
  if (isButtonUp('m')) {
    toggleMusic();
  }
  if (isButtonUp('[')) {
    const audioSettings = getAudioSettings();
    console.log(audioSettings);
    setVolume({ music: audioSettings.musicVol - 0.1 });
  }
  if (isButtonUp(']')) {
    const audioSettings = getAudioSettings();
    console.log(audioSettings);
    setVolume({ music: audioSettings.musicVol + 0.1 });
  }
}

const updateState = (pixiGame, delta, deltaMs) => {
  handleUserInput(pixiGame);
  updatePauseScreen(pixiGame);

  const shouldUpdate = pathEq(['time', 'paused'], false);

  if (!shouldUpdate) {
    // return early, but need to to update gamepad/keyboard keys
    onUpdateInputs(deltaMs);
    return;
  }

  const sinVariant = (1 + Math.sin(pixiGame.time.session.elapsedMs / 100)) * 0.5;
  const player = pixiGame.player;
  const level = getLevel(pixiGame.levelKey);

  // 1. Update Actors position
  updateActors(pixiGame.bullets, level, delta, deltaMs, pixiGame);
  updateActors(pixiGame.actors, level, delta, deltaMs, pixiGame);
  updateActors(pixiGame.passiveActors, level, delta, deltaMs, pixiGame);

  // 2. Update player
  updatePlayer({ pixiGame, level, delta, sinVariant });

  // 3. Move parallax backgrounds
  updateTiles(pixiGame.tiles, player.data);

  // 4. Collision detection
  handleCollisions(pixiGame);

  // 5. Move camera to follow Player
  updateCamera(pixiGame);

  // 6. Update inputs keys - ie. reset 'up' buttons
  onUpdateInputs(deltaMs);

  // 7. Update world - spawn new tiles/passive actors
  updateDiscoveredWorld(pixiGame);
};

const addInitialActors = (pixiGame) => {
  const app = getAsset(pixiGame.app);

  // Containers
  const background = new Container();
  const foreground = new Container();
  const world = new Container();
  const worldFar = new Container();
  const worldNear = new Container();
  const dash = new Container();
  pixiGame.containers.background = setAsset(background);
  pixiGame.containers.worldFar = setAsset(worldFar);
  pixiGame.containers.world = setAsset(world);
  pixiGame.containers.worldNear = setAsset(worldNear);
  pixiGame.containers.foreground = setAsset(background);
  pixiGame.containers.dash = setAsset(dash);
  app.stage.addChild(background);
  app.stage.addChild(world);
  world.addChild(worldFar);
  world.addChild(worldNear);
  app.stage.addChild(foreground);
  app.stage.addChild(dash);

  const blurFilter = new filters.BlurFilter();
  pixiGame.filterIds.blur = setAsset(blurFilter);
  world.filters = [blurFilter];
  background.filters = [blurFilter];

  // Add tiles and actors
  pixiGame.tiles = pixiGame.tiles.map(createTile(app, background));

  const dashboardDisplayText = new BitmapText('', {
    font: '20px Digital-7 Mono',
    align: 'left',
  });

  dashboardDisplayText.x = 25;
  dashboardDisplayText.y = 25;
  dashboardDisplayText.alpha = 0.75;
  pixiGame.dashboardDisplayTextId = setAsset(dashboardDisplayText);
  dash.addChild(dashboardDisplayText);

  pixiGame.passiveActors = pixiGame.passiveActors.map(createActor(worldFar));
  pixiGame.actors = pixiGame.actors.map(createActor(worldNear));

  // Player
  const player = createActor(worldNear)({
    ...pixiGame.player,
    x: app.screen.width / 2,
    y: app.screen.height / 2,
    rotation: 0,
    direction: 0,
    distanceFromCenter: 0,
  });

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

export const initPixi = ({ view, gameState, onSaveGame, onSaveAndExitGame, onQuitGame }) => {
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
  const player = mission.player;
  const actors = mission.actors || [];
  const passiveActors = mission.passiveActors || [];
  // }

  // const
  //
  // if (gameState.level) {
  //
  // }

  const pixiGame = {
    isDebugDisplayMode: true,
    isDebugCollsionMode: false,
    id: gameState.id,
    name: gameState.name,
    app: setAsset(app),
    discoveredAreas: {},
    filterIds: {},
    containers: {},
    player,
    passiveActors,
    actors,
    bullets: [],
    tiles: level.tiles,
    levelKey: level.key,
    missionKey: level.missions[0].key,
    time: {
      paused: false,
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
      onPauseToggle: (game) => {
        game.time.paused = !game.time.paused;

        console.log('game is paused?', game.time.paused);
      },
      onQuit: (game) => {
        game.time.paused = true;

        const saveData = {
          ...pick(['id', 'name', 'time'])(game),
          player: { ...prop('data')(game.player) },
          actors: game.actors.map(prop('data')),
          passiveActors: game.passiveActors.map(prop('data')),
          bullets: game.bullets.map(prop('data')),
          level: { ...game.level },
        };

        onSaveGame(saveData);

        // remove event listeners
        inputsUnsubscribe();

        // clean up Pixi
        // getAsset(game.app).destroy();

        // update the react app
        onQuitGame();

        setTimeout(destroyAllAssets, 0);
      },
    },
  };

  window.pixiGame = pixiGame;

  const gameLoop = (delta) => {
    const deltaMs = app.ticker.elapsedMS;
    pixiGame.time = updateMission(pixiGame, delta, deltaMs, app.ticker);
    updateState(pixiGame, delta, deltaMs);
  };

  app.loader.add('fontDisplay', fontDashDisplay);

  app.loader.load(() => {
    loadAssets({
      loader: app.loader,
      assetKeys: uniq(['bullet'].concat(getMissionAssetKeys(levelKey, missionKey))),
      tileAssetKeys: getTileAssetKeys(levelKey),
    }).then(() => {
      addInitialActors(pixiGame);
      app.ticker.add(gameLoop);
    });
  });
};

export function loadLevel({ app, levelKey }) {
  // show loading screen
  // load assets which haven't been loaded
  // onLoad set screen to play
  // clear canvas / destroy assets?? - perhaps have some assets which can not be
  // destroyed or do not store those ones at all - just create them normally
}

export const SCREEN_LOADING = 'SCREEN_LOADING';
export const SCREEN_NEW_GAME = 'SCREEN_NEW_GAME';
export const SCREEN_LEVEL_SELECT = 'SCREEN_LEVEL_SELECT';
export const SCREEN_LEVEL_INTRO = 'SCREEN_LEVEL_INTRO';
export const SCREEN_MISSION_INFO = 'SCREEN_MISSION_INFO'; // (use as pause too?)
export const SCREEN_PLAY = 'SCREEN_PLAY';

// Level flow
// 1. Loading game screen - initial assets needed for start/level choosing screens
// 2. Start new game / load game screen
// 3. Choose level screen
// 4. Loading screen - (Load assets for level - getLevelAssetKeys - for all missions)
// 5. Launch new level screen
// 6. Level screen - show level story - story read aloud in funny voice
// 7. Show mission screen - kind of like pause (could be the same screen?)
// 8. Play mission
// 9. On complete mission - show mission screen again - repeat until onComplete all missions
// 10. Show next level screen?

// export function goto(screen) {
//   switch (screen) {
//     case S
//
//   }
// }
