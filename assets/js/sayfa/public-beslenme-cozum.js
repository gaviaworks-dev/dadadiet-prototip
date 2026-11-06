/* Çözüm Merkezi: arama metni akordeon kalemlerinin kendi metninden kurulur. Liste betiğinden önce çalışması gerekmez, arama anında okunur. */
(function () {
  'use strict';
  document.querySelectorAll('.akordeon-kalem[data-kart]').forEach((k) => { k.dataset.ara = k.textContent.toLocaleLowerCase('tr'); });
})();
