export default {
  key: '404',
  description: 'Mission description not set',
  allowedTimeMs: 30 * 1000,
  player: {
    hostileTeams: ['bad'],
    team: 'good',
    assetKey: 'spacecraft',
  },
  objectives: {
    all: true,
  },
  actors: [],
  passiveActors: [],
  soundCollection: ['music-wiffy', 'transition-wiffy2aha', 'music-aha'],
};
