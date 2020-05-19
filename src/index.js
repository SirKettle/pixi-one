import { Application, BitmapText, Container, filters, Graphics } from 'pixi.js';
import { isButtonUp, onUpdate as onUpdateInputs, subscribe as inputsSubscribe } from './input';
import fontDashDisplay from './assets/font/displaydash.xml';
import { logGameCredits } from './utils/log';
import { destroyAllAssets, getAsset, setAsset } from './utils/assetStore';
import {
  goTo,
  SCREEN_LEVEL_INTRO,
  SCREEN_LEVEL_SELECT,
  SCREEN_LOADING,
  SCREEN_NEW_GAME,
  SCREEN_PLAY,
} from './utils/screen';
import { showLoading } from './screen/loading';
import { showNewGame } from './screen/newGame';
import { showLevelSelect } from './screen/levelSelect';
import { onUpdate as onUpdateLevelIntro, showLevelIntro } from './screen/levelIntro';
import { showPlay, onUpdate as onUpdatePlay } from './screen/game';
import {
  getSettings as getAudioSettings,
  setVolume,
  toggleAudio,
  toggleMusic,
} from './utils/audio';
import { GREEN } from './constants/color';

const gameEl = document.getElementById('game');

function navigate(game) {
  console.log('navigate to', game.screen);
  switch (game.screen) {
    case SCREEN_LOADING:
      return showLoading(game);
    case SCREEN_NEW_GAME:
      return showNewGame(game);
    case SCREEN_LEVEL_SELECT:
      return showLevelSelect(game);
    case SCREEN_LEVEL_INTRO:
      return showLevelIntro(game);
    case SCREEN_PLAY:
      return showPlay(game);
    default:
      console.warn('Screen not found', game.screen);
  }
}

function handleUserInput(game) {
  if (isButtonUp('q')) {
    game.handlers.onQuit(game);
    return;
  }
  if (isButtonUp('p')) {
    game.handlers.onPauseToggle(game);
  }
  if (isButtonUp('d')) {
    game.settings.isDebugDisplayMode = !game.settings.isDebugDisplayMode;
  }
  if (isButtonUp('c')) {
    game.settings.isDebugCollsionMode = !game.settings.isDebugCollsionMode;
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

// always runs - decides which update functions to call
function mainLoop(game, ticker, delta) {
  const deltaMs = ticker.elapsedMS;
  const { screen } = game;
  const screenChange = screen !== game.prevScreen;

  handleUserInput(game);

  if (screenChange) {
    navigate(game);
    game.prevScreen = screen;
  }

  switch (screen) {
    case SCREEN_PLAY:
      onUpdatePlay(game, delta, deltaMs);
      break;
    case SCREEN_LEVEL_INTRO:
      onUpdateLevelIntro(game, delta, deltaMs);
      break;
    default:
      break;
  }

  // 6. Update inputs keys - ie. reset 'up' buttons
  onUpdateInputs(deltaMs);
}

function initStage(game) {
  const app = getAsset(game.app);

  // Game Containers
  const background = new Container();
  const foreground = new Container();
  const world = new Container();
  const worldFar = new Container();
  const worldNear = new Container();
  const dash = new Container();
  // Non game containers
  const info = new Container();

  game.containers.background = setAsset(background);
  game.containers.worldFar = setAsset(worldFar);
  game.containers.world = setAsset(world);
  game.containers.worldNear = setAsset(worldNear);
  game.containers.foreground = setAsset(background);
  game.containers.dash = setAsset(dash);
  game.containers.info = setAsset(info);
  app.stage.addChild(background);
  app.stage.addChild(world);
  world.addChild(worldFar);
  world.addChild(worldNear);
  app.stage.addChild(foreground);
  app.stage.addChild(dash);
  app.stage.addChild(info);

  const blurFilter = new filters.BlurFilter();
  game.filterIds.blur = setAsset(blurFilter);
  world.filters = [blurFilter];
  background.filters = [blurFilter];
  blurFilter.blur = 0;

  const dashboardDisplayText = new BitmapText('', {
    font: '20px Digital-7 Mono',
    align: 'left',
    tint: GREEN,
  });

  dashboardDisplayText.x = 25;
  dashboardDisplayText.y = 25;
  dashboardDisplayText.alpha = 0.75;
  game.dashboardDisplayTextId = setAsset(dashboardDisplayText);
  dash.addChild(dashboardDisplayText);

  // Dash - Instruments, radars, dashboard etc
  const nearestTarget = new Graphics();
  world.addChild(nearestTarget);
  game.dash = {
    nearestTargetId: setAsset(nearestTarget),
  };
}

function onPauseToggle(game) {
  game.time.paused = !game.time.paused;
}

function onQuit(game) {
  game.time.paused = true;
  goTo(_game, SCREEN_NEW_GAME);

  setTimeout(() => {
    destroyAllAssets();
  }, 0);
  // update screen
}

export function initialise(gameEl) {
  inputsSubscribe();

  const app = new Application({
    view: gameEl,
    // width: window.innerWidth / window.devicePixelRatio,
    // height: window.innerHeight / window.devicePixelRatio,
    // resolution: window.devicePixelRatio,
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: 1,
    resizeTo: document.body,
  });

  // master game object
  const _game = {
    app: setAsset(app),
    discoveredAreas: {},
    filterIds: {},
    containers: {},
    passiveActors: [],
    actors: [],
    bullets: [],
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
    settings: {
      isDebugDisplayMode: true,
      isDebugCollsionMode: false,
    },
    handlers: {
      onPauseToggle,
      onQuit,
    },
  };

  // todo: remove - just for debugging
  window._game = _game;

  // load basics for SCREEN_NEW_GAME - maybe change to LOADING screen first?
  app.loader.add('fontDisplay', fontDashDisplay);

  app.loader.load(() => {
    // add required base assets shared for all screens
    initStage(_game);
    // set start screen
    goTo(_game, SCREEN_NEW_GAME);
    // start the game loop!
    app.ticker.add((delta) => mainLoop(_game, app.ticker, delta));
  });
}

logGameCredits();
initialise(gameEl);
