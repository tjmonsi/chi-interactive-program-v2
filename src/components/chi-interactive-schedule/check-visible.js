export const checkVisible = elm => {
  const rect = elm.getBoundingClientRect();
  const num = document.documentElement ? document.documentElement.clientHeight : 0;
  const viewHeight = Math.max(num, window.innerHeight);
  // console.log(rect.bottom, rect.top - viewHeight);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
};
