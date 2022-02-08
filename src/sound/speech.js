const synth = window.speechSynthesis;

const speechApi = {};

function populateVoiceList() {
  function getVoices() {
    return synth.getVoices().sort(function (a, b) {
      const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
      if ( aname < bname ) return -1;
      else if ( aname == bname ) return 0;
      else return +1;
    });
  }

  return new Promise(resolve => {
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = () => {
        resolve(getVoices())
      };
    } else {
      resolve(getVoices())
    }
  });
}

export const initSpeech = () => {
  return populateVoiceList().then(voices => {
    console.log('voices populated', voices.length);
    speechApi.voices = voices;
    speechApi.englishVoices = voices.filter(v => v.lang.startsWith('en'));
    speechApi.nonEnglishVoices = voices.filter(v => !v.lang.startsWith('en'));
  });
}

export const getVoices = () => speechApi.voices;

export const speak = (message = 'Something', voiceIndex = 13) => {
  return new Promise((resolve, reject) => {

    if (synth.speaking) {
      reject('speechSynthesis.speaking');
      return;
    }
    if (!message) {
      reject('no message');
      return;
    }
    if (!speechApi.voices) {
      reject('no voices');
      return;
    }

    // const voice = speechApi.nonEnglishVoices[voiceIndex];
    const voice = speechApi.englishVoices[voiceIndex];
    if (!voice) {
      reject('no matching voice');
      return;
    }
    
    const utterThis = new SpeechSynthesisUtterance(message);
    // const utterThis = new SpeechSynthesisUtterance('Hi, my name is ' + voice.name + '. It is nice to meet you.');
    // const utterThis = new SpeechSynthesisUtterance('Hi, I am ' + voice.name + '. Nice to meet you Vicky');
    
    utterThis.onend = function (event) {
      resolve('SpeechSynthesisUtterance.onend');
    }
    
    utterThis.onerror = function (event) {
      reject('SpeechSynthesisUtterance.onerror');
    }
    
    utterThis.voice = voice;
    utterThis.rate = 1;
    utterThis.pitch = 1;
    synth.speak(utterThis);
  })
};

window._speak = speak;

// inputForm.onsubmit = function(event) {
//   event.preventDefault();

//   speak();

//   inputTxt.blur();
// }

// pitch.onchange = function() {
//   pitchValue.textContent = pitch.value;
// }

// rate.onchange = function() {
//   rateValue.textContent = rate.value;
// }

// voiceSelect.onchange = function(){
//   speak();
// }
