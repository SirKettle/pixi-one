import { BitmapText } from 'pixi.js';
import { getAsset } from '../utils/assetStore';
import { getLevel } from '../specs/levels';
import { goTo, SCREEN_PLAY } from '../utils/screen';
import {
  play as playAudio,
  playCollection,
  playMusic,
  playSingleSound,
  stopCollection,
  stopMusic,
} from '../utils/audio';
import { textButton } from '../utils/button';

const initialState = {
  audioTrack: undefined,
  sentences: [],
  sentenceIndex: 0,
  characterIndex: 0,
  lastUpdateMs: 0,
  complete: false,
};
let bitmapText;
let _state = { ...initialState };

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
  });

  bitmapText = new BitmapText(level.description, {
    font: '25px Digital-7 Mono',
    align: 'left',
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
  skipButton.on('pointerdown', () => goToGame(game));
  container.addChild(skipButton);

  _state.sentences = level.intro;

  playCollection({ ids: ['music-wiffy', 'transition-wiffy2aha', 'music-aha'], loop: true });
  setTimeout(() => {
    playSingleSound({ id: 'episode-24' });
  }, 2000);
}

function goToGame(game) {
  // reset state
  reset(game);

  goTo(game, SCREEN_PLAY);
}

function reset(game) {
  const container = getAsset(game.containers.info);
  _state = { ...initialState };
  bitmapText.destroy();
  container.removeChildren();
}

const UPDATE_CHAR_MS = 80;

function updateIndices(prevState, deltaMs) {
  const newState = {
    ...prevState,
  };

  newState.lastUpdateMs += deltaMs;

  const shouldUpdateText = newState.lastUpdateMs >= UPDATE_CHAR_MS;

  if (shouldUpdateText) {
    newState.lastUpdateMs = 0;
    newState.characterIndex += 1;

    const sentence = newState.sentences[newState.sentenceIndex];
    if (newState.characterIndex >= sentence.length) {
      newState.characterIndex = 0;
      newState.sentenceIndex += 1;

      if (newState.sentenceIndex >= newState.sentences.length) {
        newState.complete = true;
      }
    }
  }
  return newState;
}

export function onUpdate(game, delta, deltaMs) {
  const prevState = { ..._state };

  if (!_state.complete) {
    _state = {
      ...prevState,
      ...updateIndices(prevState, deltaMs),
    };

    if (_state.complete) {
      setTimeout(() => goToGame(game), 5000);
    }
  }

  if (_state.characterIndex !== prevState.characterIndex) {
    const level = getLevel(game.levelKey);
    const { sentences } = _state;
    const copy = sentences
      .filter((sentence, index) => _state.sentenceIndex >= index)
      .map((sentence, index) => {
        const showComplete = _state.sentenceIndex > index;
        if (showComplete) {
          return sentence;
        }
        return sentence.slice(0, _state.characterIndex);
      })
      .join('\n\n');

    bitmapText.text = `${level.description}

${copy}
  `;
  }
}
