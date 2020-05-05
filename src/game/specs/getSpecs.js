import { spacecraft, tCraft } from './spacecraft';
import { green as planetGreen, sandy as planetSandy, starSun } from './planets';
import { bullet } from './bullets';
import { grid128, grid64, starsOne } from './tiles';

export const getSpecs = (key) => {
  switch (key) {
    case 'spacecraft':
      return spacecraft;
    case 'tCraft':
      return tCraft;
    case 'starSun':
      return starSun;
    case 'planetGreen':
      return planetGreen;
    case 'planetSandy':
      return planetSandy;
    case 'bullet':
      return bullet;
    case 'grid64':
      return grid64;
    case 'grid128':
      return grid128;
    case 'starsOne':
      return starsOne;
    default:
      return;
  }
};
