// Utility to safely handle benign media playback cancellations, camera detachments, and library onabort throws
export function setupMediaSafety() {
  if (typeof window === 'undefined') return;

  // 1. Intercept HTMLMediaElement.prototype.play to prevent unhandled rejections when video is unmounted
  if (typeof HTMLMediaElement !== 'undefined' && HTMLMediaElement.prototype.play) {
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
      try {
        const promise = originalPlay.apply(this, args);
        if (promise && typeof promise.catch === 'function') {
          return promise.catch((err: unknown) => {
            const errorName = (err as { name?: string })?.name;
            const errorMsg = (err as { message?: string })?.message || '';
            if (
              errorName === 'AbortError' ||
              errorMsg.includes('interrupted') ||
              errorMsg.includes('removed from the document') ||
              errorMsg.includes('play()')
            ) {
              // Benign browser error when media element is removed or paused during transition
              return;
            }
            throw err;
          });
        }
        return promise;
      } catch (err: unknown) {
        const errorName = (err as { name?: string })?.name;
        const errorMsg = (err as { message?: string })?.message || '';
        if (
          errorName === 'AbortError' ||
          errorMsg.includes('interrupted') ||
          errorMsg.includes('removed from the document')
        ) {
          return Promise.resolve();
        }
        throw err;
      }
    };
  }

  // 2. Wrap HTMLMediaElement.prototype.onabort setter to intercept html5-qrcode's throwing callback
  try {
    const mediaProto = HTMLMediaElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(mediaProto, 'onabort') ||
                 Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'onabort') ||
                 Object.getOwnPropertyDescriptor(Element.prototype, 'onabort');

    if (desc && desc.set) {
      const originalSet = desc.set;
      Object.defineProperty(mediaProto, 'onabort', {
        get: desc.get,
        set: function (handler) {
          if (typeof handler === 'function') {
            const safeHandler = function (this: unknown, ev: UIEvent) {
              try {
                return handler.call(this, ev);
              } catch (err: unknown) {
                const errStr = typeof err === 'string' ? err : (err as { message?: string })?.message || '';
                if (errStr.includes('RenderedCameraImpl') || errStr.includes('video surface onabort()')) {
                  // Safely swallow benign onabort throw from camera surface release
                  return;
                }
                throw err;
              }
            };
            originalSet.call(this, safeHandler);
          } else {
            originalSet.call(this, handler);
          }
        },
        configurable: true,
        enumerable: true,
      });
    }
  } catch {
    // ignore if browser disallows prototype modification
  }

  // 3. Global window error event safeguard (capture phase)
  window.addEventListener(
    'error',
    (event: ErrorEvent) => {
      const msg = typeof event.message === 'string' ? event.message : '';
      const errorVal = event.error;
      const errorStr = typeof errorVal === 'string' ? errorVal : errorVal?.message || '';

      if (
        msg.includes('RenderedCameraImpl') ||
        errorStr.includes('RenderedCameraImpl') ||
        msg.includes('video surface onabort() called') ||
        errorStr.includes('video surface onabort() called') ||
        msg.includes('The play() request was interrupted') ||
        errorStr.includes('The play() request was interrupted')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return true;
      }
    },
    true
  );

  // 4. Global window.onerror fallback
  const prevOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msgStr = typeof message === 'string' ? message : '';
    const errStr = error ? (typeof error === 'string' ? error : error.message || '') : '';

    if (
      msgStr.includes('RenderedCameraImpl') ||
      errStr.includes('RenderedCameraImpl') ||
      msgStr.includes('video surface onabort() called') ||
      errStr.includes('video surface onabort() called') ||
      msgStr.includes('play()') ||
      errStr.includes('play()')
    ) {
      return true; // Marks error as handled to prevent uncaught exception
    }

    if (prevOnError) {
      return prevOnError.call(window, message, source, lineno, colno, error);
    }
    return false;
  };

  // 5. Global window unhandledrejection safeguard for media detachment
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const errorName = (reason as { name?: string })?.name;
    const errorMsg = typeof reason === 'string' ? reason : (reason as { message?: string })?.message || '';

    if (
      errorName === 'AbortError' ||
      errorMsg.includes('The play() request was interrupted') ||
      errorMsg.includes('removed from the document') ||
      errorMsg.includes('RenderedCameraImpl') ||
      errorMsg.includes('video surface onabort() called')
    ) {
      event.preventDefault(); // Suppress false-positive browser console error
    }
  });
}
