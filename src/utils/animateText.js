import { getAsset } from './assetStore';

const initialState = {
  sentenceIndex: 0,
  characterIndex: 0,
  lastUpdateMs: 0,
  complete: false,
};
let _state = { ...initialState };

const UPDATE_CHAR_MS = 80;

function updateIndices(sentences, prevState, deltaMs, updateCharMs) {
  const newState = {
    ...prevState,
  };

  newState.lastUpdateMs += deltaMs;

  const shouldUpdateText = newState.lastUpdateMs >= updateCharMs;

  if (shouldUpdateText) {
    newState.lastUpdateMs = 0;
    newState.characterIndex += 1;

    const sentence = sentences[newState.sentenceIndex];
    if (newState.characterIndex >= sentence.length) {
      newState.characterIndex = 0;
      newState.sentenceIndex += 1;

      if (newState.sentenceIndex >= sentences.length) {
        newState.complete = true;
      }
    }
  }
  return newState;
}

export function onResetText() {
  _state = { ...initialState };
}

export function onUpdateText({
  fixedStartCopy = '',
  sentences = ['Some text to animate'],
  bitmapText,
  deltaMs,
  updateCharMs = UPDATE_CHAR_MS,
  onComplete = () => {},
}) {
  const prevState = { ..._state };

  if (!_state.complete) {
    _state = {
      ...prevState,
      ...updateIndices(sentences, prevState, deltaMs, updateCharMs),
    };

    if (_state.complete) {
      onComplete();
    }
  }

  if (_state.characterIndex !== prevState.characterIndex) {
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

    bitmapText.text = `${fixedStartCopy}${copy}
  `;
  }
}
