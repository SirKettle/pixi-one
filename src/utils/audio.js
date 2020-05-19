import { prop } from 'ramda';
import { getKey, saveKey } from './store';

import wiffyInstrumentalSrc from '../assets/audio/music/wiffy-instrumental-64kBits.mp3';
import transitionWiffyAhaha from '../assets/audio/music/transition-wiffy-to-ahaa.mp3'
import ahahaSrc from '../assets/audio/music/ahahahaaa-64kBits.mp3';
import episode24Src from '../assets/audio/music/episode24.mp3';
import bigLaser from '../assets/audio/sfx/quaddamage_shoot.ogg';
import laser from '../assets/audio/sfx/quaddamage_out.ogg';
import laserHit from '../assets/audio/sfx/explosion_small.mp3';
import bigLaserHit from '../assets/audio/sfx/explosion_underwater_distant.mp3';
import explosion from '../assets/audio/sfx/explosion_large_distant.mp3';

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

const sfxLibrary = [
  { id: 'laser', src: laser },
  { id: 'bigLaser', src: bigLaser },
  { id: 'laserHit', src: laserHit },
  { id: 'bigLaserHit', src: bigLaserHit },
  { id: 'explosion', src: explosion },
  { id: 'episode-24', src: episode24Src, isSinglePlay: true },
];

const musicLibrary = [
  { id: 'music-wiffy', src: wiffyInstrumentalSrc },
  { id: 'transition-wiffy2aha', src: transitionWiffyAhaha },
  { id: 'music-aha', src: ahahaSrc },
];

const playlist = musicLibrary.map(prop('id'));
const allSounds = sfxLibrary.concat(
  musicLibrary.map((t) => ({ ...t, isSinglePlay: true, isMusic: true }))
);

const sounds = {};
allSounds.forEach(({ id, src }) => {
  loadFile(src).then((audioBuffer) => {
    sounds[id] = {
      src,
      audioBuffer,
    };
  });
});

export const play = (id, vol = 1) => {
  if (!audioSettings.on) {
    return;
  }
  const track = sounds[id];
  if (!track) {
    // console.warn('track not loaded');
    return;
  }
  playSfx(track.audioBuffer, vol);
};

export const toggleMusic = (id = 'music-wiffy') => {
  const track = sounds[id];
  if (track.bufferSource) {
    stopMusic(id);
  } else {
    playMusic(id);
  }
};

export const stopMusic = (id = 'music-wiffy') => {
  const track = sounds[id];
  if (!track.bufferSource) {
    console.log('no bufferSource');
    return;
  }
  track.bufferSource.stop();
  delete track.bufferSource;
};

export const playMusic = (id = 'music-wiffy', loop = true) => {
  if (!audioSettings.on) {
    return;
  }
  const track = sounds[id];
  if (track.bufferSource) {
    track.bufferSource.stop();
    delete track.bufferSource;
  }
  track.bufferSource = getBufferSource(track.audioBuffer, musicGainNode);
  track.bufferSource.loop = loop;
  track.bufferSource.start();
};

const defaultCollectionState = {
  index: 0,
  ids: [],
  loop: false,
  playing: false,
};

const _global = {
  collection: { ...defaultCollectionState },
  playing: {},
};

window._global = _global;

export function getCurrentTrackId() {
  const collection = prop('collection')(_global);
  return collection.ids[collection.index];
}

export function nextTrack(index) {
  const collection = prop('collection')(_global);
  collection.index = typeof index === 'number' ? index : collection.index + 1;

  if (collection.index >= collection.ids.length) {
    if (collection.loop) {
      collection.index = 0;
    }
  }

  if (collection.index < collection.ids.length) {
    _global.collection = collection;
    playSingleSound({
      id: getCurrentTrackId(),
      gainNode: musicGainNode,
      isCollection: true,
    }).then(() => nextTrack());
    return;
  }

  console.log('end of collection');
  resetCollection();
}

function resetCollection() {
  _global.collection = { ...defaultCollectionState };
  console.log('resetCollection', _global.collection);
}

function stopSound(id) {
  return new Promise((resolve) => {
    const { playing } = _global;
    if (playing[id] && typeof playing[id].stop === 'function') {
      playing[id].onended = () => {
        console.log('stopSound - onended', id);
        delete playing[id];
        resolve();
      };
      console.log('stopSound', id);
      playing[id].stop();
    } else {
      resolve();
    }
  });
}

export function stopCollection() {
  return new Promise((resolve) => {
    const id = getCurrentTrackId();
    resetCollection();
    if (id) {
      stopSound(id).then(() => {
        resolve();
      });
    } else {
      resolve();
    }
  });
}

export function playCollection({ ids = [], index = 0, loop = true }) {
  console.log('playCollection part 1', ids.join(', '));
  stopCollection().then(() => {
    console.log('playCollection part 2', ids.join(', '));
    _global.collection.ids = ids;
    _global.collection.loop = loop;
    nextTrack(0);
  });
}

export function playSingleSound({
  id,
  vol = 1,
  gainNode = audioCtx.createGain(),
  isCollection = false,
}) {
  return new Promise((resolve, reject) => {
    const track = sounds[id];
    const { playing } = _global;
    if (!track) {
      reject('404 - no track');
      return;
    }
    if (!audioSettings.on) {
      reject('audio OFF');
      return;
    }

    console.log('playSingleSound stopSound', id);
    stopSound(id).then(() => {
      console.log('playSingleSound start', id);
      gainNode.gain.value = vol;
      playing[id] = getBufferSource(track.audioBuffer, gainNode);
      playing[id].start();

      playing[id].onended = () => {
        console.log('playSingleSound onended - resolve', id);
        delete playing[id];
        resolve();
      };
    });
  });
}

window.playSingleSound = playSingleSound;

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
    if (audioCtx.state === 'running') {
      audioCtx.suspend();
      console.log('suspend audio');
    }
  } else {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
      console.log('resume audio');
    }
  }
  saveKey(AUDIO_STORE_KEY, audioSettings);
}

export function getSettings() {
  return { ...audioSettings };
}
