'use strict';

var isInPWA = function isInPWA() {
  return !!(window.matchMedia("(display-mode: standalone)").matches || window.matchMedia("(display-mode: fullscreen)").matches || window.matchMedia("(display-mode: minimal-ui)").matches);
};

exports.isInPWA = isInPWA;
//# sourceMappingURL=index.js.map
