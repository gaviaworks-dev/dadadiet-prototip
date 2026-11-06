/* Sihirbaz motoru: adım geçişi, doğrulama, ilerleme. Sonuç üreticileri sayfa kimliğine göre (data-sihirbaz). */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const kok = $('sihirbaz'), tur = kok.dataset.sihirbaz;
  const adimlar = [...kok.querySelectorAll('.sihirbaz-adim[data-adim]')];
  const sonucEl = kok.querySelector('[data-sonuc]');
  const akis = $('sihirbazAkis'), yol = [...$('adimYol').children];
  const V = $('sihirbazVeri') ? JSON.parse($('sihirbazVeri').textContent) : {};
  const hata = $('adimHata'), n = adimlar.length;
  const c = {};
  let i = 0, duzenleme = false;

  const kac = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  const ikon = (x) => '<i class="fa-solid ' + x + '" aria-hidden="true"></i>';
  const basaGit = (el) => el.scrollIntoView({ block: 'start', behavior: 'smooth' });

  function goster(k, odak) {
    i = k;
    adimlar.forEach((a, x) => { a.hidden = x !== i; });
    if (sonucEl) sonucEl.hidden = true;
    akis.hidden = false;
    hata.classList.remove('goster');
    yol.forEach((l, x) => { l.classList.toggle('acik', x === i); l.classList.toggle('bitti', x < i); });
    $('sayac').textContent = 'Adım ' + (i + 1) + ' / ' + n;
    $('geri').hidden = i === 0;
    $('ileri').innerHTML = (i === n - 1 || duzenleme ? 'Sonucu gör ' : 'İleri ') + ikon('fa-arrow-right');
    kosullar();
    if (odak) { adimlar[i].querySelector('h2').focus({ preventScroll: true }); basaGit(akis); }
  }
  const secim = (alan) => [...alan.querySelectorAll('[aria-pressed="true"]')].map((b) => b.dataset.deger);
  function kosullar() {
    kok.querySelectorAll('[data-kosul]').forEach((a) => {
      const [k, v] = a.dataset.kosul.split('=');
      const oku = kok.querySelector('[data-alan="' + k + '"]');
      a.hidden = !(oku && secim(oku).includes(v));
      const bas = a.previousElementSibling;
      if (bas && bas.matches('.sihirbaz-alt-baslik')) bas.hidden = a.hidden;
    });
  }
  function adimOku() {
    let tamam = true;
    adimlar[i].querySelectorAll('[data-alan]').forEach((a) => {
      if (a.hidden) { delete c[a.dataset.alan]; return; }
      const s = secim(a);
      if (!s.length && !a.dataset.istege) tamam = false;
      c[a.dataset.alan] = a.hasAttribute('data-coklu-secim') ? s : s[0];
    });
    return tamam;
  }
  function bitir() {
    akis.hidden = true;
    sonucEl.hidden = false;
    URETICI[tur]();
    sonucEl.querySelector('h2').focus({ preventScroll: true });
    basaGit(sonucEl);
  }

  kok.addEventListener('dd:secim', () => { hata.classList.remove('goster'); kosullar(); });
  $('ileri').addEventListener('click', () => {
    if (!adimOku()) { hata.innerHTML = ikon('fa-circle-exclamation') + ' Devam etmek için bir seçim yap.'; hata.classList.add('goster'); return; }
    if (i < n - 1 && !duzenleme) goster(i + 1, true); else { duzenleme = false; bitir(); }
  });
  $('geri').addEventListener('click', () => { if (i > 0) goster(i - 1, true); });
  kok.addEventListener('click', (e) => {
    const git = e.target.closest('[data-adim-git]');
    if (git) { duzenleme = true; goster(adimlar.findIndex((a) => a.dataset.adim === git.dataset.adimGit), true); return; }
    if (!e.target.closest('[data-bastan]')) return;
    kok.querySelectorAll('[aria-pressed="true"]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    Object.keys(c).forEach((k) => delete c[k]);
    goster(0, true);
  });

  /* Kart: ortak.mjs gorselKart ile aynı iskelet */
  function programKart(p, nedenler) {
    return '<a class="sonuc-kart buyuk" href="' + DD.kok + V.detay + '"><div class="sonuc-gorsel"><img src="' + DD.kok + 'assets/img/icerik/' + p.gorsel + '" alt=""><span class="sonuc-rozet">' + kac(p.kategori) + '</span><span class="sonuc-rozet alt">' + ikon('fa-calendar') + ' ' + kac(p.sure) + '</span></div><div class="sonuc-govde"><h3 class="kart-baslik">' + kac(p.ad) + '</h3><p>' + kac(p.aciklama) + '</p><div class="sonuc-etiketler"><span class="rozet olumlu ikonlu">' + ikon('fa-fire') + ' ' + kac(p.enerji) + '</span></div><ul class="sonuc-neden">' + nedenler.map((x) => '<li>' + ikon('fa-check') + kac(x) + '</li>').join('') + '</ul><div class="sonuc-alt"><span class="sonuc-not-kisa">' + p.ogun_sayisi + ' öğün planı</span><span class="sonuc-git">İncele ' + ikon('fa-arrow-right') + '</span></div></div></a>';
  }
  function uyariYaz(metin) {
    const u = $('sonucUyari');
    u.hidden = !metin;
    if (metin) u.querySelector('span').textContent = metin;
  }

  const HEDEF = { dengeli: { a: 'hedef', v: ['dengeli'], m: 'Dengeli beslenme hedefine uygun' }, kilo: { a: 'hedef', v: ['kilo'], m: 'Kilo kontrolü hedefine uygun' }, sporcu: { a: 'hedef', v: ['protein', 'kas'], m: 'Protein ve toparlanma odaklı' }, bitkisel: { a: 'tercih', v: ['bitkisel', 'vejetaryen'], m: 'Bitkisel beslenmeye uygun' } };
  const TERCIH = { vejetaryen: { v: ['vejetaryen', 'bitkisel'], m: 'Vejetaryen menü' }, vegan: { v: ['bitkisel'], m: 'Tamamen bitkisel menü' }, glutensiz: { v: ['glutensiz'], m: 'Glütensiz menü' } };

  const URETICI = {
    program() {
      const kisit = TERCIH[c.tercih];
      const havuz = kisit ? V.programlar.filter((p) => p.tercih.some((t) => kisit.v.includes(t))) : V.programlar;
      const puanli = havuz.map((p) => {
        let puan = 0; const neden = [];
        const h = HEDEF[c.hedef];
        if ((p[h.a] || []).some((t) => h.v.includes(t))) { puan += 4; neden.push(h.m); }
        if (String(p.sure_gun) === c.sure) { puan += 3; neden.push(p.sure + ' süresi seçimine uyuyor'); }
        if (kisit) neden.push(kisit.m);
        if (c.hazirlik === 'hizli' && p.ihtiyac.some((t) => t === 'pratik-ogun' || t === 'ise-goturulebilir')) { puan += 2; neden.push('Hazırlaması pratik'); }
        if (c.hazirlik !== 'hizli' && p.tercih.includes('ev-yemekleri')) { puan += 1; neden.push('Ev yemeklerine dayalı'); }
        if (Math.round(p.ogun_sayisi / p.sure_gun) === +c.ogun) { puan += 1; neden.push('Günde ' + c.ogun + ' öğün düzeni'); }
        return { p, puan, neden };
      }).sort((a, b) => b.puan - a.puan).slice(0, 3);
      $('sonucBaslik').textContent = 'Sana uygun ' + puanli.length + ' program';
      $('sonucKartlar').innerHTML = puanli.map((x) => programKart(x.p, x.neden.slice(0, 3))).join('');
      uyariYaz(c.ozel !== 'yok' ? (c.ozel === 'alerji' ? 'Besin alerjisi işaretledin; programlar alerjene göre süzülmez. ' : 'Sağlık durumu işaretledin. ') + 'Programlar genel örnek menülerdir, başlamadan önce bir diyetisyene ve hekimine danış.' : '');
    },
    sure() {
      const puanli = V.programlar.map((p) => {
        let puan = 0; const neden = [];
        if (c.sure === '28' ? p.sure_gun >= 28 : String(p.sure_gun) === c.sure) { puan += 4; neden.push(p.sure + ' süresi seçimine uyuyor'); }
        if (c.vakit === 'az' && p.ihtiyac.some((t) => t === 'pratik-ogun' || t === 'ise-goturulebilir')) { puan += 2; neden.push('Hazırlaması pratik'); }
        if (c.vakit !== 'az' && p.tercih.includes('ev-yemekleri')) { puan += 1; neden.push('Ev yemeklerine dayalı'); }
        if (c.hazirlik === 'toplu' && p.ihtiyac.includes('ise-goturulebilir')) { puan += 2; neden.push('Toplu hazırlığa uygun'); }
        if ((c.tempo === 'rahat' && (p.zorluk === 'Kolay' || p.zorluk === 'Başlangıç')) || (c.tempo === 'dengeli' && p.zorluk === 'Orta')) { puan += 2; neden.push(p.zorluk + ' seviye'); }
        return { p, puan, neden };
      }).sort((a, b) => b.puan - a.puan).slice(0, 3);
      $('sonucBaslik').textContent = 'Sürene uygun ' + puanli.length + ' program';
      $('sonucKartlar').innerHTML = puanli.map((x) => programKart(x.p, x.neden.slice(0, 3))).join('');
    },
    uygun() {
      const R = V.rotalar[c.amac];
      $('sonucMetin').textContent = R.metin;
      $('sonucCipler').innerHTML = V.etiketler.map((k) => '<span class="cip">' + kac(k[c[k[0]]] || '') + '</span>').filter((x) => !x.includes('></')).join('');
      const b = R.birincil;
      $('sonucBirincil').innerHTML = '<a class="kart ikon-kart" href="' + DD.kok + b.href + '"><span class="ikon-kutu">' + ikon(b.ikon) + '</span><span class="ikon-kart-metin"><span class="kart-baslik">' + kac(b.ad) + '</span><span class="kart-metin">' + kac(b.metin) + '</span></span>' + ikon('fa-arrow-right ikon-kart-ok') + '</a>';
      $('sonucIkinci').innerHTML = R.ikinci.map((x) => '<a class="kart ikon-kart" href="' + DD.kok + x.href + '"><span class="ikon-kutu">' + ikon(x.ikon) + '</span><span class="ikon-kart-metin"><span class="kart-baslik">' + kac(x.ad) + '</span><span class="kart-metin">' + kac(x.metin) + '</span></span>' + ikon('fa-arrow-right ikon-kart-ok') + '</a>').join('');
      uyariYaz(c.ozel && c.ozel !== 'yok' ? 'Özel bir durum işaretledin. Burada önerilen içerikler geneldir; plana başlamadan önce bir diyetisyene ve hekimine danış.' : '');
    },
  };
  URETICI.diyetisyen = function () {
    const alan = c.hedef, D = V.diyetisyenler;
    const gorusmeUyar = (d) => c.gorusme === 'online' ? d.online : c.gorusme === 'yuz' ? d.yuz_yuze : true;
    const sehirUyar = (d) => c.gorusme !== 'yuz' || !c.sehir || c.sehir === 'farketmez' || d.sehir === c.sehir;
    const sirala = (l) => l.sort((a, b) => b.deneyim_yil - a.deneyim_yil);
    const eslesen = sirala(D.filter((d) => d.uzmanlik.includes(alan) && gorusmeUyar(d) && sehirUyar(d)));
    const nedenler = (d) => [d.uzmanlik.includes(alan) ? alan + ' alanında çalışıyor' : null, d.online && c.gorusme !== 'yuz' ? 'Online görüşüyor' : d.yuz_yuze ? 'Yüz yüze görüşüyor' : null, d.sehir].filter(Boolean).slice(0, 3);
    const kart = (d) => '<div class="kart uzman-kart"><div class="uzman-bas"><span class="kisi-avatar buyuk" aria-hidden="true">' + kac(d.harf) + '</span><div><h3 class="kart-baslik">' + kac(d.ad) + '</h3><span class="kart-metin">' + kac(d.unvan) + ' · ' + d.deneyim_yil + ' yıl deneyim</span></div></div><div class="sonuc-etiketler">' + d.uzmanlik.slice(0, 3).map((u) => '<span class="rozet olumlu">' + kac(u) + '</span>').join('') + (d.uzmanlik.length > 3 ? '<span class="rozet pasif">+' + (d.uzmanlik.length - 3) + '</span>' : '') + '</div><ul class="isaretli-liste">' + nedenler(d).map((x) => '<li>' + ikon('fa-check') + '<span>' + kac(x) + '</span></li>').join('') + '</ul><div class="uzman-eylem"><a class="dugme hayalet" href="' + DD.kok + V.detay + '">Profili gör</a><a class="dugme birincil" href="' + DD.kok + V.detay + '#randevu">Randevu al</a></div></div>';
    $('sonucCipler').innerHTML = V.cipler.map(([adim, alanAd, map]) => c[alanAd] && map[c[alanAd]] ? '<button class="cip" type="button" data-adim-git="' + adim + '">' + kac(map[c[alanAd]]) + ' ' + ikon('fa-pen') + '</button>' : '').join('');
    $('sonucBaslik').textContent = eslesen.length ? eslesen.length + ' uzman eşleşti' : 'Bu seçimde uzman bulamadık';
    $('sonucGiris').textContent = eslesen.length ? 'Seçimlerine göre uygun olabilecek uzmanlar. Cevabını değiştirmek için üstteki çipe dokun.' : 'Cevabını değiştirmek için üstteki çipe dokun ya da yakın seçeneklere bak.';
    $('sonucKartlar').innerHTML = eslesen.map(kart).join('');
    $('sonucKartlar').hidden = !eslesen.length;
    $('sonucBos').hidden = !!eslesen.length;
    /* Boş sonuç: önce aynı uzmanlık başka görüşme kipinde, yoksa en yakın alan */
    const ayniAlan = D.filter((d) => d.uzmanlik.includes(alan));
    const yakin = eslesen.length ? [] : sirala(ayniAlan.length ? ayniAlan : D.filter((d) => gorusmeUyar(d) && d.uzmanlik.includes('Kilo Yönetimi'))).slice(0, 3);
    $('sonucBosBaslik').textContent = ayniAlan.length ? 'Bu görüşme tercihinde uzman yok' : 'Bu alanda şu an kayıtlı uzman yok';
    $('sonucBosMetin').textContent = ayniAlan.length ? alan + ' alanında çalışan uzmanlar başka bir görüşme kipinde hizmet veriyor. Aşağıdaki seçeneklere bak.' : 'Yeni uzmanlar eklendikçe burada görünür. Tüm uzmanları incele ya da aşağıdaki yakın seçeneklere bak.';
    $('sonucYakinBaslik').hidden = !yakin.length;
    $('sonucYakin').hidden = !yakin.length;
    $('sonucYakin').innerHTML = yakin.map(kart).join('');
  };

  goster(0, false);
})();
