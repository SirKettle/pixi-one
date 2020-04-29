import { pathEq, pathOr } from 'ramda';

// Mutable keys info
export const keys = {};

function onKeydown(event) {
  keys[event.key] = {
    ...keys[event.key],
    state: 'DOWN',
  };
}

function onKeyup(event) {
  keys[event.key] = {
    ...keys[event.key],
    state: 'UP',
  };
}

export const isKeyState = (key, state) => pathEq([key, 'state'], state)(keys);
export const isKeyDown = (key) => isKeyState(key, 'DOWN');
export const isKeyUp = (key) => isKeyState(key, 'UP');
export const keyPressedElapsedMS = (key) => pathOr(0, [key, 'pressedMs'])(keys);

export const onUpdateKeys = (elapsedMS) => {
  Object.keys(keys).forEach((key) => {
    const keyInfo = keys[key];
    if (keyInfo.state === 'DOWN') {
      keyInfo.pressedMs =
        typeof keyInfo.pressedMs === 'number'
          ? keyInfo.pressedMs + elapsedMS
          : 0;
    }

    // after "UP" action - remove key
    if (keyInfo.state === 'UP') {
      delete keys[key];
    }
  });
};

export const onResetKeys = () => {
  Object.keys(keys).forEach((key) => {
    delete keys[key];
  });
};

export const subscribe = () => {
  window.addEventListener('keydown', onKeydown);
  window.addEventListener('keyup', onKeyup);
  onResetKeys();
};

export const unsubscribe = () => {
  window.addEventListener('keydown', onKeydown);
  window.addEventListener('keyup', onKeyup);
  onResetKeys();
};
