import { identity, reduce, times } from 'ramda';

export const getHorizontalFrameRect = (frameIndex, width, height) => {
  return { x: frameIndex * width, y: 0, width, height };
};

export const getFrameRects = ({ width, height, columns = 3, total = 10 }) => {
  const rows = Math.ceil(total / columns);
  return reduce((acc, rowIndex) => {
    return [
      ...acc,
      ...reduce((rowFrames, colIndex) => {
        const frameIndex = rowIndex * columns + colIndex;
        if (frameIndex < total) {
          return [...rowFrames, { x: colIndex * width, y: rowIndex * height, width, height }];
        }
        return [...rowFrames];
      }, [])(times(identity)(columns)),
    ];
  }, [])(times(identity)(rows));
};
