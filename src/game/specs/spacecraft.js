import { getHorizontalFrameRect } from '../utils/spritesheet';
import playerImage from '../../assets/images/craft_spritesheet.png';
import tCraftImage from '../../assets/images/tiecraft.png';
import starDestroyerImage from '../../assets/images/stardestroyer.png';
import tantiveIVImage from '../../assets/images/tantive-IV.png';
import xWingImage from '../../assets/images/xwing.png';

// NOTE: http://swc.fs2downloads.com/reference/ - good source of star wars assets

export const spacecraft = {
  thrust: {
    forward: 0.75,
    reverse: 0.1,
    side: 0.05,
    turn: 0.5,
  },
  // because of scale - x is percentage of width, y of height, radius of width
  hitArea: {
    basic: {
      x: 0.5,
      y: 0.5,
      radius: 0.5,
    },
    // we can extend this to use more specific hit areas with levels percentage of life?
    // we can extend this to depend on the current frame/texture?
  },
  initialData: {
    shield: 1,
    life: 200,
    mass: 100,
    fuelCapacity: 100,
  },
  imageUrl: playerImage,
  frames: [
    { key: 'hardLeft', rect: getHorizontalFrameRect(0, 32, 32) },
    { key: 'left', rect: getHorizontalFrameRect(1, 32, 32) },
    { key: 'DEFAULT' /* straight */, rect: getHorizontalFrameRect(2, 32, 32) },
    { key: 'right', rect: getHorizontalFrameRect(3, 32, 32) },
    { key: 'hardRight', rect: getHorizontalFrameRect(4, 32, 32) },
  ],
};

export const tCraft = {
  thrust: {
    forward: 0.65,
    reverse: 0.1,
    side: 0.05,
    turn: 0.7,
  },
  // because of scale - x is percentage of width, y of height, radius of width
  hitArea: {
    basic: {
      x: 0.5,
      y: 0.5,
      radius: 0.5,
    },
    // we can extend this to use more specific hit areas with levels percentage of life?
    // we can extend this to depend on the current frame/texture?
  },
  initialData: {
    shield: 1,
    life: 100,
    mass: 50,
    fuelCapacity: 100,
  },
  imageUrl: tCraftImage,
  frames: [
    { key: 'DEFAULT' /* straight */, rect: getHorizontalFrameRect(0, 32, 32) },
  ],
};

export const xWing = {
  thrust: {
    forward: 0.7,
    reverse: 0.1,
    side: 0.05,
    turn: 0.65,
  },
  // because of scale - x is percentage of width, y of height, radius of width
  hitArea: {
    basic: {
      x: 0.5,
      y: 0.5,
      radius: 0.5,
    },
    // we can extend this to use more specific hit areas with levels percentage of life?
    // we can extend this to depend on the current frame/texture?
  },
  initialData: {
    shield: 1,
    life: 200,
    mass: 100,
    fuelCapacity: 100,
  },
  imageUrl: xWingImage,
  frames: [
    { key: 'DEFAULT' /* straight */, rect: getHorizontalFrameRect(0, 48, 48) },
  ],
};

export const starDestroyer = {
  thrust: {
    forward: 0.15,
    reverse: 0.1,
    side: 0.05,
    turn: 0.1,
  },
  // because of scale - x is percentage of width, y of height, radius of width
  hitArea: {
    basic: {
      x: 0.5,
      y: 0.5,
      radius: 0.5,
    },
    precision: [
      {
        x: 0,
        y: -0.47,
        radius: 0.03,
      },
      {
        x: 0,
        y: -0.41,
        radius: 0.03,
      },
      {
        x: 0,
        y: -0.35,
        radius: 0.03,
      },
      {
        x: 0,
        y: -0.275,
        radius: 0.04,
      },
      {
        x: 0,
        y: -0.2,
        radius: 0.04,
      },
      {
        x: 0,
        y: -0.12,
        radius: 0.055,
      },
      {
        x: 0,
        y: -0.03,
        radius: 0.07,
      },
      {
        x: 0,
        y: 0.1,
        radius: 0.09,
      },
      {
        x: 0,
        y: 0.33,
        radius: 0.17,
      },
    ],
    // we can extend this to use more specific hit areas with levels percentage of life?
    // we can extend this to depend on the current frame/texture?
  },
  initialData: {
    shield: 1,
    life: 200,
    mass: 500,
    fuelCapacity: 100,
  },
  imageUrl: starDestroyerImage,
  frames: [
    {
      key: 'DEFAULT' /* straight */,
      rect: getHorizontalFrameRect(0, 90, 256),
    },
  ],
};

export const tantiveIV = {
  thrust: {
    forward: 0.25,
    reverse: 0.1,
    side: 0.05,
    turn: 0.3,
  },
  // because of scale - x is percentage of width, y of height, radius of width
  hitArea: {
    basic: {
      x: 0.5,
      y: 0.5,
      radius: 0.5,
    },
    precision: [
      {
        x: 0,
        y: -0.47,
        radius: 0.03,
      },
      {
        x: 0,
        y: -0.41,
        radius: 0.03,
      },
      {
        x: 0,
        y: -0.35,
        radius: 0.03,
      },
      {
        x: 0,
        y: -0.275,
        radius: 0.04,
      },
      {
        x: 0,
        y: -0.2,
        radius: 0.04,
      },
      {
        x: 0,
        y: -0.12,
        radius: 0.055,
      },
      {
        x: 0,
        y: -0.03,
        radius: 0.07,
      },
      {
        x: 0,
        y: 0.1,
        radius: 0.09,
      },
      {
        x: 0,
        y: 0.33,
        radius: 0.17,
      },
    ],
    // we can extend this to use more specific hit areas with levels percentage of life?
    // we can extend this to depend on the current frame/texture?
  },
  initialData: {
    shield: 1,
    life: 200,
    mass: 500,
    fuelCapacity: 100,
  },
  imageUrl: tantiveIVImage,
  frames: [
    {
      key: 'DEFAULT' /* straight */,
      rect: getHorizontalFrameRect(0, 81, 253),
    },
  ],
};
