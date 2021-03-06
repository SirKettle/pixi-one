import { omit, pick, prop, reduce } from 'ramda';
import { v4 as generateUid } from 'uuid';

// TODO: move to array utils
const getRandomArrayIndex = (arr) => Math.floor(Math.random() * arr.length);
const getRandomArrayItem = (arr) => arr[getRandomArrayIndex(arr)];

const randomNames = ['Benny Boo', 'Sloppety Slop', 'Captain Crikey', 'Donald Trump'];
const generateName = () => getRandomArrayItem(randomNames);

const SAVED_GAMES_KEY = 'savedGames';

export const loadGame = (id) => {
  const savedGames = getSavedGames();

  if (!savedGames[id]) {
    console.error('Game not found - loadGame', id);
  }

  return savedGames[id];
};

export const deleteGame = (id) => {
  const savedGames = getSavedGames();

  if (!savedGames[id]) {
    console.error('Game not found - deleteGame', id);
  }

  saveKey(SAVED_GAMES_KEY, omit([id])(savedGames));
};

export const saveGame = (data = {}) => {
  const nowDateString = new Date().toISOString();
  const savedGames = getSavedGames();

  const id = data.id || generateUid();
  const modifiedDate = nowDateString;
  const startDate = data.startDate || nowDateString;
  const name = data.name || generateName();

  const game = {
    ...data,
    id,
    name,
    modifiedDate,
    startDate,
  };

  saveKey(SAVED_GAMES_KEY, {
    ...savedGames,
    [id]: game,
  });

  return game;
};

export const getSavedGames = () => getKey(SAVED_GAMES_KEY);

const sortByModifiedDate = (a, b) => (prop('modifiedDate')(a) > prop('modifiedDate')(b) ? -1 : 1);

export const getSavedGamesInfo = () => {
  const savedGamesInfoArray = reduce((acc, [key, value]) => {
    return [...acc, { key, ...pick(['id', 'modifiedDate', 'name'])(value) }];
  }, [])(Object.entries(getSavedGames()));

  return savedGamesInfoArray.sort(sortByModifiedDate);
};

export function store(key, data) {
  if (data) {
    return saveKey(key, data);
  }
  return getKey(key);
}

export function getKey(key) {
  const serializedSavedGames = localStorage.getItem(key);
  if (serializedSavedGames) {
    try {
      return JSON.parse(serializedSavedGames);
    } catch (e) {
      console.error(e);
    }
  }
  return {};
}

export function saveKey(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return data;
  } catch (e) {
    console.error(e);
  }
  return {};
}
