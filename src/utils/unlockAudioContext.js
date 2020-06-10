import { AudioContext } from 'standardized-audio-context';

const eventTypes = 'ontouchstart' in window ? ['touchstart', 'touchend'] : ['click'];

export default function unlockAudioContext(context) {
  return new Promise((resolve, reject) => {
    const unlock = () => {
      context.resume().then(
        () => {
          eventTypes.forEach((eventType) => {
            document.body.removeEventListener(eventType, unlock);
          });

          resolve(true);
        },
        (reason) => {
          reject(reason);
        }
      );
    };

    if (
      !context ||
      !(context instanceof (AudioContext || window.AudioContext || window.webkitAudioContext))
    ) {
      reject(
        'unlockAudioContext: You need to pass an instance of AudioContext to this method call'
      );
      return;
    }

    if (context.state === 'suspended') {
      eventTypes.forEach((eventType) => {
        document.body.addEventListener(eventType, unlock, false);
      });
    } else {
      resolve(false);
    }
  });
}
