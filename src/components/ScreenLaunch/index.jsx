import React, { memo, useCallback, useState } from 'react';
import { Wrapper } from '../Wrapper';
import { Heading, Paragraph, SecondaryText } from '../Typography';

export const ScreenLaunch = memo(
  ({ onDeleteGame, onLoadGame, onStartNewGame, savedGames }) => {
    const [playerName, setPlayerName] = useState(void 0);

    const handleNameChange = useCallback(({ target: { value } }) => {
      setPlayerName(value || void 0);
    }, []);

    return (
      <Wrapper name="ScreenLaunch">
        <Heading as="h3">Saved games</Heading>
        {savedGames.map((sg) => (
          <Paragraph as="p" key={sg.id}>
            {sg.name} -{' '}
            <SecondaryText>
              {new Date(sg.modifiedDate).toLocaleString()}
            </SecondaryText>
            <button onClick={onLoadGame(sg.id)}>Load</button>
            <button onClick={onDeleteGame(sg.id)}>Delete</button>
          </Paragraph>
        ))}
        <input type="text" placeholder="Player 1" onChange={handleNameChange} />
        <button onClick={onStartNewGame({ name: playerName })}>
          Start new game
        </button>
      </Wrapper>
    );
  }
);
