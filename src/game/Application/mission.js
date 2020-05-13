import { getAsset } from '../store/pixiAssets';
import { getMission } from '../specs/levels';
import { getAllActorsInTeams } from '../utils/actor';

export const updateMission = (pixiGame, delta, deltaMs, ticker) => {
  const { time } = pixiGame;
  const prevSession = time.session;
  const elapsedMs = prevSession.elapsedMs + deltaMs;
  const elapsedCs = Math.floor(elapsedMs / 100);
  const elapsedS = Math.floor(elapsedMs / 1000);

  const mission = getMission(pixiGame.levelKey, pixiGame.missionKey);

  if (!time.paused) {
    time.mission.elapsedMs += deltaMs;
  }

  // every 0.1 seconds
  if (elapsedCs !== prevSession.elapsedCs) {
    // onSaveGame(state);

    const hostileTeams = pixiGame.player.data.hostileTeams || [];
    const hostileCount = getAllActorsInTeams(pixiGame, hostileTeams).length;
    const missionComplete = hostileCount === 0;
    const missionInfo = [];

    missionInfo.push(`${missionComplete ? 'Complete' : 'Mission'}: ${mission.description}`);

    if (mission.allowedTimeMs) {
      missionInfo.push(
        `Countdown: ${Math.floor((mission.allowedTimeMs - time.mission.elapsedMs) / 1000)}${
          time.paused ? ' (PAUSED)' : ''
        }`
      );
    }

    // move this to world generator file
    const { cachedAreaKey, discoveredAreas } = pixiGame;
    const discoveredAreaKeys = Object.keys(discoveredAreas);
    // end world generator file

    if (hostileTeams.length) {
      missionInfo.push(`\nHostiles: ${hostileCount}`);
      missionInfo.push(`Friends: ${getAllActorsInTeams(pixiGame, mission.player.team).length}`);
    }

    missionInfo.push(`Health: ${Math.floor(pixiGame.player.data.life)}`);

    missionInfo.push(
      `\nCoords: ${Math.floor(pixiGame.player.data.x)}, ${Math.floor(pixiGame.player.data.y)}`
    );
    missionInfo.push(`Area key: ${cachedAreaKey}`);
    missionInfo.push(`Areas discovered: ${discoveredAreaKeys.length}`);

    const debugText = pixiGame.isDebugDisplayMode
      ? `DEBUG (Press 'd' to toggle)
FPS: ${Math.floor(ticker.FPS)}
Session time: ${elapsedS}`
      : '';

    const dashboardDisplayText = getAsset(pixiGame.dashboardDisplayTextId);

    dashboardDisplayText.text = `${missionInfo.join('\n')}

${debugText}
`;
  }

  return {
    ...time,
    session: {
      elapsedMs,
      elapsedCs,
      elapsedS,
    },
  };
};
