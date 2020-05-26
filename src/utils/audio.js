import { prop } from 'ramda';
import { getKey, saveKey } from './store';

import new_message from '../assets/audio/message/_new_message.mp3';
import end_of_message from '../assets/audio/message/_end_of_message.mp3';
import new_radio_message from '../assets/audio/message/_new-radio-message.mp3';
import end_of_radio_message from '../assets/audio/message/_end-radio-message.mp3';
import message_nana_crisps from '../assets/audio/message/message_nana_crisps.mp3';
import message_boss_backtowork from '../assets/audio/message/message_boss_backtowork.mp3';
import message_boss_finally from '../assets/audio/message/boss-finally-turned-up.mp3';
import message_nana_bad_news from '../assets/audio/message/nan-bad-news.mp3';
import message_nan_congrats_navy_job from '../assets/audio/message/nan_congrats_navy_job.mp3';
import message_navy_return_fire from '../assets/audio/message/navy_return_fire.mp3';

import transitionWiffyAhaha from '../assets/audio/music/transition-wiffy-to-ahaa.mp3';
import transition_comfortably_numb_to_danger from '../assets/audio/music/_transition_comfortably_numb_to_danger.mp3';
import transition_moby_comfortably_numb from '../assets/audio/music/_transition_moby_comfortably_numb.mp3';

import wiffyInstrumentalSrc from '../assets/audio/music/wiffy-instrumental-64kBits.mp3';
import mobyInThisWorld from '../assets/audio/music/Moby - In This World.mp3';
import portisheadMysterons from '../assets/audio/music/Portishead - Mysterons.mp3';
import radioSoulwax23DangerHighVoltage from '../assets/audio/music/RadioSoulwax-23DangerHighVoltage.mp3';
import scissorSistersComfortablyNumb from '../assets/audio/music/Scissor Sisters - Comfortably Numb.mp3';
import ahahaSrc from '../assets/audio/music/ahahahaaa-64kBits.mp3';
import episode24Src from '../assets/audio/music/episode24.mp3';

import bigLaser from '../assets/audio/sfx/quaddamage_shoot.ogg';
import laser from '../assets/audio/sfx/quaddamage_out.ogg';
import laserHit from '../assets/audio/sfx/explosion_small.mp3';
import bigLaserHit from '../assets/audio/sfx/explosion_underwater_distant.mp3';
import explosion from '../assets/audio/sfx/explosion_large_distant.mp3';

const allSounds = [
  { id: 'laser', src: laser },
  { id: 'bigLaser', src: bigLaser },
  { id: 'laserHit', src: laserHit },
  { id: 'bigLaserHit', src: bigLaserHit },
  { id: 'explosion', src: explosion },
  { id: 'episode-24', src: episode24Src },
  // messages
  { id: 'new_message', src: new_message },
  { id: 'end_of_message', src: end_of_message },
  { id: 'new_radio_message', src: new_radio_message },
  { id: 'end_of_radio_message', src: end_of_radio_message },
  { id: 'message_nana_crisps', src: message_nana_crisps },
  { id: 'message_boss_backtowork', src: message_boss_backtowork },
  { id: 'message_boss_finally', src: message_boss_finally },
  { id: 'message_nana_bad_news', src: message_nana_bad_news },
  { id: 'message_nan_congrats_navy_job', src: message_nan_congrats_navy_job },
  { id: 'message_navy_return_fire', src: message_navy_return_fire },
  // transitions
  { id: 'transition-wiffy2aha', src: transitionWiffyAhaha },
  { id: 'transition_comfortably_numb_to_danger', src: transition_comfortably_numb_to_danger },
  { id: 'transition_moby_comfortably_numb', src: transition_moby_comfortably_numb },
  // music
  { id: 'music-wiffy', src: wiffyInstrumentalSrc },
  { id: 'music-aha', src: ahahaSrc },
  { id: 'mobyInThisWorld', src: mobyInThisWorld },
  { id: 'portisheadMysterons', src: portisheadMysterons },
  { id: 'radioSoulwax23DangerHighVoltage', src: radioSoulwax23DangerHighVoltage },
  { id: 'scissorSistersComfortablyNumb', src: scissorSistersComfortablyNumb },
];

export const AUDIO_RANGE_PX = 800;

const AUDIO_STORE_KEY = 'audioSettings';

const audioSettings = {
  on: true,
  masterVol: 1,
  musicVol: 1,
  ...getKey(AUDIO_STORE_KEY),
};

export function getSettings() {
  return { ...audioSettings };
}

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

const defaultCollectionState = {
  index: 0,
  ids: [],
  loop: false,
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
    playSingleAudio({
      id: getCurrentTrackId(),
      gainNode: musicGainNode,
      setVolume: false, // // don’t want to override the music gainNode vol
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

export async function stopSound(id) {
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

export async function stopCollection() {
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
    if (ids.length < 1) {
      return;
    }
    console.log('playCollection part 2', ids.join(', '));
    _global.collection = { ids, index, loop };
    nextTrack(0);
  });
}

export async function playSingleAudio({
  id,
  vol = 1,
  setVolume = true,
  gainNode = audioCtx.createGain(),
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

    console.log('playSingleAudio stopSound', id);
    stopSound(id).then(() => {
      console.log('playSingleAudio start', id);
      if (setVolume) {
        gainNode.gain.value = audioSettings.masterVol * vol;
      }
      playing[id] = getBufferSource(track.audioBuffer, gainNode);
      playing[id].start();

      playing[id].onended = () => {
        console.log('playSingleAudio onended - resolve', id);
        delete playing[id];
        resolve();
      };
    });
  });
}

window.playSingleAudio = playSingleAudio;

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
  gainNode.gain.value = audioSettings.masterVol * vol;
  const trackSource = getBufferSource(audioBuffer, gainNode);
  trackSource.start();
  return trackSource;
}

export function setVolume(vol, volumeKey) {
  audioSettings[volumeKey] = Math.max(0, Math.min(1, vol));
  // update music volume
  musicGainNode.gain.value = audioSettings.masterVol * audioSettings.musicVol;
  // update the store
  saveKey(AUDIO_STORE_KEY, audioSettings);
  // return new volume
  return audioSettings[volumeKey];
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
