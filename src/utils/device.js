export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}

export function getDimensions() {
  const bodyDimensions = document.body.getBoundingClientRect();
  const screenWidth = bodyDimensions.width;
  const screenHeight = bodyDimensions.height;
  // const screenWidth = screen.availWidth;
  // const screenHeight = screen.availHeight;
  const isLandscape = screenWidth > screenHeight;

  if (getIsMobile()) {
    return {
      width: isLandscape ? screenWidth : screenHeight,
      height: isLandscape ? screenHeight : screenWidth,
    };
  }

  return {
    width: isLandscape ? window.innerWidth : window.innerHeight,
    height: isLandscape ? window.innerHeight : window.innerWidth,
  };
}

export function getIsMobile() {
  const screenWidth = screen.availWidth;
  const screenHeight = screen.availHeight;

  return isTouchDevice() && (screenWidth < 700 || screenHeight < 700);
}
