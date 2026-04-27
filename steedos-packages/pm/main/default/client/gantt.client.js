/* eslint-disable */
(function () {
  function waitForThing(host, key, timeout) {
    timeout = timeout || 30000;
    var t0 = Date.now();
    return new Promise(function (resolve, reject) {
      (function check() {
        if (host && host[key]) return resolve(host[key]);
        if (Date.now() - t0 > timeout) return reject(new Error('Timeout waiting for ' + key));
        setTimeout(check, 100);
      })();
    });
  }
  function loadJs(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function loadCss(href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }
  waitForThing(window, 'antd').then(function () {
    loadCss('/gantt/amis-renderer.css');
    loadJs('/gantt/amis-renderer.js');
  });
})();
