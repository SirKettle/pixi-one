import { prop, propOr } from 'ramda';
import {
  getSettings,
  play,
  playCollection,
  playSingleAudio,
  setVolume,
  toggleAudio,
} from '../utils/audio';
import { queuePromise } from '../utils/promise';
import { speak } from './speech';

export function playTracks(ids) {
  return playCollection({ ids });
}

export async function playSingleSound(id, vol) {
  return playSingleAudio({ id, vol });
}

export function playSound(id, vol) {
  return play(id, vol);
}

export function toggleSound() {
  return toggleAudio();
}

export function toggleMusic() {
  // TODO: add functionality
  // maybe pause current collection and resume it somehow...
  console.log('TODO: need to toggle the current collection playing/pausing');
}

export function setMasterVolume(vol) {
  return setVolume(vol, 'masterVol');
}

export function setMusicVolume(vol) {
  return setVolume(vol, 'musicVol');
}

export function adjustMasterVolume(adjustment) {
  const settings = getSettings();
  return setMasterVolume(settings.masterVol + adjustment);
}

export function adjustMusicVolume(adjustment) {
  const settings = getSettings();
  return setMusicVolume(settings.musicVol + adjustment);
}

// todo: create a message queue.
// 1. add new message which returns a promise - resolves after message ends
// 2. if message already playing, waits until the previous message ends before starting

// const messageQueue = [];
// const playingMessage = false;
//
// function addMessageToQueue (newMessage) {
//   const deferred = new Promise(resolve => {
//
//     if (playingMessage) {
//     }
//   })
//
// }

// addToQueue(playMessage()).then()

// todo: add a new volume parameter to audio - temp fade
// 1. this should not be saved anywhere
// 2. if set, music gainnode uses the fadeVol if set otherwise musicVol
// 3. fadeVol should be reset at appropriate times

async function playMessage({ id, vol = 1, startSoundId, endSoundId }) {
  return queuePromise({
    queueId: 'message',
    promise: () => {
      const cacheMusicVol = propOr(1, 'musicVol')(getSettings());
      return fadeMusic(0.2, 1000).then(() => {
        return playSingleSound(startSoundId, vol).then(() => {
          return playSingleSound(id, vol).then(() => {
            return playSingleSound(endSoundId, vol).then(() => {
              return fadeMusic(cacheMusicVol, 2000);
            });
          });
        });
      });
    },
  });
}

async function wrapMessage({ id, vol = 1, startMessage = 'You have one new message.', endMessage = 'End of message'}) {
  return queuePromise({
    queueId: 'message',
    promise: () => {
      const cacheMusicVol = propOr(1, 'musicVol')(getSettings());
      return fadeMusic(0.2, 1000).then(() => {
        return speak(startMessage).then(() => {
        // return playSingleSound(startSoundId, vol).then(() => {
          return playSingleSound(id, vol).then(() => {
            return speak(endMessage).then(() => {
            // return playSingleSound(endSoundId, vol).then(() => {
              return fadeMusic(cacheMusicVol, 2000);
            });
          });
        });
      });
    },
  });
}

export async function queueSpeech(message = 'You have one new message.', voiceIndex) {
  return queuePromise({
    queueId: 'message',
    promise: () => {
      const cacheMusicVol = propOr(1, 'musicVol')(getSettings());
      return fadeMusic(0.2, 1000).then(() => {
        return speak(message).then(() => {
          return fadeMusic(cacheMusicVol, 2000);
        });
      });
    },
  });
}

export async function playPhoneMessage(id, vol = 1) {
  // return playMessage({ id, vol, startSoundId: 'new_message', endSoundId: 'end_of_message' });
  return wrapMessage({ id, vol });
}

export async function playRadioMessage(id, vol = 1) {
  return playMessage({
    id,
    vol,
    startSoundId: 'new_radio_message',
    endSoundId: 'end_of_radio_message',
  });
}

export async function fadeMusic(vol, fadeTimeMs = 1000, fadeStepMs = 50) {
  const currentMusicVol = propOr(1, 'musicVol')(getSettings());
  const diff = vol - currentMusicVol;
  const isFadeOut = diff < 0;
  const steps = fadeTimeMs / fadeStepMs;
  const stepAdjustment = diff / steps;
  return new Promise((resolve) => {
    const intervalId = setInterval(() => {
      const newVol = adjustMusicVolume(stepAdjustment);
      if ((isFadeOut && newVol <= vol) || (!isFadeOut && newVol >= vol)) {
        clearInterval(intervalId);
        setMusicVolume(vol);
        resolve();
      }
    }, fadeStepMs);
  });
}

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
