/**
 * Advanced Academic Shield & Telemetry Protection
 * Prevent console inspections, keyboard shortcuts, and code reverse-engineering.
 */
export const initSecurityShield = () => {
  if (!import.meta.env.PROD) {
    console.log('[Security] Development mode active: Security shield bypassed.');
    return () => {};
  }

  // 1. Disable right-click context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
  };
  document.addEventListener('contextmenu', handleContextMenu);

  // 2. Disable DevTools keys
  const handleKeyDown = (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && e.key === 'u')
    ) {
      e.preventDefault();
      return false;
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  // 3. Clear console periodically
  const consoleInterval = setInterval(() => {
    console.clear();
    console.log(
      '%c⚠ AUTHENTIC TELEMETRY PROTECTION ACTIVE ⚠',
      'color: #1e3a8a; font-size: 20px; font-weight: bold; text-shadow: 1px 1px 0px #b2945e;'
    );
    console.log(
      '%cThis application and its telemetry are protected by academic license. Reverse engineering is prohibited.',
      'color: #475569; font-size: 12px;'
    );
  }, 3000);

  // 4. Anti-debugger loop
  const antiDebugInterval = setInterval(() => {
    try {
      (function() {
        (function a() {
          try {
            (function b(i) {
              if (('' + (i / i)).length !== 1 || i % 20 === 0) {
                (function() {}).constructor('debugger')();
              } else {
                debugger;
              }
              b(++i);
            })(0);
          } catch (e) {
            setTimeout(a, 1000);
          }
        })();
      })();
    } catch (err) {}
  }, 1000);

  return () => {
    document.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('keydown', handleKeyDown);
    clearInterval(consoleInterval);
    clearInterval(antiDebugInterval);
  };
};
