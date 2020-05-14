export const SCREEN_LOADING = 'SCREEN_LOADING';
export const SCREEN_NEW_GAME = 'SCREEN_NEW_GAME';
export const SCREEN_LEVEL_SELECT = 'SCREEN_LEVEL_SELECT';
export const SCREEN_LEVEL_INTRO = 'SCREEN_LEVEL_INTRO';
export const SCREEN_MISSION_INFO = 'SCREEN_MISSION_INFO'; // (use as pause too?)
export const SCREEN_PLAY = 'SCREEN_PLAY';

export function goTo(game, screen, params = {}) {
  game.screen = screen;
  game.screenParams = params;
}
