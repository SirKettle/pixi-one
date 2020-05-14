import { getAsset } from '../utils/assetStore';

export function showLoading(game) {
  const dashboardDisplayText = getAsset(game.dashboardDisplayTextId);
  dashboardDisplayText.text = 'Loading...';
}
