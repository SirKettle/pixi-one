import { getFrameRects } from '../utils/spritesheet';
import explosion200Image from '../assets/images/sprites/animated-explosion-200.png';

export const explosion200 = {
  imageUrl: explosion200Image,
  frames: getFrameRects({ width: 200, height: 200, columns: 8, total: 48 }),
};
