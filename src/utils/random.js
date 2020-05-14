export function doEveryMs(func, deltaMs, perMs = 1000) {
  const odds = deltaMs / perMs;
  const pass = Math.random() < odds;
  if (pass) {
    func();
  }
}

export function getRandomInt(min = 0, max = 100) {
  const range = max - min + 1;
  return Math.floor(Math.random() * range + min);
}
