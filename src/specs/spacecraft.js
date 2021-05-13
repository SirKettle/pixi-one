import { getHorizontalFrameRect } from '../utils/spritesheet';
import playerImage from '../assets/images/craft_spritesheet.png';
import craftGarbage1Image from '../assets/images/sprites/garbage-ship-one100x84.png';
import craftH1Image from '../assets/images/sprites/red_ship_50x45 copy.png';
import craftNcfcImage from '../assets/images/sprites/ncfc-ship91x56.png';
import tCraftImage from '../assets/images/tiecraft.png';
import starDestroyerImage from '../assets/images/stardestroyer.png';
import tantiveIVImage from '../assets/images/tantive-IV.png';
import xWingImage from '../assets/images/xwing.png';

// NOTE: http://swc.fs2downloads.com/reference/ - good source of star wars assets

export const spacecraft = {
  thrust: {
    forward: 1,
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

export const craftGarbage1 = {
  thrust: {
    forward: 0.65,
    reverse: 0.1,
    side: 0.035,
    turn: 0.3,
  },
  // because of scale - x is percentage of width, y of height, radius of width
  hitArea: {
    basic: {
      x: 0.5,
      y: 0.5,
      radius: 0.45,
    },
  },
  initialData: {
    shield: 1,
    life: 400,
    mass: 300,
    fuelCapacity: 100,
  },
  imageUrl: craftGarbage1Image,
  frames: [{ key: 'DEFAULT' /* straight */, rect: getHorizontalFrameRect(0, 100, 84) }],
  // frames: [{ key: 'DEFAULT' /* straight */, rect: getHorizontalFrameRect(0, 226, 205) }],
};

export const craftH1 = {
  thrust: {
    forward: 1,
    reverse: 0.1,
    side: 0.07,
    turn: 0.7,
  },
  // because of scale - x is percentage of width, y of height, radius of width
  hitArea: {
    basic: {
      x: 0.5,
      y: 0.5,
      radius: 0.45,
    },
  },
  initialData: {
    shield: 1,
    life: 400,
    mass: 300,
    fuelCapacity: 100,
  },
  imageUrl: craftH1Image,
  frames: [{ key: 'DEFAULT' /* straight */, rect: getHorizontalFrameRect(0, 50, 45) }],
  // frames: [{ key: 'DEFAULT' /* straight */, rect: getHorizontalFrameRect(0, 226, 205) }],
};

export const craftNcfc = {
  thrust: {
    forward: 0.95,
    reverse: 0.1,
    side: 0.07,
    turn: 0.7,
  },
  // because of scale - x is percentage of width, y of height, radius of width
  hitArea: {
    basic: {
      x: 0.5,
      y: 0.5,
      radius: 0.5,
    },
  },
  initialData: {
    shield: 1,
    life: 200,
    mass: 150,
    fuelCapacity: 100,
  },
  imageUrl: craftNcfcImage,
  frames: [{ key: 'DEFAULT' /* straight */, rect: getHorizontalFrameRect(0, 91, 56) }],
};

export const tCraft = {
  thrust: {
    forward: 0.8,
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
  },
  initialData: {
    shield: 1,
    life: 100,
    mass: 50,
    fuelCapacity: 100,
  },
  imageUrl: tCraftImage,
  frames: [{ key: 'DEFAULT' /* straight */, rect: getHorizontalFrameRect(0, 32, 32) }],
};

export const xWing = {
  thrust: {
    forward: 0.8,
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
  },
  initialData: {
    shield: 1,
    life: 200,
    mass: 100,
    fuelCapacity: 100,
  },
  imageUrl: xWingImage,
  frames: [{ key: 'DEFAULT' /* straight */, rect: getHorizontalFrameRect(0, 48, 48) }],
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
  },
  initialData: {
    shield: 1,
    life: 500,
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
    forward: 0.35,
    reverse: 0.1,
    side: 0.05,
    turn: 0.23,
  },
  // because of scale - x is percentage of width, y of height, radius of width
  hitArea: {
    basic: {
      x: 0.5,
      y: 0.5,
      radiusPx: 127,
      radius: 0.5,
    },
    // todo: these are incorrect below - were simply copied from craft above
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
  },
  initialData: {
    shield: 1,
    life: 500,
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
