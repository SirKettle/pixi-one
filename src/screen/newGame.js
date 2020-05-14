import { getAsset } from '../utils/assetStore';
import { goTo, SCREEN_LEVEL_SELECT } from '../utils/screen';

export function showNewGame(game) {
  const dashboardDisplayText = getAsset(game.dashboardDisplayTextId);
  dashboardDisplayText.text = 'Will take you to level select screen in few moments';

  setTimeout(() => {
    goTo(game, SCREEN_LEVEL_SELECT);
  }, 2000);
}
