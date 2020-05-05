export const getHorizontalFrameRect = (frameIndex, width, height) => {
  return { x: frameIndex * width, y: 0, width, height };
};
