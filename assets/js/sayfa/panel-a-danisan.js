/* Danışan kartı: yedi sekme. Veri izni kapalı türler kilit görünümüne düşer. */
(function () {
  'use strict';
  const DD = window.DD, PA = window.PA, h = PA.h;
  const $ = (id) => document.getElementById(id);
  const id = $('danisanBas').dataset.danisan;
  const dn = PA.danisan(id);
  const IZIN = {
    olcum: ['Ölçümler', 'fa-weight-scale', 'Kilo, bel ve yağ oranı geçmişi', 'olcum'],
    tahlil: ['Kan tahlilleri', 'fa-vial', 'Yüklediği tahlil dosyaları ve değerleri', 'tahlil'],
    anamnez: ['Anamnez', 'fa-notes-medical', 'Sağlık öyküsü, ilaçlar ve alışkanlıklar', 'not'],
    gunluk: ['Günlük takip', 'fa-list-check', 'Öğün, su ve adım kayıtları', null],
    belge: ['Belgeler', 'fa-file-medical', 'Paylaştığı diğer sağlık belgeleri', null],
  };
  const v = { metrik: 'kilo', tahlil: null, olcumDuzelt: null, randevu: 'yaklasan' };
  const talepler = () => dn.izin_talepleri || (dn.izin_talepleri = {});
  const ilk = PA.ilkAd(dn.ad), ilgi = PA.ilgi(ilk);
  /* Tahlil referansı danışanın cinsiyetine göre (varsayılan tablodaki hemoglobin eşiği); Sağlık Dosyam ile aynı bileşen */
  const T = DD.tahlilDeger.kisi({ cinsiyet: dn.cinsiyet });
  const sonTahlil = () => [...(dn.tahliller || [])].sort((a, b) => b.tarih.localeCompare(a.tarih))[0];
  const kilit = (tur) => `<div class="kart panel"><div class="kart-govde">${PA.kilitGorunum(IZIN[tur][0], tur, talepler()[tur], ilk)}</div></div>`;
  const bos = (ikon, baslik, metin, eylem) => `<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid ${ikon}" aria-hidden="true"></i></span><h3>${baslik}</h3><p>${metin}</p>${eylem || ''}</div>`;
  const kartBas = (ikon, baslik, sag, alt) => `<div class="kart-bas"><div><h2 class="kart-baslik"><i class="fa-solid ${ikon}" aria-hidden="true"></i> ${baslik}</h2>${alt ? `<p>${alt}</p>` : ''}</div>${sag || ''}</div>`;
  const kunye = (l) => `<dl class="kunye belge">${l.filter((x) => x[1] != null && x[1] !== '').map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>`;

  /* ── Başlık ve kişi kartı: kimlik, dört ana gösterge, sıradaki adım ── */
  const olcu = (ikon, etiket, deger, alt, ek) => `<div class="kisi-olcu"><span class="kisi-olcu-etiket"><i class="fa-solid ${ikon}" aria-hidden="true"></i>${etiket}</span><b>${deger}</b><small>${alt}</small>${ek || ''}</div>`;
  function adimHtml() {
    const a = PA.siradaki(dn), ana = 'dugme birincil kucuk';
    const eylem = a.sekme ? `<button class="${ana}" type="button" data-sekme-git="${a.sekme}">${h(a.etiket)}</button>` : a.is === 'not-ekle' ? `<button class="${ana}" type="button" data-is="not-ekle">${h(a.etiket)}</button>` : PA.adimEylem(a, dn, ana);
    return `<div class="kisi-adim"><span class="as-ikon"><i class="fa-solid ${a.ikon}" aria-hidden="true"></i></span><div class="kisi-adim-metin"><span>Sıradaki Adım</span><b>${h(a.baslik)}</b><p>${h(a.metin)}</p></div><div class="eylem-satiri">${a.ikincil ? `<button class="dugme hayalet kucuk" type="button" data-adim="${a.ikincilIs}" data-danisan="${id}">${a.ikincil}</button>` : ''}${dn.durum === 'yanit-bekliyor' ? `<button class="dugme hayalet kucuk" type="button" data-adim="yanitlandi" data-danisan="${id}">Yanıtlandı işaretle</button>` : ''}${eylem}</div></div>`;
  }
  function kunyeCiz() {
    const p = PA.paket(dn.paket_id), i = PA.ilerleme(dn), g = PA.gelecekRandevu(id), kalan = p ? PA.kalanSeans(dn) : null;
    const izinYok = !dn.izinler.olcum, son = i ? dn.olcumler[dn.olcumler.length - 1] : null;
    const kilo = i ? olcu('fa-weight-scale', 'Güncel Kilo', PA.sayi(i.son) + ' kg', PA.kgMetin(i.degisim) + ' · ' + i.hafta + '. hafta · ' + PA.tarih(son.tarih)) : olcu(izinYok ? 'fa-lock' : 'fa-weight-scale', 'Güncel Kilo', '—', izinYok ? 'Ölçüm izni yok' : 'Ölçüm kaydı yok');
    const hedef = olcu('fa-bullseye', 'Hedef', dn.hedef_kilo != null ? PA.sayi(dn.hedef_kilo) + ' kg' : '—', i ? '%' + i.yuzde + ' ilerleme · ' + h(PA.takip(dn)) : h(PA.takip(dn)), i ? PA.olcer(i.yuzde) : '');
    const randevu = g ? `<button class="kisi-olcu tiklanir" type="button" data-randevu="${g.id}"><span class="kisi-olcu-etiket"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i>Sonraki Randevu</span><b>${h(PA.ayGun(g.tarih))} · ${DD.bicim.saat(g.saat)}</b><small>${PA.rTur(g)} · ${g.sure} dk</small></button>` : olcu('fa-calendar-xmark', 'Sonraki Randevu', '—', 'Planlı randevu yok');
    const paket = olcu('fa-box-open', 'Paket', p ? kalan + ' / ' + p.seans + ' seans' : '—', p ? h(p.ad) : 'Paket atanmadı');
    const yikici = dn.durum === 'bitti' ? '<button class="dugme hayalet kucuk" type="button" data-is="baslat">Takibi yeniden başlat</button>' : PA.takipte(dn) ? '<button class="dugme hayalet kucuk tehlike" type="button" data-is="bitir">Takibi bitir</button>' : '';
    $('kunyeKart').innerHTML = `<div class="kart panel kisi-serit"><div class="kisi-serit-bas">${PA.avatar(dn.ad)}<div class="kisi-serit-kimlik"><div class="kisi-serit-ad"><h2>${h(dn.ad)}</h2>${PA.danisanHap(dn)}</div><p>${[dn.yas ? dn.yas + ' yaş' : '', h(dn.cinsiyet || ''), dn.boy ? dn.boy + ' cm' : '', h(PA.eposta(dn))].filter(Boolean).join(' · ')}</p></div><div class="eylem-satiri"><button class="dugme hayalet kucuk" type="button" data-is="not-ekle"><i class="fa-solid fa-note-sticky" aria-hidden="true"></i> Klinik not</button><button class="dugme hayalet kucuk" type="button" data-is="hedef"><i class="fa-solid fa-bullseye" aria-hidden="true"></i> Hedefi güncelle</button>${yikici}</div></div><div class="kisi-olcu-izgara">${kilo}${hedef}${randevu}${paket}</div>${adimHtml()}</div>`;
    PA.oranlar($('kunyeKart'));
  }
  function basCiz() {
    $('danisanAd').textContent = dn.ad;
    document.title = dn.ad + ' · Dada Diet';
    $('danisanAlt').textContent = dn.hedef;
    document.querySelector('#danisanBas [data-randevu-ac]').hidden = !PA.takipte(dn);
    Object.keys(IZIN).forEach((t) => {
      const sekme = IZIN[t][3];
      if (!sekme) return;
      $('t-' + sekme).querySelector('[data-sekme-ek]').innerHTML = dn.izinler[t] || (t === 'anamnez' && (PA.anamnezGorunur(dn) || dn.talep_bilgi)) ? '' : '<i class="fa-solid fa-lock kilit-ikon" aria-label="İzin yok"></i>';
    });
    kunyeCiz();
  }

  /* ── Özet ───────────────────────────────────────────────────────── */
  /* Randevular üç küme: yaklaşan, geçmiş, gerçekleşmeyen */
  const R_KUME = { yaklasan: ['dolu', 'onay-bekliyor'], gecmis: ['tamamlandi', 'sonuc-bekliyor'], olmadi: ['gelmedi', 'iptal'] };
  const R_BOS = { yaklasan: 'yaklaşan randevusu yok', gecmis: 'geçmiş görüşmesi yok', olmadi: 'gerçekleşmeyen randevusu yok' };
  function randevuKart(rs) {
    const l = rs.filter((r) => R_KUME[v.randevu].includes(PA.rDurum(r)));
    if (v.randevu === 'yaklasan') l.reverse();
    const satirlar = l.map((r) => `<button class="ayar-satir" type="button" data-randevu="${r.id}"><span class="as-saat${v.randevu === 'yaklasan' ? '' : ' gecti'}">${PA.tarih(r.tarih)}<small>${DD.bicim.saat(r.saat)}</small></span><span class="as-metin"><b>${PA.rTur(r)} · ${r.sure} dk</b><span>${h(r.ozet || r.not || PA.gunAdi(r.tarih))}</span></span><span class="as-eylem">${PA.talepRozet(r) || PA.rHap(r)}</span></button>`).join('');
    const sekme = [['yaklasan', 'Yaklaşan'], ['gecmis', 'Geçmiş'], ['olmadi', 'Gerçekleşmedi']].map(([k, a]) => `<button type="button" data-deger="${k}" aria-pressed="${k === v.randevu}">${a} ${rs.filter((r) => R_KUME[k].includes(PA.rDurum(r))).length}</button>`).join('');
    const eylem = !PA.takipte(dn) ? '' : `<button class="dugme hayalet kucuk" type="button" data-randevu-ac data-danisan="${id}"><i class="fa-solid fa-plus" aria-hidden="true"></i> Randevu oluştur</button>`;
    return `<div class="kart panel">${kartBas('fa-calendar-check', 'Randevular', eylem)}<div class="kart-govde"><div class="segment" id="randevuKume" role="group" aria-label="Randevu kümesi">${sekme}</div>${l.length ? `<div class="ayar-liste kart-ic-liste">${satirlar}</div>` : `<p class="bos-satir">${h(ilgi)} ${R_BOS[v.randevu]}.</p>`}</div></div>`;
  }
  /* Yan sütun: paket, ödemeler, sağlık özeti. Kısa satırlar, boş kartta tek cümle */
  function paketKart() {
    const p = PA.paket(dn.paket_id);
    if (!p) return `<div class="kart panel">${kartBas('fa-box-open', 'Paket')}<div class="kart-govde"><p class="bos-satir">${h(ilgi)} paketi yok. Atandığında seans hakkı burada görünür.</p></div></div>`;
    const kalan = PA.kalanSeans(dn), kullanilan = p.seans - kalan, yuzde = Math.round((kullanilan / p.seans) * 100);
    return `<div class="kart panel">${kartBas('fa-box-open', 'Paket')}<div class="kart-govde"><div class="deger-liste"><div class="kisa-baslik"><b>${h(p.ad)}</b><small>${h(p.aciklama)}</small></div><div class="kisa-olcer"><div class="deger-satir"><span>Kullanılan ya da planlanan</span><b>${kullanilan} / ${p.seans} seans</b></div>${PA.olcer(yuzde)}</div><div class="deger-satir"><span>Kalan</span><b>${kalan} seans</b></div><div class="deger-satir"><span>Paket tutarı</span><b>${PA.para(p.fiyat)}</b></div></div></div></div>`;
  }
  function odemeKart() {
    const l = (PA.d().kazanclar ? PA.d().kazanclar.son_islemler : []).filter((x) => x.danisan_id === id).slice(0, 3);
    const bekleyen = l.filter((x) => x.durum === 'beklemede').reduce((t, x) => t + x.tutar, 0);
    const git = `<a class="dugme hayalet kucuk" href="${DD.kok}diyetisyen-paneli/kazanclar/">Kazançlarım</a>`;
    return `<div class="kart panel">${kartBas('fa-wallet', 'Ödemeler', l.length ? git : '', l.length ? (bekleyen ? PA.para(bekleyen) + ' beklemede' : 'Bekleyen ödeme yok') : '')}<div class="kart-govde">${l.length ? `<div class="mini-liste">${l.map((x) => `<div class="mini-satir"><span><b>${PA.para(x.tutar)}</b><small>${h(x.aciklama)} · ${PA.tarih(x.tarih)}</small></span>${x.durum === 'odendi' ? PA.hap('Ödendi', 'cozulen') : PA.hap('Beklemede', 'bekleyen')}</div>`).join('')}</div>` : `<p class="bos-satir">${h(ilgi)} son ödeme kaydı yok. Tamamlanan seanslar burada listelenir.</p>`}</div></div>`;
  }
  const buyukHarf = (m) => String(m).replace(/^./, (c) => c.toLocaleUpperCase('tr'));
  function saglikKart() {
    const acik = PA.anamnezGorunur(dn), rozet = (l, sinif) => l.map((x) => `<span class="rozet ${sinif}">${h(buyukHarf(x))}</span>`).join('');
    const satir = (etiket, deger) => `<div class="kisa-kalem"><span>${etiket}</span><div>${deger}</div></div>`;
    const tahlil = sonTahlil();
    const disi = tahlil ? (tahlil.degerler || []).filter(T.disi).length : 0;
    const ilaclar = dn.anamnez && (dn.anamnez.ilaclar || []).length ? h(dn.anamnez.ilaclar.join(', ')) : 'Kayıt yok';
    const tahlilMetin = !dn.izinler.tahlil ? 'İzin yok' : tahlil ? `${PA.tarih(tahlil.tarih)} · ${disi ? disi + ' değer referans dışı' : 'Değerler referans içinde'}` : 'Kayıt yok';
    return `<div class="kart panel">${kartBas('fa-heart-pulse', 'Sağlık Özeti', acik ? '<button class="dugme hayalet kucuk" type="button" data-sekme-git="not">Anamnez</button>' : '')}<div class="kart-govde"><div class="deger-liste">${acik ? satir('Hassasiyet', dn.hassasiyetler.length ? `<span class="rozet-sira">${rozet(dn.hassasiyetler, 'bekleme')}</span>` : 'Kayıt yok') + satir('Kronik Durum', dn.kronik.length ? `<span class="rozet-sira">${rozet(dn.kronik, 'pasif')}</span>` : 'Kayıt yok') + satir('İlaç ve Takviye', ilaclar) : satir('Anamnez', 'İzin yok')}${satir('Protokol', PA.protokoller(dn).length ? `<span class="rozet-sira">${PA.protokoller(dn).map((p) => `<span class="rozet olumlu">${h(p.ad)}</span>`).join('')}</span>` : 'Tanımlı değil')}${satir('Son Tahlil', tahlilMetin)}</div></div></div>`;
  }
  /* Özet: son tahlilin referans dışı değerleri doğrudan görünür. Tahlil izni yoksa kart çıkmaz (Sağlık Özeti "İzin yok" der) */
  function tahlilOzetKart() {
    const t = sonTahlil();
    if (!dn.izinler.tahlil || !t) return '';
    const disi = (t.degerler || []).filter(T.disi);
    if (!disi.length) return '';
    return `<div class="kart panel">${kartBas('fa-vial', 'Takip Edilecek Değerler', '<button class="dugme hayalet kucuk" type="button" data-sekme-git="tahlil">Tahliller</button>', PA.tarih(t.tarih) + ' tahlili · ' + disi.length + ' değer referans dışında')}<div class="kart-govde bosluksuz tam-kenar">${T.liste(disi)}</div></div>`;
  }
  /* İlk görüşme ilerlemesi: dört adım tamamlanınca kalkar */
  function ilkSeri() {
    if (!dn.talep_bilgi) return '';
    const adimlar = [['Anamnez', !PA.anamnezEksik(dn).length], ['Ölçüm', dn.olcumler.length > 0], ['Hedef', !!dn.hedef_turu], ['Plan', PA.d().planlar.some((p) => p.danisan_id === id && p.durum === 'gonderildi')]];
    if (adimlar.every((a) => a[1])) return '';
    const aktif = adimlar.findIndex((a) => !a[1]);
    return `<ol class="adim-serit" aria-label="İlk görüşme adımları">${adimlar.map(([a, bitti], i) => `<li class="${bitti ? 'acik bitti' : i === aktif ? 'acik' : ''}"><span>${bitti ? '<i class="fa-solid fa-check" aria-hidden="true"></i>' : i + 1}</span>${a}</li>`).join('')}</ol>`;
  }
  /* Son 7 gün his çizgisi. Üyenin günlük kaydı olduğu için günlük takip iznine bağlı */
  const HIS = { iyi: ['İyi', 'olumlu'], normal: ['Normal', 'notr'], yorgun: ['Yorgun', 'uyari'], bitkin: ['Bitkin', 'uyari'], halsiz: ['Halsiz', 'uyari'], 'bas-donmesi': ['Baş dönmesi', 'belirgin'], carpinti: ['Çarpıntı', 'belirgin'] };
  const HIS_IKON = { olumlu: 'fa-face-smile', notr: 'fa-face-meh', uyari: 'fa-triangle-exclamation', belirgin: 'fa-circle-exclamation' };
  function hisKart() {
    const bas = (alt) => kartBas('fa-face-smile', 'His Çizgisi', '', alt);
    if (!dn.izinler.gunluk) return `<div class="kart panel">${bas('Günlük takip izni yok')}</div>`;
    const gunler = Array.from({ length: 7 }, (_, n) => PA.ekle(DD.bugun, n - 6));
    const kayit = (g) => (dn.his_kayitlari || []).filter((x) => x.tarih === g).pop();
    const dolu = gunler.filter(kayit).length;
    if (!dolu) return `<div class="kart panel">${bas(`${h(ilgi)} son 7 günde his kaydı yok`)}</div>`;
    const gun = (g) => {
      const k = kayit(g), [ad, ton] = k ? HIS[k.his] || [k.his, 'notr'] : [];
      const deger = k ? `<i class="fa-solid ${HIS_IKON[ton]}" aria-hidden="true"></i>${h(ad)}` : '<span aria-hidden="true">—</span><span class="yalniz-okuyucu">Kayıt yok</span>';
      return `<li class="${k ? ton : 'bos'}"${g === DD.bugun ? ' aria-current="date"' : ''}><span class="gs-gun">${PA.gunKisa(g)}<span class="yalniz-okuyucu">, ${PA.tarih(g)}</span></span><span class="gs-deger">${deger}</span></li>`;
    };
    const say = (ton) => gunler.filter((g) => { const k = kayit(g); return k && (HIS[k.his] || [])[1] === ton; }).length;
    const net = say('belirgin'), sakin = say('uyari');
    const uyari = net ? `<div class="uyari-kutu hata" role="alert"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span><b>${net} gün baş dönmesi ya da çarpıntı.</b> Danışan ekranında "Diyete devam etme, bir hekime başvur." uyarısı gösterildi.</span></div>`
      : sakin ? `<div class="uyari-kutu"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span><b>${sakin} gün yorgun, bitkin ya da halsiz.</b> Danışan ekranında "Diyete ara ver; diyetisyenine ya da hekimine danış." uyarısı gösterildi.</span></div>` : '';
    return `<div class="kart panel">${bas(`Son 7 gün, ${dolu} kayıt`)}<div class="kart-govde"><div class="yigin sik"><div class="gun-seri-kap"><ol class="gun-seri" aria-label="Son 7 günün his kayıtları">${gunler.map(gun).join('')}</ol></div>${uyari}</div></div></div>`;
  }
  /* F7 plan uyumu: üyenin Uydum / Atladım işaretleri, tek kaynak assets/js/uyum.js (üye Beslenme Planım ile aynı veri ve kural).
     Öğün işaretleri günlük takip kaydıdır: izin kapalıysa sayı gösterilmez */
  const UY_DURUM = { uydu: ['Uydu', 'cozulen', 'fa-check'], atladi: ['Atladı', 'hata', 'fa-xmark'], '': ['Bekliyor', 'kapali', 'fa-clock'] };
  function uyumHtml(plan) {
    if (!window.UYUM) return '';
    if (!dn.izinler.gunluk) return `<p class="bos-satir uyum-ayrac">Günlük takip izni yok; öğün işaretleri görünmez.</p>`;
    const s = UYUM.ozet(PA.d(), plan, DD.bugun, 7);
    if (DD.bugun < s.bas) return `<p class="bos-satir uyum-ayrac">Plan ${PA.tarih(s.bas)} günü başlıyor; ${h(ilgi)} öğün işaretleri o günden sonra görünür.</p>`;
    const p = s.program, son = s.son, yuzde = (x) => (x == null ? '—' : '%' + x);
    const gunler = Array.from({ length: 7 }, (_, n) => PA.ekle(DD.bugun, n - 6));
    const gunLi = (t) => {
      const g = s.gunler.find((x) => x.tarih === t), bugun = t === DD.bugun;
      const ton = !g ? 'bos' : g.atla ? 'uyari' : g.tamam && (!bugun || g.tamam === g.toplam) ? 'olumlu' : 'bos';
      const adet = UYUM.gunOgunleri(plan, t).length;
      const deger = !g ? '<span aria-hidden="true">—</span><span class="yalniz-okuyucu">Plan dışı</span>' : `<b>${g.tamam}/${adet}</b><span class="yalniz-okuyucu"> öğüne uydu</span>${g.atla ? `<small>${g.atla} atladı</small>` : ''}`;
      return `<li class="${ton}"${bugun ? ' aria-current="date"' : ''}><span class="gs-gun">${PA.gunKisa(t)}<span class="yalniz-okuyucu">, ${PA.tarih(t)}</span></span><span class="gs-deger">${deger}</span></li>`;
    };
    const bugunL = s.bugun.length ? `<div class="mini-liste">${s.bugun.map((o) => { const [e, c, i] = UY_DURUM[o.durum]; return `<div class="mini-satir"><span><b>${h(o.ad)} · ${DD.bicim.saat(o.saat)}</b><small>${o.kalem} kalem</small></span><span class="durum-hapi ikonlu ${c}"><i class="fa-solid ${i}" aria-hidden="true"></i> ${e}</span></div>`; }).join('')}</div>` : `<p class="bos-satir">${DD.bugun > s.bit ? 'Plan bitti, bugün için öğün yok.' : 'Bugün planda öğün yok.'}</p>`;
    return `<div class="uyum-ozet uyum-ayrac">
      <div class="uyum-bas"><span>Programa uyum <small>${DD.bugun > s.bit ? PA.tarih(s.bas) + ' – ' + PA.tarih(s.bit) + ', plan bitti' : 'başlangıç ' + PA.tarih(s.bas) + ', bugün dahil'}</small></span><b>${yuzde(p.oran)} <small>${p.tamam}/${p.toplam} öğün</small></b></div>
      ${PA.olcer(p.oran || 0)}
      <div class="uyum-sayilar"><div class="kisa-kalem"><span>Son 7 gün uyumu</span><div>${yuzde(son.oran)}</div></div><div class="kisa-kalem"><span>Uydu</span><div>${son.tamam} öğün</div></div><div class="kisa-kalem"><span>Atladı</span><div>${son.atla} öğün</div></div><div class="kisa-kalem"><span>İşaretsiz</span><div>${son.bos} öğün</div></div></div>
      <div class="gun-seri-kap"><ol class="gun-seri" aria-label="Son 7 günün öğün uyumu">${gunler.map(gunLi).join('')}</ol></div>
      <h3 class="form-bolum-bas"><i class="fa-solid fa-calendar-day" aria-hidden="true"></i> Bugünün Öğünleri</h3>
      ${bugunL}
      <p class="alan-yardim"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>${h(ilgi)} Beslenme Planım ekranındaki Uydum / Atladım işaretleri. Programa uyum bugünün bütün öğünlerini sayar; son 7 gün uyumu bugün yalnız işaretlenen öğünü sayar.</span></p>
    </div>`;
  }
  /* WKA-3-8: Sağlık Dosyası'ndaki son 7 günün dökümü uzmana gelir (öğün, su, adım, his). Günlük takip iznine bağlı.
     Su ve adım yalnız uygulamayı kullanan üyede kayıtlıdır (demo: oturumdaki üye); öteki danışanda "kayıt yok" yazar */
  function dokumKart(plan) {
    const bas = (alt) => kartBas('fa-table-list', 'Son 7 Gün Dökümü', '', alt);
    if (!dn.izinler.gunluk) return `<div class="kart panel">${bas('Günlük takip izni yok')}</div>`;
    const d = PA.d(), uye = d.uye && d.uye.danisan_id === id ? d.uye : null;
    const gunler = Array.from({ length: 7 }, (_, n) => PA.ekle(DD.bugun, n - 6));
    const s = plan && window.UYUM ? UYUM.ozet(d, plan, DD.bugun, 7) : null;
    const su = (g) => { const x = uye && ((uye.su || {}).hafta || []).find((y) => y.tarih === g); return x ? PA.sayi(x.ml / 1000, 1) + ' L' : '—'; };
    const adim = (g) => { const x = uye && ((uye.adim || {}).hafta || []).find((y) => y.tarih === g); return x ? PA.sayi(x.adim, 0) : '—'; };
    const ogun = (g) => { const x = s && s.gunler.find((y) => y.tarih === g); return x ? x.tamam + '/' + UYUM.gunOgunleri(plan, g).length + (x.atla ? ' · ' + x.atla + ' atladı' : '') : '—'; };
    const his = (g) => { const k = (dn.his_kayitlari || []).filter((x) => x.tarih === g).pop(); return k ? h((HIS[k.his] || [k.his])[0]) : '—'; };
    const satir = gunler.map((g) => `<tr${g === DD.bugun ? ' aria-current="date"' : ''}><td><b>${PA.gunKisa(g)}</b><small>${PA.tarih(g)}</small></td><td class="num" data-etiket="Öğün">${ogun(g)}</td><td class="num" data-etiket="Su">${su(g)}</td><td class="num" data-etiket="Adım">${adim(g)}</td><td data-etiket="His">${his(g)}</td></tr>`).join('');
    const hedef = uye ? `Su hedefi ${PA.sayi(((uye.su || {}).hedef_ml || 0) / 1000, 1)} L, adım hedefi ${PA.sayi((uye.adim || {}).hedef || 0, 0)}` : 'Su ve adım kaydı yok; danışan uygulamada kayıt tutmuyor';
    return `<div class="kart panel">${bas(hedef)}<div class="kart-govde bosluksuz"><div class="tablo-kap gomulu"><table class="tablo panel dar-yigin"><caption class="yalniz-okuyucu">Son 7 günün öğün, su, adım ve his dökümü</caption><thead><tr><th scope="col">Gün</th><th class="num" scope="col" data-kolon-tut>Öğün</th><th class="num" scope="col" data-kolon-tut>Su</th><th class="num" scope="col" data-kolon-tut>Adım</th><th scope="col" data-kolon-tut>His</th></tr></thead><tbody>${satir}</tbody></table></div></div></div>`;
  }
  function ozetCiz() {
    const rs = PA.d().randevular.filter((r) => r.danisan_id === id).sort((a, b) => (b.tarih + b.saat).localeCompare(a.tarih + a.saat));
    const plan = PA.d().planlar.filter((x) => x.danisan_id === id && x.durum === 'gonderildi').sort((a, b) => b.tarih.localeCompare(a.tarih))[0];
    const notlar = notSirali().slice(0, 2);
    const planKart = `<div class="kart panel">${kartBas('fa-clipboard-list', plan ? 'Atanmış Plan ve Uyum' : 'Atanmış Plan', plan ? '' : `<a class="dugme hayalet kucuk" href="${PA.yol.yeniPlan(id)}">Yeni plan</a>`)}<div class="kart-govde">${plan ? `<div class="ayar-liste"><a class="ayar-satir" href="${PA.yol.plan(plan.id)}"><span class="as-metin"><b>${h(plan.ad)}</b><span>${DD.bicim.kcal(plan.hedef_kcal)} · ${PA.tarih(plan.tarih)}</span></span><i class="fa-solid fa-chevron-right as-ok" aria-hidden="true"></i></a></div>${uyumHtml(plan)}` : `<p class="bos-satir">${h(ilgi)} atanmış planı yok. Plan gönderdiğinde burada görünür.</p>`}</div></div>`;
    const notKart = `<div class="kart panel">${kartBas('fa-note-sticky', 'Son Notlar', notlar.length ? `<button class="dugme hayalet kucuk" type="button" data-sekme-git="not">Tümü</button>` : '<button class="dugme hayalet kucuk" type="button" data-is="not-ekle">Not ekle</button>')}<div class="kart-govde">${notlar.length ? `<div class="mini-liste">${notlar.map((n) => `<div class="mini-satir"><span><b>${PA.tarih(n.tarih)}</b><small>${h(n.metin)}</small></span></div>`).join('')}</div>` : `<p class="bos-satir">${h(ilgi)} klinik notu yok.</p>`}</div></div>`;
    $('p-ozet').innerHTML = `<div class="iki-sutun-pano"><div class="yigin">${ilkSeri()}${randevuKart(rs)}${hisKart()}${planKart}${dokumKart(plan)}${notKart}</div><aside class="yigin" aria-label="Paket, ödeme ve sağlık özeti">${paketKart()}${odemeKart()}${saglikKart()}${tahlilOzetKart()}</aside></div>`;
    PA.oranlar($('p-ozet'));
    $('randevuKume').addEventListener('dd:secim', (e) => { v.randevu = e.detail.deger; ozetCiz(); });
  }

  /* ── Ölçümler ───────────────────────────────────────────────────── */
  const METRIK = { kilo: ['Kilo', 'kg', 'kilo'], bel: ['Bel', 'cm', 'bel'], yag: ['Yağ oranı', '%', 'yag_orani'] };
  function olcumCiz() {
    if (!dn.izinler.olcum) { $('p-olcum').innerHTML = kilit('olcum'); return; }
    const o = dn.olcumler, ters = [...o].reverse();
    if (!o.length) { $('p-olcum').innerHTML = `<div class="kart panel"><div class="kart-govde">${bos('fa-weight-scale', `${h(ilgi)} ölçümü yok`, 'İlk ölçüm kaydıyla grafik burada başlar.', '<button class="dugme hayalet" type="button" data-is="olcum-ekle">Ölçüm ekle</button>')}</div></div>`; return; }
    const fark = (i) => { const k = ters[i], e = ters[i + 1]; return e && k.kilo != null && e.kilo != null ? Math.round((k.kilo - e.kilo) * 10) / 10 : null; };
    $('p-olcum').innerHTML = `<div class="yigin"><div class="kart panel">${kartBas('fa-chart-line', 'Gelişim', `<div class="eylem-satiri"><div class="segment" id="metrikSec" role="group" aria-label="Ölçüm türü">${Object.keys(METRIK).map((k) => `<button type="button" data-deger="${k}" aria-pressed="${k === v.metrik}">${METRIK[k][0]}</button>`).join('')}</div><button class="dugme hayalet kucuk" type="button" data-is="rapor"><i class="fa-solid fa-file-pdf" aria-hidden="true"></i> PDF rapor indir</button></div>`)}<div class="kart-govde"><div class="grafik-kap" id="olcumGrafik"></div><div class="grafik-lejant" id="olcumLejant"></div></div></div>
<div class="kart panel">${kartBas('fa-table-list', 'Ölçüm Geçmişi', `<button class="dugme hayalet kucuk" type="button" data-is="olcum-ekle"><i class="fa-solid fa-plus" aria-hidden="true"></i> Ölçüm ekle</button>`, o.length + ' kayıt')}<div class="kart-govde bosluksuz"><div class="tablo-kap gomulu"><table class="tablo panel sabit-sutun tek-eylem etiketli-yigin"><caption class="yalniz-okuyucu">Ölçüm geçmişi</caption><thead><tr><th scope="col" data-oran="22">Tarih</th><th class="num" scope="col" data-oran="16">Kilo</th><th class="num" scope="col" data-oran="16">Değişim</th><th class="num" scope="col" data-oran="16">Bel</th><th class="num" scope="col" data-oran="16">Yağ</th><th class="eylem" scope="col">İşlem</th></tr></thead><tbody>${ters.map((m, i) => { const f = fark(i); return `<tr><td data-etiket="Tarih"><b>${PA.tarih(m.tarih)}</b><small>${m.hafta}. hafta${m.not ? ' · ' + h(m.not) : ''}</small></td><td class="num" data-etiket="Kilo">${PA.sayi(m.kilo)} kg</td><td class="num" data-etiket="Değişim">${f == null ? '—' : `<span class="rozet pasif">${PA.kgMetin(f)}</span>`}</td><td class="num" data-etiket="Bel">${m.bel == null ? '—' : PA.sayi(m.bel) + ' cm'}</td><td class="num" data-etiket="Yağ">${m.yag_orani == null ? '—' : '%' + PA.sayi(m.yag_orani)}</td><td class="eylem"><span class="satir-eylem"><button class="ikon-dugme" type="button" data-olcum="${o.indexOf(m)}" aria-label="${PA.tarih(m.tarih)} ölçümünü düzelt"><i class="fa-solid fa-pen" aria-hidden="true"></i></button></span></td></tr>`; }).join('')}</tbody></table></div></div></div></div>`;
    PA.oranTablo($('p-olcum'));
    grafikCiz();
    $('metrikSec').addEventListener('dd:secim', (e) => { v.metrik = e.detail.deger; grafikCiz(); });
  }
  function grafikCiz() {
    const [ad, birim, alan] = METRIK[v.metrik];
    const l = dn.olcumler.filter((m) => m[alan] != null);
    const hedef = v.metrik === 'kilo' ? dn.hedef_kilo : undefined;
    DD.grafik.cizgi($('olcumGrafik'), { baslik: ad + ' gelişimi', etiketler: l.map((m) => m.tarih.slice(8, 10) + '.' + m.tarih.slice(5, 7)), seriler: [{ ad, degerler: l.map((m) => m[alan]) }], hedef, basamak: 1 });
    $('olcumLejant').innerHTML = `<span class="lejant-kalem dolu">${ad} (${birim})</span>${hedef != null ? `<span class="lejant-kalem kapali">Hedef ${PA.sayi(hedef)} kg</span>` : ''}`;
  }
  function olcumAc(i) {
    const m = i == null ? null : dn.olcumler[i];
    v.olcumDuzelt = i;
    $('olcumPanelB').textContent = m ? 'Ölçümü düzelt' : 'Ölçüm Ekle';
    $('oTarih').value = PA.tarih(m ? m.tarih : DD.bugun);
    $('oKilo').value = m ? m.kilo ?? '' : '';
    $('oBel').value = m ? m.bel ?? '' : '';
    $('oKalca').value = m ? m.kalca ?? '' : '';
    $('oYag').value = m ? m.yag_orani ?? '' : '';
    $('oNot').value = m ? m.not || '' : '';
    DD.ac('#olcumPanel');
  }
  const sayiOku = (el) => (el.value === '' ? null : Number(el.value));
  $('olcumPanelForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const tarih = PA.tarihOku($('oTarih').value), alan = $('oTarih').closest('.alan');
    if (!tarih) { window.DM_HATA_YAZ(alan, 'Tarihi GG.AA.YYYY biçiminde yaz.'); $('oTarih').focus(); return; }
    window.DM_HATA_SIL(alan);
    const kilo = sayiOku($('oKilo'));
    if (kilo == null) { window.DM_HATA_YAZ($('oKilo').closest('.alan'), 'Kilo zorunlu.'); $('oKilo').focus(); return; }
    window.DM_HATA_SIL($('oKilo').closest('.alan'));
    const k = { tarih, kilo, bel: sayiOku($('oBel')), kalca: sayiOku($('oKalca')), yag_orani: sayiOku($('oYag')), not: $('oNot').value.trim() };
    if (v.olcumDuzelt != null) Object.assign(dn.olcumler[v.olcumDuzelt], k);
    else dn.olcumler.push(Object.assign({ hafta: dn.olcumler.length ? dn.olcumler[dn.olcumler.length - 1].hafta + 1 : 1 }, k));
    dn.olcumler.sort((a, b) => a.tarih.localeCompare(b.tarih));
    dn.kilo = dn.olcumler[dn.olcumler.length - 1].kilo;
    PA.kaydet(); DD.kapat($('olcumPanel'));
    DD.toast(v.olcumDuzelt != null ? 'Ölçüm düzeltildi.' : 'Ölçüm eklendi.');
    basCiz(); olcumCiz(); ozetCiz();
  });

  /* ── PDF rapor: not ve aralık seçilir, dosya tarayıcıda üretilir ──── */
  function raporAc() {
    const duyarli = PA.yemeDuyarli(dn), son = notSirali().sort((a, b) => b.tarih.localeCompare(a.tarih))[0];
    $('raporBilgi').innerHTML = duyarli
      ? '<i class="fa-solid fa-hand-holding-heart" aria-hidden="true"></i><p>Bu danışanda yeme bozukluğu öyküsü var. <b>Rapora kilo, hedef ve ölçüm girmez</b>; danışan bilgisi ve notun yer alır.</p>'
      : '<i class="fa-solid fa-file-pdf" aria-hidden="true"></i><p>Rapor <b>danışan bilgisi ve hedef, haftalık kilo, bel ve yağ tablosu, ilerleme grafiği</b> ile notunu içerir. Prototip örneği olarak etiketlenir.</p>';
    $('raporDonemAlan').hidden = duyarli;
    $('raporDonem').value = '0';
    $('raporNot').value = duyarli || !son ? '' : son.metin;
    $('raporNotYardim').textContent = duyarli ? 'Kilo ve kalori içermeyen bir not yaz.' : son ? 'Son klinik notun geldi. Danışan bu metni okuyacak, gözden geçir.' : 'Danışanın okuyacağı değerlendirmeni yaz.';
    window.DM_HATA_SIL($('raporNot').closest('.alan'));
    DD.ac('#raporPanel');
  }
  $('raporPanelForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!PA.formGecerli(e.target)) return;
    const d = e.target.closest('.yan-panel').querySelector('[type=submit]');
    d.disabled = true;
    PA.raporIndir(dn, { not: $('raporNot').value.trim(), adet: Number($('raporDonem').value) })
      .then(() => { DD.kapat($('raporPanel')); DD.toast('PDF rapor indirildi.'); }, () => DD.toast('Rapor hazırlanamadı, yeniden dene.', 'hata'))
      .then(() => { d.disabled = false; });
  });

  /* ── Kan tahlilleri ─────────────────────────────────────────────── */
  function tahlilCiz() {
    if (!dn.izinler.tahlil) { $('p-tahlil').innerHTML = kilit('tahlil'); return; }
    const l = [...dn.tahliller].sort((a, b) => b.tarih.localeCompare(a.tarih));
    const dugmeler = `<div class="eylem-satiri">${dn.tahlil_istegi && !dn.tahliller.some((x) => x.tarih >= dn.tahlil_istegi.tarih) ? PA.hap('İstendi · ' + PA.tarih(dn.tahlil_istegi.tarih), 'bekleyen') : '<button class="dugme hayalet kucuk" type="button" data-is="tahlil-iste">Tahlil iste</button>'}<button class="dugme hayalet kucuk" type="button" data-is="tahlil-yukle"><i class="fa-solid fa-upload" aria-hidden="true"></i> Tahlil yükle</button></div><input type="file" id="tahlilDosya" accept=".pdf,image/*" hidden aria-hidden="true" tabindex="-1">`;
    if (!l.length) { $('p-tahlil').innerHTML = `<div class="kart panel">${kartBas('fa-vial', 'Kan tahlilleri', dugmeler)}<div class="kart-govde">${bos('fa-vial', `${h(ilgi)} tahlili yok`, 'Danışan yüklediğinde ya da sen eklediğinde burada görünür.')}</div></div>`; return; }
    const t = l.find((x) => x.dosya_adi === v.tahlil) || l[0];
    v.tahlil = t.dosya_adi;
    const onceki = l[l.indexOf(t) + 1];
    const disi = t.degerler.filter(T.disi).length;
    const incele = PA.tahlilYeni(t) ? `<button class="dugme hayalet kucuk" type="button" data-is="tahlil-incelendi"><i class="fa-solid fa-check" aria-hidden="true"></i> İncelendi</button>` : '';
    $('p-tahlil').innerHTML = `<div class="yigin"><div class="kart panel">${kartBas('fa-table-list', PA.tarih(t.tarih) + ' Sonuçları', `<div class="eylem-satiri">${incele}<button class="dugme hayalet kucuk" type="button" data-is="tahlil-ac"><i class="fa-solid fa-file-pdf" aria-hidden="true"></i> PDF’i aç</button><button class="dugme hayalet kucuk" type="button" data-is="deger-ekle"><i class="fa-solid fa-plus" aria-hidden="true"></i> Değer ekle</button></div>`, (t.degerler.length ? t.degerler.length + ' değer, ' + disi + ' tanesi referans dışında · ' : '') + h(t.dosya_adi) + (t.kaynak ? ' · ' + h(t.kaynak) : ''))}${t.ornek ? `<div class="kart-govde"><div class="belge-not"><span class="rozet bekleme">Prototip örneği</span><p>Değerler PDF’ten okunmadı; prototipte e-Nabız yüklemesine örnek değer seti düşer.</p></div></div>` : ''}<div class="kart-govde bosluksuz${t.degerler.length ? ' tam-kenar' : ''}">${t.degerler.length ? T.liste(t.degerler, { onceki: onceki && onceki.degerler }) : `<div class="kart-govde">${bos('fa-keyboard', 'Değer girilmedi', 'Dosya listede. Değerleri elle ekleyerek tabloya işleyebilirsin.')}</div>`}</div>${t.degerler.length ? `<div class="kart-alt">${T.kaynakNotu(t.degerler)}</div>` : ''}</div>
<div class="kart panel">${kartBas('fa-file-medical', 'Yüklenen Tahliller', dugmeler)}<div class="kart-govde"><div class="ayar-liste">${l.map((x) => `<button class="ayar-satir" type="button" data-tahlil="${h(x.dosya_adi)}"><span class="as-ikon"><i class="fa-solid fa-file-pdf" aria-hidden="true"></i></span><span class="as-metin"><b>${PA.tarih(x.tarih)}</b><span>${h(x.dosya_adi)}</span></span>${x === t ? '<span class="rozet olumlu">Açık</span>' : '<i class="fa-solid fa-chevron-right as-ok" aria-hidden="true"></i>'}</button>`).join('')}</div></div></div>
<div class="kart panel">${kartBas('fa-book-medical', 'Varsayılan Referans Tablosu', '<span class="rozet bekleme">Uzman onayı bekliyor</span>', 'Rapor kendi laboratuvar aralığını vermediğinde ya da güncel kılavuz daha sıkıysa kullanılır. Tablo ' + DD.tahlilDeger.DERLEME + '’de derlendi.')}<div class="kart-govde bosluksuz">${DD.tahlilDeger.tablo()}</div></div></div>`;
    PA.oranTablo($('p-tahlil'));
  }
  $('degerPanelForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!$('vAd').value.trim() || $('vSonuc').value === '') { PA.formGecerli(e.target); return; }
    const t = dn.tahliller.find((x) => x.dosya_adi === v.tahlil);
    t.degerler.push({ ad: $('vAd').value.trim(), sonuc: Number($('vSonuc').value), birim: $('vBirim').value.trim(), ref_alt: sayiOku($('vAlt')), ref_ust: sayiOku($('vUst')) });
    PA.kaydet(); e.target.reset(); DD.kapat($('degerPanel')); DD.toast('Değer eklendi.'); tahlilCiz();
  });

  /* ── Anamnez ve notlar ──────────────────────────────────────────── */
  function notSirali() { return [...dn.klinik_notlar].sort((a, b) => (b.sabit ? 1 : 0) - (a.sabit ? 1 : 0) || b.tarih.localeCompare(a.tarih)); }
  function notCiz() {
    const a = dn.anamnez, eksikAlan = PA.anamnezEksik(dn).length;
    const hs = dn.hassasiyetler.concat(dn.kronik);
    const gelecek = PA.gelecekRandevu(id);
    const hatirlat = dn.anamnez_hatirlatma ? PA.hap('Hatırlatıldı · ' + PA.tarih(dn.anamnez_hatirlatma), 'bekleyen') : '<button class="dugme hayalet" type="button" data-is="anamnez-hatirlat">Hatırlat</button>';
    const anamnez = dn.talep_bilgi && !a ? `<div class="kart panel">${kartBas('fa-notes-medical', 'Anamnez', PA.hap('Bekliyor', 'bekleyen'))}<div class="kart-govde">${bos('fa-notes-medical', `${h(ilgi)} anamnezi boş`, 'Danışan doldurabilir ya da ilk görüşmede dolar.', (gelecek ? `<a class="dugme hayalet" href="${PA.yol.gorusme(gelecek.id)}">Görüşmeyi başlat</a> ` : '') + hatirlat)}</div></div>`
      : !PA.anamnezGorunur(dn) ? kilit('anamnez')
      : a ? `<div class="kart panel">${kartBas('fa-notes-medical', 'Anamnez', `<div class="eylem-satiri">${eksikAlan ? PA.hap(eksikAlan + ' alan eksik', 'bekleyen') + (dn.anamnez_hatirlatma ? '' : '<button class="dugme hayalet kucuk" type="button" data-is="anamnez-hatirlat">Hatırlat</button>') : PA.hap('Dolduruldu', 'cozulen')}<button class="dugme hayalet kucuk" type="button" data-is="hassasiyet"><i class="fa-solid fa-plus" aria-hidden="true"></i> Alerji ekle</button></div>`)}<div class="kart-govde">${kunye([['Meslek', h(a.meslek)], ['Şikâyet', h(a.sikayet)], ['Uyku', h(a.uyku)], ['Su', h(a.su)], ['Hareket', h(a.hareket)], ['İlaç ve takviye', (a.ilaclar || []).length ? h(a.ilaclar.join(', ')) : 'Yok'], ['Aile öyküsü', h(a.aile_oykusu)], ['Alışkanlıklar', h(a.aliskanliklar)], ['Hassasiyet ve kronik durum', hs.length ? h(hs.join(', ')) : 'Yok']])}</div></div>`
        : `<div class="kart panel">${kartBas('fa-notes-medical', 'Anamnez', PA.hap('Bekliyor', 'bekleyen'))}<div class="kart-govde">${bos('fa-notes-medical', `${h(ilgi)} anamnezi boş`, 'İzin açık, danışan henüz formu doldurmadı.', hatirlat)}</div></div>`;
    const l = notSirali(), pr = PA.protokoller(dn);
    const protokol = `<div class="kart panel">${kartBas('fa-clipboard-check', 'Beslenme Protokolü', `<button class="dugme hayalet kucuk" type="button" data-is="protokol"><i class="fa-solid ${pr.length ? 'fa-pen' : 'fa-plus'}" aria-hidden="true"></i> ${pr.length ? 'Düzenle' : 'Protokol tanımla'}</button>`, pr.length ? PA.tarih(dn.protokol.tarih) + ' tarihinden beri' : '')}<div class="kart-govde">${pr.length ? `<div class="yigin sik"><span class="rozet-sira">${pr.map((p) => `<span class="rozet olumlu">${h(p.ad)}</span>`).join('')}</span>${dn.protokol.not ? `<div class="not-kutu"><b>Not</b>${h(dn.protokol.not)}</div>` : ''}<p class="alan-yardim"><i class="fa-solid fa-clipboard-list" aria-hidden="true"></i><span>Plan oluşturucu bu protokolü uyarı ve önerilere katar.</span></p></div>` : bos('fa-clipboard-check', 'Protokol tanımlı değil', 'Düşük FODMAP, glütensiz ya da diyabetik gibi bir beslenme protokolü tanımlarsan planlar ona göre denetlenir.')}</div></div>`;
    $('p-not').innerHTML = `<div class="yigin">${anamnez}${protokol}<div class="kart panel">${kartBas('fa-clock-rotate-left', 'Klinik Notlar', '<button class="dugme hayalet kucuk" type="button" data-is="not-ekle"><i class="fa-solid fa-plus" aria-hidden="true"></i> Not ekle</button>', l.length + ' not')}<div class="kart-govde">${l.length ? `<div class="zaman-cizelgesi">${l.map((n) => `<div class="zc-kalem gecti"><div class="zc-zaman">${PA.tarih(n.tarih)}</div><div class="zc-metin">${h(n.metin)}</div>${n.sabit || n.paylasildi ? `<div class="eylem-satiri">${n.sabit ? '<span class="rozet olumlu">Sabit</span>' : ''}${n.paylasildi ? '<span class="rozet pasif">Danışanla paylaşıldı</span>' : ''}</div>` : ''}</div>`).join('')}</div>` : bos('fa-note-sticky', `${h(ilgi)} klinik notu yok`, 'İlk görüşme notunu ekle.')}</div></div></div>`;
  }
  $('notPanelForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!PA.formGecerli(e.target)) return;
    dn.klinik_notlar.push({ tarih: DD.bugun, metin: $('notMetin').value.trim(), paylasildi: $('notPaylas').checked, sabit: $('notSabit').checked });
    PA.kaydet(); e.target.reset(); DD.kapat($('notPanel')); DD.toast('Not kaydedildi.'); notCiz(); ozetCiz();
  });
  $('hassasiyetPanelForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!PA.formGecerli(e.target)) return;
    dn.hassasiyetler.push($('hsMetin').value.trim());
    PA.kaydet(); e.target.reset(); DD.kapat($('hassasiyetPanel')); DD.toast('Hassasiyet eklendi.'); notCiz(); ozetCiz();
  });

  $('protokolPanelForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const idler = [...$('prKutular').querySelectorAll('input:checked')].map((x) => x.value);
    const onceki = (dn.protokol && dn.protokol.idler) || [];
    if (idler.length) dn.protokol = { idler, not: $('prNot').value.trim(), tarih: idler.join() === onceki.join() && dn.protokol ? dn.protokol.tarih : DD.bugun };
    else delete dn.protokol;
    PA.kaydet(); DD.kapat($('protokolPanel'));
    DD.toast(idler.length ? 'Protokol kaydedildi: ' + PA.protokoller(dn).map((p) => p.ad).join(', ') : 'Protokol kaldırıldı.');
    notCiz(); ozetCiz();
  });

  /* ── Plan geçmişi ───────────────────────────────────────────────── */
  const PLAN_DURUM = { gonderildi: ['Gönderildi', 'cozulen'], taslak: ['Taslak', 'acik'], arsiv: ['Arşiv', 'kapali'] };
  function planCiz() {
    const l = PA.d().planlar.filter((p) => p.danisan_id === id).sort((a, b) => b.tarih.localeCompare(a.tarih));
    const yeni = `<a class="dugme hayalet kucuk" href="${PA.yol.yeniPlan(id)}"><i class="fa-solid fa-plus" aria-hidden="true"></i> Yeni plan</a>`;
    $('p-plan').innerHTML = `<div class="kart panel">${kartBas('fa-clipboard-list', 'Plan Geçmişi', yeni, l.length + ' plan')}<div class="kart-govde bosluksuz">${l.length ? `<div class="tablo-kap gomulu"><table class="tablo panel sabit-sutun tek-eylem etiketli-yigin"><caption class="yalniz-okuyucu">Plan geçmişi</caption><thead><tr><th scope="col" data-oran="40">Plan</th><th class="num" scope="col" data-oran="16">Hedef</th><th scope="col" data-oran="18">Tarih</th><th scope="col" data-oran="14">Durum</th><th class="eylem" scope="col">İşlem</th></tr></thead><tbody>${l.map((p) => { const [e, s] = PLAN_DURUM[p.durum] || [p.durum, 'kapali']; const ogun = p.gunler && p.gunler[0] ? Object.keys(p.gunler[0].ogunler).length : 0; return `<tr><td data-etiket="Plan"><a href="${PA.yol.plan(p.id)}"><b>${h(p.ad)}</b></a><small>${p.gunler ? p.gunler.length : 0} gün · ${ogun} öğün</small></td><td class="num" data-etiket="Hedef">${DD.bicim.kcal(p.hedef_kcal)}</td><td data-etiket="Tarih">${PA.tarih(p.tarih)}</td><td data-etiket="Durum">${PA.hap(e, s)}</td><td class="eylem"><span class="satir-eylem"><a class="ikon-dugme" href="${PA.yol.plan(p.id)}" aria-label="${h(p.ad)} planını aç"><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></span></td></tr>`; }).join('')}</tbody></table></div>` : `<div class="kart-govde">${bos('fa-clipboard', `${h(ilgi)} planı yok`, 'İlk planı oluşturduğunda burada görünür.', yeni)}</div>`}</div></div>`;
    PA.oranTablo($('p-plan'));
  }

  /* ── Mesajlar: sekme açılınca okunmuş sayılır ───────────────────── */
  let sohbetKurulu = false;
  const sohbetKur = () => PA.sohbet($('detaySohbet'), id, { kisayol: false, gonderildi: () => { basCiz(); ozetCiz(); } });
  function mesajAc() {
    if (sohbetKurulu) return;
    sohbetKurulu = true;
    $('p-mesaj').innerHTML = '<div class="sohbet-gomulu"><section class="sohbet-sutun alan" aria-label="Sohbet" id="detaySohbet"></section></div>';
    sohbetKur();
    basCiz();
  }

  /* ── Veri izinleri ──────────────────────────────────────────────── */
  function izinCiz() {
    const t = talepler();
    $('p-izin').innerHTML = `<div class="yigin"><div class="bilgi-notu"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i><p>Veri paylaşımını danışan kendi hesabından yönetir. Kapalı türleri göremezsin, izin isteyebilirsin. <b>Her görüntüleme kayda geçer.</b></p></div>
<div class="kart panel">${kartBas('fa-key', 'Paylaşılan Veri Türleri')}<div class="kart-govde"><div class="ayar-liste">${Object.keys(IZIN).map((k) => { const [ad, ikon, acik] = IZIN[k], var_ = dn.izinler[k]; return `<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ${var_ ? ikon : 'fa-lock'}" aria-hidden="true"></i></span><span class="as-metin"><b>${ad}</b><span>${acik}</span></span><span class="as-eylem">${var_ ? PA.hap('İzin var', 'cozulen') : (dn.izin_cevap || {})[k] === 'red' && !t[k] ? PA.hap('Reddedildi', 'hata') + `<button class="dugme hayalet kucuk" type="button" data-izin-iste="${k}">Yeniden iste</button>` : t[k] ? PA.hap('İstendi · ' + PA.tarih(t[k]), 'bekleyen') : PA.hap('İzin yok', 'kapali') + `<button class="dugme hayalet kucuk" type="button" data-izin-iste="${k}">İzin iste</button>`}</span></div>`; }).join('')}</div></div></div></div>`;
  }
  function izinIste(tur) {
    PA.izinIste(id, tur);
    tumunuCiz();
  }
  const tumunuCiz = () => { basCiz(); ozetCiz(); olcumCiz(); tahlilCiz(); notCiz(); planCiz(); izinCiz(); };

  /* ── Olaylar ────────────────────────────────────────────────────── */
  function hedefAc() {
    $('hTur').value = dn.hedef_turu || 'Kilo dengesi';
    $('hBaslangic').value = dn.olcumler[0] ? dn.olcumler[0].kilo : dn.kilo;
    $('hKilo').value = dn.hedef_kilo;
    $('hAralik').value = dn.kontrol_araligi || 14;
    DD.ac('#hedefPanel');
  }
  $('hedefPanelForm').addEventListener('submit', (e) => {
    e.preventDefault();
    dn.hedef_turu = $('hTur').value;
    if ($('hKilo').value !== '') dn.hedef_kilo = Number($('hKilo').value);
    if ($('hBaslangic').value !== '' && dn.olcumler[0]) dn.olcumler[0].kilo = Number($('hBaslangic').value);
    dn.kontrol_araligi = Number($('hAralik').value) || 14;
    PA.kaydet(); DD.kapat($('hedefPanel')); DD.toast('Hedef güncellendi.');
    basCiz(); ozetCiz(); olcumCiz();
  });
  const sekmeAc = (s) => { const t = $('t-' + s); if (t) { t.click(); t.scrollIntoView({ block: 'nearest', inline: 'center' }); } };
  $('mesajGit').addEventListener('click', () => { sekmeAc('mesaj'); });
  $('detaySekme').addEventListener('click', (e) => {
    const t = e.target.closest('.sekme');
    if (!t) return;
    const s = t.id.slice(2), u = new URL(location.href);
    if (s === 'ozet') u.searchParams.delete('sekme'); else u.searchParams.set('sekme', s);
    history.replaceState(null, '', u);
    if (s === 'mesaj') mesajAc();
  });
  document.addEventListener('click', (e) => {
    const r = e.target.closest('[data-randevu]');
    if (r) { PA.randevuDetay(r.dataset.randevu); return; }
    const iz = e.target.closest('[data-izin-iste]');
    if (iz) { izinIste(iz.dataset.izinIste); return; }
    const o = e.target.closest('[data-olcum]');
    if (o) { olcumAc(+o.dataset.olcum); return; }
    const th = e.target.closest('[data-tahlil]');
    if (th) { v.tahlil = th.dataset.tahlil; tahlilCiz(); return; }
    const sg = e.target.closest('[data-sekme-git]');
    if (sg) { sekmeAc(sg.dataset.sekmeGit); return; }
    const b = e.target.closest('[data-is]');
    if (!b) return;
    const is = b.dataset.is;
    if (is === 'olcum-ekle') olcumAc(null);
    else if (is === 'rapor') raporAc();
    else if (is === 'hedef') hedefAc();
    else if (is === 'yanitla') sekmeAc('mesaj');
    else if (is === 'yanitlandi') { PA.yanitlandi(id); PA.kaydet(); basCiz(); ozetCiz(); DD.toast('Danışan aktif listesine alındı.'); }
    else if (is === 'deger-ekle') DD.ac('#degerPanel');
    else if (is === 'not-ekle') DD.ac('#notPanel');
    else if (is === 'anamnez-hatirlat') { dn.anamnez_hatirlatma = DD.bugun; PA.mesajYaz(id, 'Görüşmemize hazırlık için Sağlık Dosyam ekranındaki anamnez formunu doldurabilir misiniz?'); PA.kaydet(); DD.toast('Anamnez hatırlatması gönderildi.'); notCiz(); }
    else if (is === 'hassasiyet') DD.ac('#hassasiyetPanel');
    else if (is === 'protokol') {
      const secili = (dn.protokol && dn.protokol.idler) || [];
      $('prKutular').innerHTML = PA.PROTOKOLLER.map((p) => `<label class="onay-kutusu"><input type="checkbox" value="${p.id}"${secili.includes(p.id) ? ' checked' : ''}><span><b>${h(p.ad)}</b><br><small>${h(p.not)}</small></span></label>`).join('');
      $('prNot').value = (dn.protokol && dn.protokol.not) || '';
      DD.ac('#protokolPanel');
    }
    else if (is === 'tahlil-yukle') $('tahlilDosya').click();
    else if (is === 'tahlil-ac') {
      const t = dn.tahliller.find((x) => x.dosya_adi === v.tahlil), pencere = t && window.open('', '_blank');
      if (!t) return;
      DD.belgeKasa.al(DD.belgeKasa.anahtar(t.dosya_adi, t.tarih)).then((f) => {
        if (f) { if (pencere) pencere.location.href = f.url; else window.location.href = f.url; return; }
        if (pencere) pencere.close();
        DD.toast('PDF bu tarayıcıda yok. Prototipte dosya yalnız yüklendiği tarayıcıda saklanır; üründe sunucudan açılır.', 'uyari');
      });
    }
    else if (is === 'tahlil-iste') { dn.tahlil_istegi = { tarih: DD.bugun, not: 'Güncel kan tahlili' }; PA.mesajYaz(id, 'Güncel kan tahlilinizi Sağlık Dosyam ekranından yükleyebilir misiniz? Görüşmede birlikte değerlendirelim.'); PA.kaydet(); DD.toast('Tahlil isteği gönderildi.'); tahlilCiz(); }
    else if (is === 'tahlil-incelendi') { const t = dn.tahliller.find((x) => x.dosya_adi === v.tahlil); if (t) t.incelendi = true; PA.kaydet(); DD.toast('Tahlil incelendi olarak işaretlendi.'); tahlilCiz(); basCiz(); }
    else if (is === 'baslat') { dn.durum = 'aktif'; PA.kaydet(); basCiz(); ozetCiz(); DD.toast('Takip yeniden başladı.'); }
    else if (is === 'bitir') window.DM_ONAY('Takip bitirilsin mi?', dn.ad + ' Bitti sekmesine geçer. Geçmiş kayıtlar silinmez.', 'Takibi bitir', (ok) => { if (!ok) return; dn.durum = 'bitti'; PA.kaydet(); basCiz(); ozetCiz(); DD.toast('Takip bitirildi.'); });
  });
  document.addEventListener('change', (e) => {
    if (e.target.id !== 'tahlilDosya' || !e.target.files[0]) return;
    const f = e.target.files[0];
    dn.tahliller.push({ tarih: DD.bugun, dosya_adi: f.name, degerler: [], yukleyen: 'diyetisyen' });
    v.tahlil = f.name;
    /* Dosya bu tarayıcının belge kasasına girer; PDF'i aç buradan okur */
    DD.belgeKasa.koy(DD.belgeKasa.anahtar(f.name, DD.bugun), f);
    PA.kaydet(); DD.toast('Dosya eklendi. Değerleri Değer ekle ile işleyebilirsin.'); tahlilCiz();
  });
  document.addEventListener('pa:degisti', () => { tumunuCiz(); if (sohbetKurulu) sohbetKur(); });

  /* Sabit sütunlu tabloların yüzde genişlikleri: basıldıktan sonra uygulanır */
  PA.oranTablo = PA.oranlar;
  basCiz(); ozetCiz(); olcumCiz(); tahlilCiz(); notCiz(); planCiz(); izinCiz();
  PA.sekmeSabitle($('detaySekme'));
  const ilkSekme = PA.parametre('sekme');
  if (ilkSekme) sekmeAc(ilkSekme);
  if (PA.parametre('eylem') === 'not-ekle') DD.ac('#notPanel');
})();
