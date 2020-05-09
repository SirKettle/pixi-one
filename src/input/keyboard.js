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


