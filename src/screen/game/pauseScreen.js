import { path } from "ramda";
import { getAsset } from "../../utils/assetStore";


export function updatePauseScreen(game) {
  const isPaused = path(['time', 'paused'])(game);
  const blurFilter = getAsset(path(['filterIds', 'blur'])(game));

  if (blurFilter) {
    blurFilter.blur = isPaused ? 7 : 0;
  }
  if (!isPaused) {
    return;
  }
}
