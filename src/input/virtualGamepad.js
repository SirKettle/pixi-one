import nipplejs from 'nipplejs';
import { normalizeDirection } from '../utils/physics';
import { getAsset } from '../utils/assetStore';
import { textButton } from '../utils/button';
import { isTouchDevice } from '../utils/device';

const _cache = {
  joystick: null,
  buttonEls: [],
  axisData: null,
  buttonData: {
    fireOneDown: false,
  },
};

const gamePadEl = document.getElementById('virtual_gamepad');

export function getAxisData() {
  if (_cache.axisData) {
    return {
      ..._cache.axisData,
    };
  }
  return;
}

export function getButtonsData() {
  return {
    ..._cache.buttonData,
  };
}

export function removeGamepad(game) {
  if (_cache.joystick) {
    _cache.joystick.destroy();
    _cache.joystick = null;
  }

  gamePadEl.classList.remove('active');

  _cache.buttonEls.forEach((b) => {
    if (typeof b.destroy === 'function') {
      b.destroy();
    }
  });

  _cache.buttonEls = [];
}

export function addGamepad(game) {
  if (!isTouchDevice()) {
    return;
  }

  removeGamepad(game);
  gamePadEl.classList.add('active');

  _cache.joystick = nipplejs.create({
    zone: document.getElementById('virtual_joystick'),
    color: 'rgba(255,255,255,0.3)',
    mode: 'static',
    position: {
      left: '120px',
      bottom: '120px',
    },
    multitouch: true,
    size: 160,
  });

  _cache.joystick
    .on('start', function () {
      _cache.axisData = null;
    })
    .on('end', function () {
      _cache.axisData = null;
    })
    .on('move', function (evt, data) {
      recordGamepadAxisData(data);
    });

  const app = getAsset(game.app);
  const container = getAsset(game.containers.dash);
  const x = app.screen.width - 120;
  const y = app.screen.height - 120;
  const fireButton = textButton(`F1`, { fixedRadius: 40, hitAreaScale: 3 });
  fireButton.position.set(x, y);
  fireButton.on('pointerdown', () => {
    console.log('fireButton down');
    _cache.buttonData.fireOneDown = true;
    fireButton.alpha = 0.5;
  });
  fireButton.on('pointerup', () => {
    console.log('fireButton up - FIRE!');
    _cache.buttonData.fireOneDown = false;
    fireButton.alpha = 1;
  });

  container.addChild(fireButton);
  _cache.buttonEls.push(fireButton);
}

function transformDirection(wrongDirection) {
  return normalizeDirection(0.5 * Math.PI - wrongDirection);
}

function recordGamepadAxisData(data) {
  _cache.axisData = {
    x: data.vector.x,
    y: -data.vector.y,
    direction: transformDirection(data.angle.radian),
    force: Math.min(1, data.force),
  };
}
