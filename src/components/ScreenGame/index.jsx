import React, { memo, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { initPixi } from '../../game/Application';
import { Wrapper } from '../Wrapper';
import { Heading } from '../Typography';

const Canvas = styled.canvas`
  display: block;
  background: blue;
  margin: 0;
`;

export const ScreenGame = memo(({ onQuitGame, onSaveGame, game }) => {
  // From here on - Pixi should handle the state of the game - React maybe too slow to handle updates
  // const [pixiGame, setPixiGame] = useState({});
  const canvasEl = useRef(null);

  useEffect(() => {
    console.log('INIT pixi app');
    initPixi({
      view: canvasEl.current,
      gameState: game,
      onQuitGame,
      onSaveGame,
      onSaveAndExitGame: (gameState) => {
        onSaveGame(gameState);
        onQuitGame();
      },
    });
  }, []);
  //
  // useEffect(() => {
  //   return () => {
  //     if (pixiGame.app && typeof pixiGame.app.destroy === 'function') {
  //       console.log('destroy pixi app');
  //       pixiGame.app.destroy();
  //     }
  //   };
  // }, [pixiGame.initialized]);

  return (
    <Wrapper name="ScreenGame">
      <Canvas ref={canvasEl} />
    </Wrapper>
  );
});
      {/*<Heading as="h3">Current game</Heading>*/}
// {JSON.stringify(game)}
