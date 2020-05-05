import { getHorizontalFrameRect } from '../utils/spritesheet';
import planetGreenImage from '../../assets/images/planet_green.png';
import planetSandImage from '../../assets/images/planet_blue_sand.png';
import sunImage from '../../assets/images/planet_sun.png';

const defaultPlanet = {
  // because of scale - x is percentage of width, y of height, radius of width
  hitArea: {
    basic: {
      x: 0.5,
      y: 0.5,
      radius: 0.5,
    },
  },
  initialData: {
    life: 15,
    mass: 1000,
  },
};

export const green = {
  ...defaultPlanet,
  imageUrl: planetGreenImage,
  frames: [
    { key: 'DEFAULT' /* straight */, rect: getHorizontalFrameRect(0, 32, 32) },
  ],
};

export const sandy = {
  ...defaultPlanet,
  imageUrl: planetSandImage,
  frames: [
    { key: 'DEFAULT' /* straight */, rect: getHorizontalFrameRect(0, 32, 32) },
  ],
};

export const starSun = {
  ...defaultPlanet,
  imageUrl: sunImage,
  frames: [
    { key: 'DEFAULT' /* straight */, rect: getHorizontalFrameRect(0, 32, 32) },
  ],
};
