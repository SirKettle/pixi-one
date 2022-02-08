import { propEq, propOr } from 'ramda';
import { getAsset } from '../../utils/assetStore';
import { getCounters, getLog, getMeters } from '../../utils/dash';
import { getAllActorsInTeams } from '../../utils/actor';
import { getMission } from '../../levels';
import { actionEvent } from '../../levels/utils/events';
import { OBJECTIVE_TYPE_GO_TO_WAYPOINT } from '../../levels/utils/objective';

// extract into separate modules
// - session/time/clock
// - mission/objectives
// - display/dashboard
// - debug console
export const updateMission = (game, delta, deltaMs) => {
  const { time, levelKey, player, dashboardDisplayTextId, settings } = game;
  const app = getAsset(game.app);
  const prevSession = time.session;
  const elapsedMs = prevSession.elapsedMs + deltaMs;
  const elapsedCs = Math.floor(elapsedMs / 100);
  const elapsedS = Math.floor(elapsedMs / 1000);

  const mission = getMission(levelKey);

  if (!time.paused) {
    time.mission.elapsedMs += deltaMs;
  }

  // every 1 second check
  if (elapsedS !== prevSession.elapsedS) {
    const { levelData } = game;
    const { eventHistory } = levelData;
    propOr(
      [],
      'events'
    )(game)
      .filter((e) => !eventHistory.includes(e.uid))
      .forEach((e) => {
        if (time.mission.elapsedMs >= e.startTimeMs) {
          levelData.eventHistory = [...eventHistory, e.uid];
          actionEvent(game, e);
        }
      });
  }

  if (elapsedCs !== prevSession.elapsedCs) {
    // onSaveGame(state);

    const hostileTeams = player.data.hostileTeams || [];
    const hostileActors = getAllActorsInTeams(game, hostileTeams);
    const hostileCount = Object.keys(hostileActors).length;
    const friendlies = getAllActorsInTeams(game, mission.player.team);
    const friendliesCount = Object.keys(friendlies).length;
    const missionComplete = hostileCount === 0;
    const missionInfo = [`\n\n`];

    missionInfo.push(`${missionComplete ? 'Complete' : 'Mission'}: ${mission.description}`);

    if (mission.allowedTimeMs) {
      missionInfo.push(
        `Countdown: ${Math.floor((mission.allowedTimeMs - time.mission.elapsedMs) / 1000)}${
          time.paused ? ' (PAUSED)' : ''
        }`
      );
      missionInfo.push(`Mission time elapsed: ${Math.floor(time.mission.elapsedMs / 1000)}`);
    }

    // move this to world generator file
    const { cachedAreaKey, discoveredAreas } = game;
    const discoveredAreaKeys = Object.keys(discoveredAreas);
    // end world generator file

    if (hostileTeams.length) {
      missionInfo.push(`\nHostiles: ${hostileCount}`);
      missionInfo.push(`Friends: ${friendliesCount}`);
    }


    missionInfo.push(`\nHealth: ${Math.floor(player.data.life)}`);

    missionInfo.push(`\nCoords: ${Math.floor(player.data.x)}, ${Math.floor(player.data.y)}`);
    missionInfo.push(`Area key: ${cachedAreaKey}`);
    // missionInfo.push(`Areas discovered: ${discoveredAreaKeys.length}`);

    

    const debugText = settings.isDebugDisplayMode
      ? `DEBUG (Press 'd' to toggle)
Session time: ${elapsedS}

${Object.keys(getMeters()).map(k => `${k}: ${getMeters(k)}`).join('\n')}

${Object.keys(getCounters()).map(k => `${k}: ${getCounters(k)}`).join('\n')}

${Object.keys(getLog()).map(k => `${k}: ${getLog(k)}`).join('\n')}
`
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
