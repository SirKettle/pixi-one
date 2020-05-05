export const getVelocity = ({ speed = 0, direction = 0 }) => ({
  x: Math.sin(direction) * speed,
  y: -(Math.cos(direction) * speed),
});

export const defaultVelocity = { x: 0, y: 0 };

export const getRelativeVelocity = (
  vA = defaultVelocity,
  vB = defaultVelocity
) => ({
  x: vA.x + vB.x,
  y: vA.y + vB.y,
});

export const combineVelocity = (
  vA = defaultVelocity,
  vB = defaultVelocity
) => ({
  x: vA.x + vB.x,
  y: vA.y + vB.y,
});
