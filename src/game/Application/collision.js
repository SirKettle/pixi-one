export const getSpriteRadius = (sprite) =>
  Math.max(sprite.width, sprite.height) * 0.5;

export const circleIntersect = (x1, y1, r1, x2, y2, r2) => {
  // Calculate the distance between the two circles
  const squareDistance = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);

  // When the distance is smaller or equal to the sum
  // of the two radius, the circles touch or overlap
  return squareDistance <= (r1 + r2) * (r1 + r2);
};

export const isSpriteCircleIntersect = (actor1, actor2) => {
  return circleIntersect(
    actor1.data.x,
    actor1.data.y,
    getSpriteRadius(actor1.sprite),
    actor2.data.x,
    actor2.data.y,
    getSpriteRadius(actor2.sprite)
  );
};

export const isCollision = (actor1, actor2) => {
  return isSpriteCircleIntersect(actor1, actor2);
};
