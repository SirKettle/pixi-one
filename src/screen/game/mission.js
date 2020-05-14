import { getAsset } from '../../utils/assetStore';
import { getMission } from '../../specs/levels';
import { getAllActorsInTeams } from '../../utils/actor';

export const updateMission = (game, delta, deltaMs) => {
  const { time, levelKey, missionKey, player, dashboardDisplayTextId, settings } = game;
  const app = getAsset(game.app);
  const prevSession = time.session;
  const elapsedMs = prevSession.elapsedMs + deltaMs;
  const elapsedCs = Math.floor(elapsedMs / 100);
  const elapsedS = Math.floor(elapsedMs / 1000);

  const mission = getMission(levelKey, missionKey);

  if (!time.paused) {
    time.mission.elapsedMs += deltaMs;
  }

  // every 0.1 seconds
  if (elapsedCs !== prevSession.elapsedCs) {
    // onSaveGame(state);

    const hostileTeams = player.data.hostileTeams || [];
    const hostileCount = getAllActorsInTeams(game, hostileTeams).length;
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
    const { cachedAreaKey, discoveredAreas } = game;
    const discoveredAreaKeys = Object.keys(discoveredAreas);
    // end world generator file

    if (hostileTeams.length) {
      missionInfo.push(`\nHostiles: ${hostileCount}`);
      missionInfo.push(`Friends: ${getAllActorsInTeams(game, mission.player.team).length}`);
    }

    missionInfo.push(`Health: ${Math.floor(player.data.life)}`);

    missionInfo.push(`\nCoords: ${Math.floor(player.data.x)}, ${Math.floor(player.data.y)}`);
    missionInfo.push(`Area key: ${cachedAreaKey}`);
    missionInfo.push(`Areas discovered: ${discoveredAreaKeys.length}`);

    const debugText = settings.isDebugDisplayMode
      ? `DEBUG (Press 'd' to toggle)
FPS: ${Math.floor(app.ticker.FPS)}
Session time: ${elapsedS}`
      : '';

    const dashboardDisplayText = getAsset(dashboardDisplayTextId);

    dashboardDisplayText.text = `${missionInfo.join('\n')}

${debugText}
`;
  }

  game.time = {
    ...time,
    session: {
      elapsedMs,
      elapsedCs,
      elapsedS,
    },
  };
};
