export const getVelocity = ({ speed = 0, direction = 0 }) => ({
  x: Math.sin(direction) * speed,
  y: -(Math.cos(direction) * speed),
});

export const defaultVector = { x: 0, y: 0 };

export const relativeVelocity = (vA = defaultVector, vB = defaultVector) => ({
  x: vA.x - vB.x,
  y: vA.y - vB.y,
});

export const combineVelocity = (vA = defaultVector, vB = defaultVector) => ({
  x: vA.x + vB.x,
  y: vA.y + vB.y,
});

export function getCollisionNorm(
  vActorAPosition = defaultVector,
  vActorBPosition = defaultVector
) {
  const vCollision = {
    x: vActorBPosition.x - vActorAPosition.x,
    y: vActorBPosition.y - vActorAPosition.y,
  };
  const distance = Math.hypot(vCollision.x, vCollision.y);

  return distance === 0
    ? defaultVector
    : {
        x: vCollision.x / distance,
        y: vCollision.y / distance,
      };
}

export function getCollisionSpeed(
  vCollisionNorm = defaultVector,
  vRelativeVelocity = defaultVector
) {
  return (
    vRelativeVelocity.x * vCollisionNorm.x +
    vRelativeVelocity.y * vCollisionNorm.y
  );
}
