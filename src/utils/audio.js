import musicSrc from '../assets/audio/music/wiffy20200116.mp3';
import bigLaser from '../assets/audio/sfx/quaddamage_shoot.ogg';
import laser from '../assets/audio/sfx/quaddamage_out.ogg';
import laserHit from '../assets/audio/sfx/explosion_small.mp3';
import bigLaserHit from '../assets/audio/sfx/explosion_underwater_distant.mp3';
import explosion from '../assets/audio/sfx/explosion_large_distant.mp3';
import { getKey, saveKey } from './store';
import { prop } from 'ramda';

export const AUDIO_RANGE_PX = 800;

const AUDIO_STORE_KEY = 'audioSettings';

const audioSettings = {
  on: true,
  masterVol: 1,
  musicVol: 1,
  sfxVol: 1,
  ...getKey(AUDIO_STORE_KEY),
};

// for cross browser compatibility
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

const musicGainNode = audioCtx.createGain();
musicGainNode.gain.value = audioSettings.masterVol * audioSettings.musicVol;

async function getFile(filepath) {
  const response = await fetch(filepath);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

async function loadFile(filePath) {
  const track = await getFile(filePath);
  return track;
}

function getBufferSource(audioBuffer, gainNode) {
  const trackSource = audioCtx.createBufferSource();
  trackSource.buffer = audioBuffer;
  if (gainNode) {
    trackSource.connect(gainNode).connect(audioCtx.destination);
  } else {
    trackSource.connect(audioCtx.destination);
  }
  return trackSource;
}

// create a buffer, plop in data, connect and play -> modify graph here if required
function playSfx(audioBuffer, vol = 1) {
  if (!audioSettings.on) {
    return;
  }
  if (!audioBuffer) {
    console.warn('track not loaded');
    return;
  }
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = vol;
  const trackSource = getBufferSource(audioBuffer, gainNode);
  trackSource.start();
  return trackSource;
}

const sfxLibrary = [
  { id: 'laser', src: laser },
  { id: 'bigLaser', src: bigLaser },
  { id: 'laserHit', src: laserHit },
  { id: 'bigLaserHit', src: bigLaserHit },
  { id: 'explosion', src: explosion },
];

sfxLibrary.forEach((t) => {
  loadFile(t.src).then((audioBuffer) => {
    t.audioBuffer = audioBuffer;
  });
});

export const play = (id, vol = 1) => {
  if (!audioSettings.on) {
    return;
  }
  const track = sfxLibrary.find((t) => t.id === id);
  if (!track) {
    // console.warn('track not loaded');
    return;
  }
  playSfx(track.audioBuffer, vol);
};

const musicLibrary = [{ id: 'music', src: musicSrc }];

musicLibrary.forEach((t) => {
  loadFile(t.src).then((audioBuffer) => {
    t.audioBuffer = audioBuffer;
  });
});

export const toggleMusic = (id = 'music') => {
  const track = musicLibrary.find((t) => t.id === id);
  if (track.bufferSource) {
    stopMusic(id);
  } else {
    playMusic(id);
  }
};

export const playMusic = (id = 'music', loop = true) => {
  if (!audioSettings.on) {
    return;
  }
  const track = musicLibrary.find((t) => t.id === id);
  track.bufferSource = getBufferSource(track.audioBuffer, musicGainNode);
  track.bufferSource.loop = loop;
  track.bufferSource.start();
};

export const stopMusic = (id = 'music') => {
  const track = musicLibrary.find((t) => t.id === id);
  if (!track.bufferSource) {
    console.log('no bufferSource');
    return;
  }
  track.bufferSource.stop();
  delete track.bufferSource;
};

export function setVolume(vol) {
  if (typeof vol === 'number') {
    audioSettings.masterVol = Math.max(0, Math.min(1, vol));
  } else {
    const sfx = prop('sfx')(vol);
    const music = prop('music')(vol);

    if (typeof sfx === 'number') {
      audioSettings.sfxVol = Math.max(0, Math.min(1, sfx));
    }
    if (typeof music === 'number') {
      audioSettings.musicVol = Math.max(0, Math.min(1, music));
    }
  }
  musicGainNode.gain.value = audioSettings.masterVol * audioSettings.musicVol;
  saveKey(AUDIO_STORE_KEY, audioSettings);
}

export function toggleAudio() {
  audioSettings.on = !audioSettings.on;
  if (!audioSettings.on) {
    stopMusic();
  }
  saveKey(AUDIO_STORE_KEY, audioSettings);
}

export function getSettings() {
  return { ...audioSettings };
}
