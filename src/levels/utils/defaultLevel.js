import { starsParallax } from '../../utils/parallax';

export default {
  key: '404',
  title: 'Episode XXIV',
  description: 'Plenty of scope for prequels!',
  intro: [
    'In a micro galaxy, not so far away, where inter planetary travel is the norm and peace has been commonplace for centuries...',
    'Yet this is a time of war.',
    'A mysterious dark force has emerged. Not the kind of dark force that leaks from your uncle’s bum hole after a roast dinner. No, a far more sinister force.',
    'A time when sophisticated weaponry has not been invented (I know, stay with me). Pilots, because no one has thought of using drones yet, rely on shooting shiny glowy things at each other called “lasers”. These nasty lasers can cause minor eye irritation and make you blink (like, a lot) if you’re not wearing sun glasses and also inexplicably blow up other space craft.',
  ],
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
