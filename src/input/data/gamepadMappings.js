const PS4 = {
  BUTTON_X: 'BUTTON_X',
  BUTTON_CIRCLE: 'BUTTON_CIRCLE',
  BUTTON_SQUARE: 'BUTTON_SQUARE',
  BUTTON_TRIANGLE: 'BUTTON_TRIANGLE',
  BUTTON_L1: 'BUTTON_L1',
  BUTTON_L2: 'BUTTON_L2',
  BUTTON_R1: 'BUTTON_R1',
  BUTTON_R2: 'BUTTON_R2',
  BUTTON_D_UP: 'BUTTON_D_UP',
  BUTTON_D_DOWN: 'BUTTON_D_DOWN',
  BUTTON_D_LEFT: 'BUTTON_D_LEFT',
  BUTTON_D_RIGHT: 'BUTTON_D_RIGHT',
  BUTTON_SHARE: 'BUTTON_SHARE',
  BUTTON_OPTIONS: 'BUTTON_OPTIONS',
  BUTTON_JOYSTICK_L: 'BUTTON_JOYSTICK_L',
  BUTTON_JOYSTICK_R: 'BUTTON_JOYSTICK_R',
  AXIS_L_X: 'AXIS_L_X',
  AXIS_L_Y: 'AXIS_L_Y',
  AXIS_R_X: 'AXIS_R_X',
  AXIS_R_Y: 'AXIS_R_Y',
};

const dualShockButtonIndexOrder = [
  PS4.BUTTON_X,
  PS4.BUTTON_CIRCLE,
  PS4.BUTTON_SQUARE,
  PS4.BUTTON_TRIANGLE,
  PS4.BUTTON_L1,
  PS4.BUTTON_R1,
  PS4.BUTTON_L2,
  PS4.BUTTON_R2,
  PS4.BUTTON_SHARE,
  PS4.BUTTON_OPTIONS,
  PS4.BUTTON_JOYSTICK_L,
  PS4.BUTTON_JOYSTICK_R,
  PS4.BUTTON_D_UP,
  PS4.BUTTON_D_DOWN,
  PS4.BUTTON_D_LEFT,
  PS4.BUTTON_D_RIGHT,
];

const dualShockAxisIndexOrder = [
  PS4.AXIS_L_X,
  PS4.AXIS_L_Y,
  PS4.AXIS_R_X,
  PS4.AXIS_R_Y,
];

const dualShockButtonIndexMap = dualShockButtonIndexOrder.reduce(
  reduceArrayIndexes,
  {}
);

const dualShockAxisIndexMap = dualShockAxisIndexOrder.reduce(
  reduceArrayIndexes,
  {}
);

function reduceArrayIndexes(acc, key, index) {
  return {
    ...acc,
    [key]: index,
  };
}

export function getButtonKeyIndexMap(gamepadType) {
  if (gamepadType === 'dualshock') {
    return dualShockButtonIndexMap;
  }
  return {};
}

export function getAxisKeyIndexMap(gamepadType) {
  if (gamepadType === 'dualshock') {
    return dualShockAxisIndexMap;
  }
  return {};
}

export function getButtonIndicesFireOne(gamepadType) {
  const keyIndexMap = getButtonKeyIndexMap(gamepadType);
  if (gamepadType === 'dualshock') {
    return [
      keyIndexMap[PS4.BUTTON_L1],
      keyIndexMap[PS4.BUTTON_R1],
      keyIndexMap[PS4.BUTTON_X],
      keyIndexMap[PS4.BUTTON_L2],
      keyIndexMap[PS4.BUTTON_R2],
    ];
  }
  return [];
}

export function getAxisIndexMap(gamepadType) {
  const keyIndexMap = getAxisKeyIndexMap(gamepadType);
  if (gamepadType === 'dualshock') {
    return {
      forward: keyIndexMap[PS4.AXIS_L_Y],
      strafe: keyIndexMap[PS4.AXIS_L_X],
      turn: keyIndexMap[PS4.AXIS_R_X],
    };
  }
  return;
}
