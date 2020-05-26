import { BitmapText } from 'pixi.js';
import { getAsset } from '../utils/assetStore';
import { getLevel } from '../levels';
import { goTo, SCREEN_PLAY } from '../utils/screen';
import { textButton } from '../utils/button';
import { pathOr } from 'ramda';
import { playSingleSound, playTracks } from '../sound';
import { onResetText, onUpdateText } from '../utils/animateText';
import { GREEN, ORANGE, YELLOW } from '../constants/color';
import { stopSound } from '../utils/audio';

let bitmapText;

export function showLevelIntro(game) {
  const app = getAsset(game.app);
  const container = getAsset(game.containers.info);
  const level = getLevel(game.levelKey);
  // todo - get rid of this text - only create in the game screen
  // Each screen should have it's own text and remove children after each goto
  const dashboardDisplayText = getAsset(game.dashboardDisplayTextId);
  dashboardDisplayText.text = '';

  const titleText = new BitmapText(`${level.title}`, {
    font: '38px Digital-7 Mono',
    align: 'center',
    tint: GREEN,
  });

  bitmapText = new BitmapText(level.description, {
    font: '25px Digital-7 Mono',
    align: 'left',
    tint: GREEN,
  });

  titleText.anchor.set(0.5, 0);
  titleText.position.set(app.screen.width / 2, 50);
  titleText.maxWidth = app.screen.width - 100;
  container.addChild(titleText);
  bitmapText.anchor.set(0, 0);
  bitmapText.position.set(50, 120);
  bitmapText.maxWidth = app.screen.width - 100;
  bitmapText.alpha = 0.75;
  container.addChild(bitmapText);

  const skipButton = textButton(`Skip\nto game`);
  skipButton.position.set(app.screen.width - 55, 35);
  skipButton.on('pointerdown', () => {
    goToGame(game);
    if (level.introSound) {
      stopSound(level.introSound.id);
    }
  });
  container.addChild(skipButton);

  playTracks(level.soundtrack);

  if (level.introSound) {
    setTimeout(() => {
      playSingleSound(level.introSound.id);
    }, pathOr(0, ['introSound', 'startDelay'])(level));
  }
}

function goToGame(game) {
  // reset state
  reset(game);

  goTo(game, SCREEN_PLAY);
}

function reset(game) {
  const container = getAsset(game.containers.info);
  bitmapText.destroy();
  container.removeChildren();
  onResetText();
}

export function onUpdate(game, delta, deltaMs) {
  const level = getLevel(game.levelKey);

  onUpdateText({
    fixedStartCopy: `${level.description}\n\n\n`,
    sentences: level.intro,
    bitmapText,
    deltaMs,
    updateCharMs: 80,
    onComplete: () => {
      setTimeout(() => goToGame(game), 5000);
    },
  });
}
