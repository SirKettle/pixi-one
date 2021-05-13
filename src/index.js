import { Application, BitmapText, Container, filters, Graphics } from 'pixi.js';
import { isButtonUp, onUpdate as onUpdateInputs, subscribe as inputsSubscribe } from './input';
import {
  addGamepad as addVirtualGamepad,
  removeGamepad as removeVirtualGamepad,
} from './input/virtualGamepad';
import fontDashDisplay from './assets/font/digital7_mono_white.xml';
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
import { GREEN, ORANGE, YELLOW } from './constants/color';
import { adjustMusicVolume, toggleMusic, toggleSound } from './sound';
import { getDimensions, getIsMobile, isTouchDevice } from './utils/device';

const gameEl = document.getElementById('game');

function navigate(game) {
  removeVirtualGamepad(game);
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
      addVirtualGamepad(game);
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
    game.settings.isDebugCollisionMode = !game.settings.isDebugCollisionMode;
  }
  if (isButtonUp('a')) {
    toggleSound();
  }
  if (isButtonUp('m')) {
    toggleMusic();
  }
  if (isButtonUp('[')) {
    adjustMusicVolume(-0.1);
  }
  if (isButtonUp(']')) {
    adjustMusicVolume(0.1);
  }
}

// always runs - decides which update functions to call
function mainLoop(game, ticker, delta) {
  const deltaMs = ticker.elapsedMS;
  const { screen } = game;
  const screenChange = screen !== game.prevScreen;

  game.tickCount = game.tickCount + 1;
  if (game.tickCount > 59999) {
    game.tickCount = 0;
  }

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

  const objectivesDisplayText = new BitmapText('', {
    font: '20px Digital-7 Mono',
    align: 'left',
    tint: YELLOW,
  });

  objectivesDisplayText.anchor.set(0, 0);
  objectivesDisplayText.position.set(app.screen.width - 400, 120);
  objectivesDisplayText.maxWidth = 350;
  objectivesDisplayText.alpha = 0.75;
  game.objectivesDisplayTextId = setAsset(objectivesDisplayText);
  dash.addChild(objectivesDisplayText);

  // Dash - Instruments, radars, dashboard etc
  const nearestTarget = new Graphics();
  world.addChild(nearestTarget);
  game.dash = {
    nearestTargetId: setAsset(nearestTarget),
  };
}

function onPauseToggle(game) {
  const currentPauseState = game.time.paused;

  if (currentPauseState === true) {
    // we're about to unpause the game, for now temporarily, we
    // will mark all objectives "as read" here
    // console.log('set all objectives to read as we unpause the game');
    game.objectives = game.objectives.map((o) => ({ ...o, isRead: true }));
  }
  game.time.paused = !currentPauseState;
}

function resetShared(game) {
  const container = getAsset(game.containers.info);
  container.removeChildren();
  const dashboardDisplayText = getAsset(game.dashboardDisplayTextId);
  dashboardDisplayText.text = '';
  const objectivesDisplayText = getAsset(game.objectivesDisplayTextId);
  objectivesDisplayText.text = '';

  const graphic = getAsset(game.dash.nearestTargetId);
  graphic.clear();
}

function onQuit(game, screen = SCREEN_NEW_GAME) {
  game.time.paused = true;

  setTimeout(() => {
    resetShared(game);
    destroyAllAssets();
    goTo(_game, screen);
  }, 0);
}

export function initialise(gameEl) {
  inputsSubscribe();

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const isLandscape = windowWidth > windowHeight;

  const dimensions = getDimensions();
  const isMobile = getIsMobile();
  //
  // const dimensions = {
  //   width: 750,
  //   height: 350,
  // };

  if (!isLandscape && isTouchDevice()) {
    window.alert('Please rotate your screen to landscape');
  }

  // master game object
  const _game = {
    dimensions,
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
      isDebugCollisionMode: false,
    },
    handlers: {
      onPauseToggle,
      onQuit,
    },
    tickCount: 0,
  };

  const wrapperEl = document.getElementById('gameWrapper');
  wrapperEl.style.width = `${dimensions.width}px`;
  wrapperEl.style.height = `${dimensions.height}px`;

  const app = new Application({
    view: gameEl,
    // width: window.innerWidth / window.devicePixelRatio,
    // height: window.innerHeight / window.devicePixelRatio,
    // resolution: window.devicePixelRatio,
    resolution: window.devicePixelRatio,
    autoDensity: true,
    width: dimensions.width * (isMobile ? 2 : 1),
    height: dimensions.height * (isMobile ? 2 : 1),
  });

  if (isMobile) {
    gameEl.style.transform = 'scale(0.5)';
  }

  _game.app = setAsset(app);

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

  // TODO: mobile
  // function onScreenResize() {
  //   app.resize();
  //   _game.prevScreen = null;
  //   // _game.screen = SCREEN_NEW_GAME;
  //   resetShared(_game);
  // }
  //
  // window.addEventListener('resize', () => {
  //   // if (!isTouchDevice()) {
  //   setTimeout(onScreenResize, 200);
  //   // }
  // });
  // window.addEventListener('orientationchange', () => {
  //   // if (isTouchDevice()) {
  //   // if (window.confirm('Changing orientation resets game?')) {
  //   setTimeout(onScreenResize, 200);
  //   // }
  //   // }
  // });
}

logGameCredits();
initialise(gameEl);
