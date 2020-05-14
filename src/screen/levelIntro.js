import { getAsset } from '../utils/assetStore';
import { getLevel } from '../specs/levels';
import { goTo, SCREEN_PLAY } from '../utils/screen';

export function showLevelIntro(game) {
  const level = getLevel(game.levelKey);
  const dashboardDisplayText = getAsset(game.dashboardDisplayTextId);
  dashboardDisplayText.text = 'Level Intro - ' + level.description;

  setTimeout(() => {
    goTo(game, SCREEN_PLAY);
  }, 3000);
}
