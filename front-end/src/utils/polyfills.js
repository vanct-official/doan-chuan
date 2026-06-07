/**
 * Polyfill for legacy browsers (especially older iOS Safari / iPad)
 * target: MediaQueryList.prototype.addEventListener and removeEventListener
 *
 * In older WebKit/Safari engines, window.matchMedia returns a MediaQueryList object
 * that only has .addListener() and .removeListener() but lacks .addEventListener() and .removeEventListener().
 * This script ensures safe fallback mappings to prevent crashes (e.g. t.addEventListener is not a function).
 */

(function () {
  if (typeof window === 'undefined') return;

  // 1. matchMedia and MediaQueryList compatibility polyfill
  try {
    if (window.matchMedia) {
      // Get prototype of MediaQueryList
      const mql = window.matchMedia('all');
      const mqlProto = Object.getPrototypeOf(mql);

      if (mqlProto) {
        // Fallback for addEventListener
        if (!mqlProto.addEventListener) {
          mqlProto.addEventListener = function (type, listener) {
            if (type === 'change') {
              this.addListener(listener);
            } else {
              // Custom or standard addEventListener fallback
              if (this.addListener) this.addListener(listener);
            }
          };
        }

        // Fallback for removeEventListener
        if (!mqlProto.removeEventListener) {
          mqlProto.removeEventListener = function (type, listener) {
            if (type === 'change') {
              this.removeListener(listener);
            } else {
              // Custom or standard removeEventListener fallback
              if (this.removeListener) this.removeListener(listener);
            }
          };
        }
      } else {
        // Direct instance fallback if prototype prototype is unreachable
        const originalMatchMedia = window.matchMedia;
        window.matchMedia = function (query) {
          const instance = originalMatchMedia(query);
          if (instance) {
            if (!instance.addEventListener) {
              instance.addEventListener = function (type, listener) {
                if (type === 'change') {
                  this.addListener(listener);
                } else {
                  if (this.addListener) this.addListener(listener);
                }
              };
            }
            if (!instance.removeEventListener) {
              instance.removeEventListener = function (type, listener) {
                if (type === 'change') {
                  this.removeListener(listener);
                } else {
                  if (this.removeListener) this.removeListener(listener);
                }
              };
            }
          }
          return instance;
        };
      }
    }
  } catch (error) {
    console.warn('[Polyfill] Failed to apply matchMedia addEventListener polyfill:', error);
  }
})();
