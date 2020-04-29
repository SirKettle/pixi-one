const mission = {
  type: 'PATROL',
  target: 'PLAYER',
  coords: [
    { x: 12, y: 18 },
    { x: -2112, y: 1291 },
  ],
};

function onUpdate() {
  const currentCoords = { x: 12, y: 18 };

  if (isTargetInRange()) {
    followTarget();
  } else {
    followCoords();
  }
}
