import React, { memo, useCallback, useEffect, useReducer } from 'react';
import { prop } from 'ramda';

import {
  deleteGame,
  getSavedGamesInfo,
  loadGame,
  saveGame,
} from '../../utils/store';

import { ScreenLaunch } from '../ScreenLaunch';
import { ScreenGame } from '../ScreenGame';
import { Wrapper } from '../Wrapper';
import { Heading } from '../Typography';

const initialState = {
  savedGames: getSavedGamesInfo(),
  screen: 'LAUNCH',
  settings: {},
  game: void 0,
  error: void 0,
};

const reducer = (state, action) => {
  const { type, payload } = action;
  console.log('dispatch', type);
  switch (type) {
    case 'LOAD_SAVED_GAMES': {
      return { ...state, savedGames: getSavedGamesInfo() };
    }
    case 'DELETE_GAME': {
      const id = prop('id')(payload);
      deleteGame(id);
      return { ...state, savedGames: getSavedGamesInfo() };
    }
    case 'START_NEW_GAME': {
      const game = saveGame(payload); // save a blank game will create new record
      return { ...state, game, screen: 'GAME' };
    }
    case 'QUIT_GAME': {
      return { ...state, game: void 0, screen: 'LAUNCH' };
    }
    case 'LOAD_GAME': {
      const id = prop('id')(payload);
      const game = loadGame(id);
      if (!game) {
        return { ...state, error: `Unable to find game with id(${id})` };
      }
      return { ...state, game, screen: 'GAME' };
    }
    case 'SAVE_GAME': {
      const game = saveGame(prop('game')(payload));

      return { ...state, game };
    }
  }
};

// This is the main controller which controls:
// which screen to show - routing
// api to store - loading/saving games and settings
// handling all non-game state
export const GameContainer = memo(() => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (state.screen === 'LAUNCH') {
      dispatch({ type: 'LOAD_SAVED_GAMES' });
    }
  }, [state.screen]);

  const handleLoadGame = (id) => () => {
    dispatch({ type: 'LOAD_GAME', payload: { id } });
  };

  const handleDeleteGame = (id) => () => {
    dispatch({ type: 'DELETE_GAME', payload: { id } });
  };

  const handleStartNewGame = ({ name }) => () => {
    dispatch({ type: 'START_NEW_GAME', payload: { name } });
  };

  const handleSaveGame = (game) => {
    dispatch({ type: 'SAVE_GAME', payload: { game } });
  };

  const handleQuitGame = () => {
    dispatch({ type: 'QUIT_GAME' });
  };

  const renderScreen = useCallback(() => {
    switch (state.screen) {
      case 'LAUNCH':
        return (
          <ScreenLaunch
            onDeleteGame={handleDeleteGame}
            onLoadGame={handleLoadGame}
            onStartNewGame={handleStartNewGame}
            savedGames={state.savedGames}
          />
        );

      case 'GAME':
        // for now lets not add state.game to the listeners below
        // it may end up re rendering the game window which is
        // not desirable.
        return (
          <ScreenGame
            game={state.game}
            onSaveGame={handleSaveGame}
            onQuitGame={handleQuitGame}
          />
        );
    }

    return null;
  }, [state.screen, state.savedGames]);

  return <Wrapper name="GameContainer">{renderScreen()}</Wrapper>;
});
