import { starsParallax } from '../../utils/parallax';

export default {
  key: '404',
  title: 'Add title here',
  description: 'Add description here',
  intro: ['Add intro here'],
  time: {},
  tiles: starsParallax,
  // gravity: 0.04, // 0.04 Earth like gravity
  gravity: 0,
  // atmosphere: 0.01, // space 0 - solid 1?? maybe air would be 0.2, water 0.4??
  atmosphere: 0.05, // space 0 - solid 1?? maybe air would be 0.2, water 0.4??
  missions: [],
  unlocksLevels: [],
  // soundAssetKeys: [
  //   'wiffyInstrumental',
  //   'ahahahaaa',
  //   'episode24',
  //   'bigLaser',
  //   'laser',
  //   'laserHit',
  //   'bigLaserHit',
  //   'explosion',
  // ],
};
