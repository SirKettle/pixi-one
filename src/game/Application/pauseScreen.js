import { path } from "ramda";
import { getAsset } from "../store/pixiAssets";


export function updatePauseScreen(pixiGame) {
  const isPaused = path(['time', 'paused'])(pixiGame);
  const blurFilter = getAsset(path(['filterIds', 'blur'])(pixiGame));

  if (blurFilter) {
    blurFilter.blur = isPaused ? 7 : 0;
  }
  if (!isPaused) {
    return;
  }
}
