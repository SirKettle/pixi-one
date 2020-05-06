import { getHorizontalFrameRect } from '../utils/spritesheet';
import bulletOneImage from '../../assets/images/bullet_scaled.png';
import { combineVelocity, getVelocity } from '../utils/physics';

const defaultBullet = {
  // because of scale - x is percentage of width, y of height, radius of width
  hitArea: {
    basic: {
      x: 0.5,
      y: 0.5,
      radius: 0.5,
    },
  },
  initialData: {
    life: 4,
    mass: 25,
  },
};

export const bullet = {
  ...defaultBullet,
  imageUrl: bulletOneImage,
  frames: [
    { key: 'DEFAULT' /* straight */, rect: getHorizontalFrameRect(0, 16, 16) },
  ],
};

// can update this to include other bullets and powerups
export const generateBulletData = (
  host,
  hostFirePower,
  assetKey = 'bullet'
) => {
  const speed = 10 + hostFirePower * 10;
  const direction = host.data.rotation;
  const bulletVelocity = getVelocity({ speed, direction });

  return {
    assetKey,
    isBullet: true,
    x: host.data.x,
    y: host.data.y,
    direction: host.data.rotation,
    velocity: combineVelocity(host.data.velocity, bulletVelocity),
    life: 2 + hostFirePower * 2,
    mass: hostFirePower * 10,
    power: hostFirePower * 50,
    scale: 0.25 + hostFirePower * 0.75,
    collisionBlacklist: [host.uid],
  };
};
