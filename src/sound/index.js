// import wiffyInstrumental from '../assets/audio/music/wiffy-instrumental-64kBits.mp3';
// import ahahahaaa from '../assets/audio/music/ahahahaaa-64kBits.mp3';
// import episode24 from '../assets/audio/music/episode24.mp3';
// import bigLaser from '../assets/audio/sfx/quaddamage_shoot.ogg';
// import laser from '../assets/audio/sfx/quaddamage_out.ogg';
// import laserHit from '../assets/audio/sfx/explosion_small.mp3';
// import bigLaserHit from '../assets/audio/sfx/explosion_underwater_distant.mp3';
// import explosion from '../assets/audio/sfx/explosion_large_distant.mp3';
//
// export const library = {
//   wiffyInstrumental,
//   ahahahaaa,
//   episode24,
//   bigLaser,
//   laser,
//   laserHit,
//   bigLaserHit,
//   explosion,
// };

async function loadSounds(trackIds = []) {
  // const track = await getFile(filePath);
  // return track;
}


export const play = (id, vol = 1) => {};

export const toggleMusic = (id = 'music-wiffy') => {};

export const playMusic = (id = 'music-wiffy', loop = true) => {};

export const stopMusic = (id = 'music-wiffy') => {};

export function setVolume(vol) {}

export function toggleAudio() {}

export function getSettings() {}

export function nextTrack() {}

export function getPlaylistInfo() {
  return {
    playlist: [
      { id: 'wiffy', title: 'Wiffy (Instrumental)', isPlaying: true },
      { id: 'aha', title: 'Ahahaaha' },
    ],
    currentTrack: {
      title: 'Wiffy (Instrumental)',
      elapsedMs: 23560,
      lengthMs: 180350,
    },
  };
}
