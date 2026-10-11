/* Jogatix — halaman detail layanan: isi nomor + pilih nominal langsung di sini. */
(function () {
  const C = window.JogatixCatalog, root = document.getElementById('detail'); if (!root) return;
  const slug = document.body.dataset.kategori || new URLSearchParams(location.search).get('kategori');
  const c = C.get(slug), rp = C.rupiah;
  if (!c) {
    root.innerHTML = `<section class="page-head"><div class="wrap"><span class="eyebrow">Detail layanan</span><h1>Layanan tidak ditemukan.</h1><p class="lead">Pilih salah satu kategori yang tersedia.</p><a class="btn btn-primary" style="margin-top:28px" href="/layanan">Lihat Semua Layanan</a></div></section>`;
    return;
  }
  document.title = c.name + ' — Jogatix';
  const idx = C.categories.indexOf(c), isBill = c.type === C.BILL;
  const prev = C.categories[(idx + C.categories.length - 1) % C.categories.length], next = C.categories[(idx + 1) % C.categories.length];
  const f = c.field;
  const NOTES = {
    'pulsa': 'Pastikan nomor ponsel aktif dan sesuai operator. Pulsa masuk setelah penyedia mengonfirmasi transaksi.',
    'paket-data': 'Kuota dan masa aktif mengikuti ketentuan operator. Periksa detail paket sebelum memilih.',
    'uang-elektronik': 'Gunakan nomor yang terdaftar di dompet digital. Batas saldo mengikuti ketentuan masing-masing penyedia.',
    'pln': 'Token listrik ditampilkan setelah penyedia mengonfirmasi transaksi berhasil. Periksa nomor meter sebelum membayar.',
    'internet': 'Nominal tagihan diambil dari penyedia setelah nomor pelanggan diperiksa.',
    'bpjs': 'Nominal iuran mengikuti data penyedia untuk nomor VA keluarga yang kamu masukkan.',
    'pdam': 'Pilih wilayah PDAM yang sesuai. Nominal tagihan dan denda, jika ada, mengikuti data penyedia.',
    'multifinance': 'Nominal angsuran mengikuti data perusahaan pembiayaan. Pastikan nomor kontrak sesuai dokumenmu.'
  };
  const steps = isBill
    ? [['Isi data', 'Masukkan ' + f.label.toLowerCase().replace(/\bva\b/, 'VA') + (c.providers ? ' dan pilih penyedia.' : '.')], ['Cek tagihan', 'Nominal tagihan dan biaya admin tampil di ringkasan.'], ['Bayar', 'Selesaikan pembayaran, lalu pantau statusnya.']]
    : [['Isi nomor', 'Masukkan ' + f.label.toLowerCase().replace(/\bid\b/, 'ID') + '.'], ['Pilih nominal', 'Harga langsung terlihat di ringkasan.'], ['Bayar', 'Selesaikan pembayaran, lalu pantau statusnya.']];

  const tiles = isBill ? '' : c.products.map(p => `
    <label class="pick"><input type="radio" name="prod" value="${p.id}">
      <span><b>${p.name.replace('Token ', '')}</b><small>${c.slug === 'paket-data' ? p.note : c.slug === 'pln' ? 'Token listrik' : 'Nominal'}</small><em>${rp(p.price)}</em></span>
    </label>`).join('');

  root.innerHTML = `
    <section class="dt-top"><div class="wrap">
      <a class="dt-back" href="/layanan">← Semua layanan</a>
      <div class="dt-title">
        <span class="cat-ico cat-ico-lg">${c.icon}</span>
        <div><span class="eyebrow">${isBill ? 'Tagihan' : 'Prabayar'}</span><h1>${c.name}</h1><p>${c.desc}</p></div>
      </div>
    </div></section>

    <section class="dt-main"><div class="wrap dt-layout">
      <form class="dt-form" id="dtForm" novalidate>
        <div class="dt-block">
          <div class="dt-step"><span>1</span><h2>${isBill ? 'Masukkan data pelanggan' : 'Masukkan nomor tujuan'}</h2></div>
          ${c.providers ? `<div class="field"><label for="dtProv">Penyedia</label><select class="select" id="dtProv"><option value="">Pilih penyedia</option>${c.providers.map(p => `<option>${p}</option>`).join('')}</select><span class="err-msg"></span></div>` : ''}
          <div class="field" style="margin-bottom:0"><label for="dtNum">${f.label}</label>
            <input class="input input-lg" id="dtNum" inputmode="${f.inputmode}" autocomplete="off" placeholder="${f.placeholder}">
            <span class="err-msg" aria-live="polite"></span></div>
        </div>
        <div class="dt-block">
          <div class="dt-step"><span>2</span><h2>${isBill ? 'Cek tagihan' : 'Pilih nominal'}</h2></div>
          ${isBill
            ? `<div class="dt-billinfo"><div><b>Nominal dicek otomatis</b><p>Setelah kamu menekan Cek Tagihan, jumlah tagihan dari penyedia akan tampil sebelum pembayaran.</p></div><div class="bill-fee"><small>Biaya admin</small><b>${rp(c.adminFee)}</b></div></div>`
            : `<div class="pick-grid" role="radiogroup" aria-label="Pilih nominal">${tiles}</div><p class="err-msg" id="dtProdErr" aria-live="polite" style="margin-top:10px"></p>`}
        </div>
        <div class="dt-note"><h3>Perlu diperhatikan</h3><p>${NOTES[c.slug]}</p></div>
      </form>

      <aside class="dt-sum" aria-label="Ringkasan">
        <h2>Ringkasan</h2>
        <div class="sum-row"><span>Layanan</span><span>${c.name}</span></div>
        <div class="sum-row"><span>Nomor</span><span id="sNum">-</span></div>
        <div class="sum-row"><span>${isBill ? 'Tagihan' : 'Produk'}</span><span id="sProd">${isBill ? 'Dicek setelah ini' : '-'}</span></div>
        ${isBill ? `<div class="sum-row"><span>Biaya admin</span><span>${rp(c.adminFee)}</span></div>` : ''}
        <div class="sum-total"><span>${isBill ? 'Admin' : 'Total'}</span><b id="sTotal">${isBill ? rp(c.adminFee) : '-'}</b></div>
        <button class="btn btn-lime dt-go" type="submit" form="dtForm">${isBill ? 'Cek Tagihan' : 'Lanjut ke Ringkasan'} <span class="arr">→</span></button>
        <p class="dt-sum-note">Kamu masih bisa memeriksa dan mengubah pesanan sebelum membayar.</p>
      </aside>
    </div></section>

    <div class="dt-bar" aria-hidden="true"><div><small>${isBill ? 'Biaya admin' : 'Total'}</small><b id="bTotal">${isBill ? rp(c.adminFee) : '-'}</b></div>
      <button class="btn btn-primary" type="submit" form="dtForm" tabindex="-1">${isBill ? 'Cek Tagihan' : 'Lanjut'} <span class="arr">→</span></button></div>

    <section class="dt-how"><div class="wrap">
      <h2 class="dt-h2">Cara transaksi ${c.name}</h2>
      <ol class="dt-flow">${steps.map((s, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span><h3>${s[0]}</h3><p>${s[1]}</p></li>`).join('')}</ol>
      <div class="dt-nav">
        <a href="/layanan/${prev.slug}"><small>← Sebelumnya</small><b>${prev.name}</b></a>
        <a href="/layanan/${next.slug}" style="text-align:right"><small>Berikutnya →</small><b>${next.name}</b></a>
      </div>
    </div></section>`;

  const form = root.querySelector('#dtForm'), num = root.querySelector('#dtNum'), prov = root.querySelector('#dtProv');
  const setErr = (el, m) => { el.classList.toggle('invalid', !!m); el.closest('.field').querySelector('.err-msg').textContent = m; };
  const selected = () => { const r = form.querySelector('input[name=prod]:checked'); return r ? c.products.find(p => p.id === r.value) : null; };
  const update = () => {
    const v = num.value.replace(/[\s-]/g, '');
    root.querySelector('#sNum').textContent = v || '-';
    if (!isBill) {
      const p = selected();
      root.querySelector('#sProd').textContent = p ? p.name : '-';
      root.querySelector('#sTotal').textContent = root.querySelector('#bTotal').textContent = p ? rp(p.price) : '-';
    }
  };
  form.addEventListener('input', update); form.addEventListener('change', update);
  num.addEventListener('blur', () => { const v = num.value.replace(/[\s-]/g, ''); if (v) setErr(num, f.pattern.test(v) ? '' : f.error); });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = num.value.replace(/[\s-]/g, ''); let ok = true, first = null;
    if (prov) { if (!prov.value) { setErr(prov, 'Pilih penyedia terlebih dahulu.'); ok = false; first = first || prov; } else setErr(prov, ''); }
    if (!f.pattern.test(v)) { setErr(num, f.error); ok = false; first = first || num; } else setErr(num, '');
    const p = isBill ? null : selected();
    if (!isBill) { const pe = root.querySelector('#dtProdErr'); if (!p) { pe.textContent = 'Pilih salah satu nominal.'; ok = false; first = first || form.querySelector('.pick input'); } else pe.textContent = ''; }
    if (!ok) { first.focus(); first.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    const q = new URLSearchParams({ kategori: c.slug, nomor: v });
    if (p) q.set('produk', p.id);
    if (prov) q.set('penyedia', prov.value);
    location.href = '/checkout?' + q.toString();
  });
})();
