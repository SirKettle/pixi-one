export const getLoader = (app) => app.loader;
export const getResources = (app) => getLoader(app).resources || {};
export const getResource = (app) => (key) => getResources(app)[key] || {};
export const getResourceTexture = (app) => (key) =>
  getResource(app)(key).texture;
