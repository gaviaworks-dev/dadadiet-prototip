/* /reklam-ver: canlıda 301 ile /marka-is-birlikleri'ne yönlenir; statik sitede betikle (meta yenilemenin yanında) aynı yönlendirme. */
(function () {
  'use strict';
  var kok = document.documentElement.dataset.kok || './';
  location.replace(kok + 'marka-is-birlikleri/' + location.hash);
})();
