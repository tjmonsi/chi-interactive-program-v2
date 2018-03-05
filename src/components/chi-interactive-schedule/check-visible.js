export const checkVisible = elm => {
  const rect = elm.getBoundingClientRect();
  const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  // console.log(rect.bottom, rect.top - viewHeight);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
};
