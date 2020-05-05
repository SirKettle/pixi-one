import { path, pathEq, pathOr, propEq, propOr } from 'ramda';
import {
  getAxisIndexMap,
  getButtonIndicesFireOne,
} from './data/gamepadMappings';

export const FIRE_ONE = '_FIRE_ONE';

const BUTTON_STATE = {
  DOWN: 'DOWN',
  UP: 'UP',
  INACTIVE: 'INACTIVE',
};

const defaultButtonState = {
  status: BUTTON_STATE.INACTIVE,
  pressedMs: 0,
};

const initialGamepadState = {
  gamepadType: undefined,
  buttons: {
    [FIRE_ONE]: { ...defaultButtonState },
  },
  keys: {}, // keyboard
  thruster: {
    // between -1 and 1
    forward: 0, // between 0 and 1
    reverse: 0, // between 0 and 1
    turn: 0, // between -1 and 1, negative is turning left
    strafe: 0, // between -1 and 1, negative is turning left
  },
};

let gamepadCache = initialGamepadState;

function onConnect(event) {
  console.log('Gamepad connected :)', event.gamepad);
  gamepadCache = {
    ...gamepadCache,
    gamepadType: 'dualshock',
  };
}

function onDisconnect(event) {
  console.log('Gamepad disconnected :(', event);
  gamepadCache = {
    ...gamepadCache,
    gamepadType: undefined,
  };
}

function onKeydown({ key }) {
  const keys = { ...gamepadCache.keys };
  gamepadCache.keys = {
    ...keys,
    [key]: {
      ...defaultButtonState,
      ...keys[key],
      status: BUTTON_STATE.DOWN,
    },
  };
}

function onKeyup({ key }) {
  const keys = { ...gamepadCache.keys };
  gamepadCache.keys = {
    ...keys,
    [key]: {
      ...keys[key],
      status: BUTTON_STATE.UP,
    },
  };

  console.log({ ...gamepadCache.keys });
}

function someButtonsPressed(buttons = [], buttonIndices = []) {
  const buttonsToCheck = buttons.filter((b, i) => buttonIndices.includes(i));
  return buttonsToCheck.some(propEq('pressed', true));
}

const updateButton = (key, deltaMs) => {
  const prevState = path(['keys', key])(gamepadCache);
  if (prevState.status === BUTTON_STATE.DOWN) {
    return {
      ...prevState,
      pressedMs: prevState.pressedMs + deltaMs,
    };
  }

  return {
    ...defaultButtonState,
  };
};

function updateButtonState(key, isPressed, deltaMs) {
  const prevState = path(['buttons', key])(gamepadCache);

  if (isPressed) {
    return {
      status: BUTTON_STATE.DOWN,
      pressedMs: prevState.pressedMs + deltaMs,
    };
  }

  if (prevState.status === BUTTON_STATE.DOWN) {
    return {
      ...prevState,
      status: BUTTON_STATE.UP,
    };
  }

  return {
    ...defaultButtonState,
  };
}

function getButtonState(key) {
  return pathOr(
    pathOr({ ...defaultButtonState }, ['buttons', key])(gamepadCache),
    ['keys', key]
  )(gamepadCache);
}

function isButtonStatus(key, status) {
  return (
    pathEq(['buttons', key, 'status'], status)(gamepadCache) ||
    pathEq(['keys', key, 'status'], status)(gamepadCache)
  );
}

export function isButtonDown(key) {
  return isButtonStatus(key, BUTTON_STATE.DOWN);
}

export function isButtonUp(key) {
  return isButtonStatus(key, BUTTON_STATE.UP);
}

export function getButtonPressedMs(key) {
  return propOr(0, 'pressedMs')(getButtonState(key));
}

export function getForwardThruster() {
  return pathOr(0, ['thruster', 'forward'])(gamepadCache);
}

export function getReverseThruster() {
  return pathOr(0, ['thruster', 'reverse'])(gamepadCache);
}

export function getTurnThruster() {
  return pathOr(0, ['thruster', 'turn'])(gamepadCache);
}

export function getStrafeThruster() {
  return pathOr(0, ['thruster', 'strafe'])(gamepadCache);
}

// This is to prevent accidental thrust and also calibration quirks
const MIN_AXIS_VALUE = 0.4;
function throttleAxisValue(val = 0, minVal = MIN_AXIS_VALUE) {
  return val > minVal || val < -minVal ? val : 0;
}

function getForwardThrust(axes, axisIndexMap) {
  const kVal = isButtonDown('ArrowUp') ? -1 : isButtonDown('ArrowDown') ? 1 : 0;
  if (axes && axisIndexMap) {
    const gamepadVal = throttleAxisValue(axes[axisIndexMap.forward]);
    return Math.abs(kVal) > Math.abs(gamepadVal) ? kVal : gamepadVal;

    return throttleAxisValue(axes[axisIndexMap.forward]);
  }
  return kVal;
}

function getTurnThrust(axes, axisIndexMap) {
  const kVal = isButtonDown('ArrowLeft')
    ? -1
    : isButtonDown('ArrowRight')
    ? 1
    : 0;
  if (axes && axisIndexMap) {
    const gamepadVal = throttleAxisValue(axes[axisIndexMap.turn]);
    return Math.abs(kVal) > Math.abs(gamepadVal) ? kVal : gamepadVal;

    return throttleAxisValue(axes[axisIndexMap.forward]);
  }
  return kVal;
}

export function onUpdate(deltaMs) {
  const prevState = { ...gamepadCache };
  const gamepad = navigator.getGamepads()[0] || {};
  // todo - add keyboard here and integrate!

  const { axes, buttons } = gamepad;

  const fireOnePressed =
    someButtonsPressed(
      buttons,
      getButtonIndicesFireOne(prevState.gamepadType)
    ) || isButtonDown(' ');

  const axisIndexMap = getAxisIndexMap(prevState.gamepadType);
  const forwardsThrustValue = getForwardThrust(axes, axisIndexMap);
  const turnThrustValue = getTurnThrust(axes, axisIndexMap);
  const strafeThrustValue = axisIndexMap
    ? throttleAxisValue(axes[axisIndexMap.strafe])
    : 0;

  const state = {
    ...prevState,
    keys: {
      ...Object.keys(prevState.keys).reduce(
        (acc, key) => ({
          ...acc,
          [key]: updateButton(key, deltaMs),
        }),
        {}
      ),
    },
    buttons: {
      [FIRE_ONE]: updateButtonState(FIRE_ONE, fireOnePressed, deltaMs),
    },
    thruster: {
      forward: forwardsThrustValue > 0 ? 0 : Math.abs(forwardsThrustValue), // between 0 and 1
      reverse: forwardsThrustValue > 0 ? forwardsThrustValue : 0, // between 0 and 1
      turn: turnThrustValue, // between -1 and 1, negative is turning left
      strafe: strafeThrustValue, // between -1 and 1, negative is turning left
    },
  };

  // update the cache
  gamepadCache = { ...state };

  return state;
}
export const onReset = () => {
  gamepadCache = initialGamepadState;
};

export const subscribe = () => {
  window.addEventListener('gamepadconnected', onConnect);
  window.addEventListener('gamepaddisconnected', onDisconnect);
  window.addEventListener('keydown', onKeydown);
  window.addEventListener('keyup', onKeyup);
  onReset();
};

export const unsubscribe = () => {
  window.removeEventListener('gamepadconnected', onConnect);
  window.removeEventListener('gamepaddisconnected', onDisconnect);
  window.removeEventListener('keydown', onKeydown);
  window.removeEventListener('keyup', onKeyup);
  onReset();
};
