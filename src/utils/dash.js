let _log = {};
let _meter = {};
const _counters = {};

export const clearDash = () => {
  _log = {};
  _meter = {};
  Object.keys(_counters).forEach(key => {
    _counters[key] = 0;
  });
}

export const count = (key) => {
  _counters[key] = typeof _counters[key] === 'number' ? _counters[key] + 1 : 1;
}

export const dashLog = (key, value) => {
  _log[key] = value;
}

export const logMeter = ({key, value, max = 100, steps = 20, desiredMax, label }) => {
  const units = Math.min(Math.round((value / max) * steps), steps);
  const desiredMaxUnits = desiredMax ? Math.min(Math.round((desiredMax / max) * steps), steps) : units;
  const blanks = steps - units;
  let meter = '';
  for (let i = 0; i < steps; ++i) {
    meter = meter + (i < units ? (i < desiredMaxUnits ? '@' : 'X') : '.');
  }
  _meter[key] = `|${meter}| ${label || value}`;
}





export const getCounters = (key) => {
  return key ? _counters[key] : { ..._counters };
}

export const getLog = (key) => {
  return key ? _log[key] : { ..._log };
}

export const getMeters = (key) => {
  return key ? _meter[key] : { ..._meter };
}


const _timers = {};

export const startTimer = (key) => {
  _timers[key] = Date.now();
  return _timers[key];
}

export const elapsedTime = (key) => {
  return Date.now() - (_timers[key] || 0)
}