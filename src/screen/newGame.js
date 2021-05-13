import { getAsset } from '../utils/assetStore';
import { goTo, SCREEN_LEVEL_SELECT, SCREEN_PLAY } from '../utils/screen';
import { textButton } from '../utils/button';

export function showNewGame(game) {
  const app = getAsset(game.app);
  const container = getAsset(game.containers.info);
  container.removeChildren();
  const newGameButton = textButton(`New\ngame`);
  newGameButton.position.set(app.screen.width / 2, app.screen.height / 2);
  newGameButton.on('pointerdown', () => goToScreen(game, SCREEN_LEVEL_SELECT));
  container.addChild(newGameButton);
}

function goToScreen(game, screen) {
  // reset state
  reset(game);
  goTo(game, screen);
}

function reset(game) {
  const container = getAsset(game.containers.info);
  container.removeChildren();
}
