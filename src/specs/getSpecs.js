import {
  craftGarbage1,
  craftH1,
  craftNcfc,
  spacecraft,
  starDestroyer,
  tantiveIV,
  tCraft,
  xWing,
} from './spacecraft';
import { green as planetGreen, sandy as planetSandy, starSun } from './planets';
import { bullet } from './bullets';
import { grid128, grid64, spaceBg, starsOne, starsTransparent } from './tiles';
import { explosion200 } from './particles';

export const getSpecs = (key) => {
  switch (key) {
    case 'spacecraft':
      return spacecraft;
    case 'craftH1':
      return craftH1;
    case 'craftGarbage1':
      return craftGarbage1;
    case 'craftNcfc':
      return craftNcfc;
    case 'tCraft':
      return tCraft;
    case 'starDestroyer':
      return starDestroyer;
    case 'xWing':
      return xWing;
    case 'tantiveIV':
      return tantiveIV;
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
    case 'spaceBg':
      return spaceBg;
    case 'starsTransparent':
      return starsTransparent;
    case 'explosion200':
      return explosion200;
    default:
      return;
  }
};
