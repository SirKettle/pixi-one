import { prop, propOr } from 'ramda';
import {
  getSettings,
  play,
  playCollection,
  playSingleAudio,
  setVolume,
  toggleAudio,
} from '../utils/audio';

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

export async function playMessage(id, vol) {
  const cacheMusicVol = propOr(1, 'musicVol')(getSettings());
  return fadeMusic(0, 1000).then(() => {
    return playSingleSound('new_mesage', vol).then(() => {
      return playSingleSound(id, vol).then(() => {
        return playSingleSound('end_of_message', vol).then(() => {
          return fadeMusic(cacheMusicVol, 2000);
        });
      });
    });
  });
}

export async function broadcast(id, vol) {
  const cacheMusicVol = propOr(1, 'musicVol')(getSettings());
  return fadeMusic(0, 2000).then(() => {
    return playSingleSound(id, vol).then(() => {
      return fadeMusic(cacheMusicVol, 2000);
    });
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
