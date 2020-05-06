import { getHorizontalFrameRect } from '../utils/spritesheet';
import playerImage from '../../assets/images/craft_spritesheet.png';
import tCraftImage from '../../assets/images/tiecraft.png';

export const spacecraft = {
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
