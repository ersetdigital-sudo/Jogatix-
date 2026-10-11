/* Jogatix — Katalog Layanan Resmi & Lengkap
   Mendukung 8 Kategori: Pulsa, Paket Data, Uang Elektronik, PLN, Internet, BPJS, PDAM, Multifinance
*/
(function () {
  'use strict';

  const PREPAID = 'prabayar';
  const BILL = 'tagihan';

  const rupiah = (n) => 'Rp' + Number(n).toLocaleString('id-ID');

  const nominal = (prefix, list, margin, customNote) => list.map(n => ({
    id: prefix + '-' + n,
    name: 'Rp' + n.toLocaleString('id-ID'),
    note: customNote || ('Nominal ' + rupiah(n)),
    price: n + margin
  }));

  const categories = [
    {
      slug: 'pulsa',
      name: 'Pulsa',
      type: PREPAID,
      desc: 'Isi pulsa untuk tetap terhubung ke semua operator seluler resmi di Indonesia.',
      providers: ['Telkomsel', 'Indosat Ooredoo', 'XL Axiata', 'Tri (3)', 'Smartfren'],
      field: {
        label: 'Nomor Ponsel',
        placeholder: 'Contoh: 081234567890',
        inputmode: 'tel',
        pattern: /^08\d{8,11}$/,
        error: 'Masukkan nomor ponsel yang diawali 08 (10–13 digit).'
      },
      products: [
        { id: 'pulsa-5000', name: 'Rp5.000', note: 'Masa aktif +7 hari', price: 6500 },
        { id: 'pulsa-10000', name: 'Rp10.000', note: 'Masa aktif +15 hari', price: 11500 },
        { id: 'pulsa-15000', name: 'Rp15.000', note: 'Masa aktif +20 hari', price: 16500 },
        { id: 'pulsa-20000', name: 'Rp20.000', note: 'Masa aktif +30 hari', price: 21500 },
        { id: 'pulsa-25000', name: 'Rp25.000', note: 'Masa aktif +30 hari', price: 26500 },
        { id: 'pulsa-30000', name: 'Rp30.000', note: 'Masa aktif +30 hari', price: 31500 },
        { id: 'pulsa-50000', name: 'Rp50.000', note: 'Masa aktif +45 hari', price: 51500 },
        { id: 'pulsa-75000', name: 'Rp75.000', note: 'Masa aktif +60 hari', price: 76500 },
        { id: 'pulsa-100000', name: 'Rp100.000', note: 'Masa aktif +60 hari', price: 101500 },
        { id: 'pulsa-150000', name: 'Rp150.000', note: 'Masa aktif +90 hari', price: 152000 },
        { id: 'pulsa-200000', name: 'Rp200.000', note: 'Masa aktif +120 hari', price: 202000 },
        { id: 'pulsa-300000', name: 'Rp300.000', note: 'Masa aktif +180 hari', price: 303000 },
        { id: 'pulsa-500000', name: 'Rp500.000', note: 'Masa aktif +360 hari', price: 504000 },
        { id: 'pulsa-1000000', name: 'Rp1.000.000', note: 'Masa aktif +360 hari', price: 1005000 }
      ]
    },
    {
      slug: 'paket-data',
      name: 'Paket Data',
      type: PREPAID,
      desc: 'Pilihan kuota internet harian, mingguan, hingga bulanan untuk seluruh operator.',
      providers: ['Telkomsel', 'Indosat Ooredoo', 'XL Axiata', 'Tri (3)', 'Smartfren'],
      field: {
        label: 'Nomor Ponsel',
        placeholder: 'Contoh: 081234567890',
        inputmode: 'tel',
        pattern: /^08\d{8,11}$/,
        error: 'Masukkan nomor ponsel yang diawali 08 (10–13 digit).'
      },
      products: [
        { id: 'data-1gb', name: '1 GB Flash / Harian', note: 'Masa aktif 3 hari', price: 8000 },
        { id: 'data-2gb', name: '2 GB Regular', note: 'Masa aktif 7 hari', price: 13000 },
        { id: 'data-3gb', name: '3 GB Extra Kuota', note: 'Masa aktif 7 hari', price: 18000 },
        { id: 'data-5gb', name: '5 GB Bulanan', note: 'Masa aktif 30 hari', price: 32000 },
        { id: 'data-8gb', name: '8 GB All Network', note: 'Masa aktif 30 hari', price: 45000 },
        { id: 'data-12gb', name: '12 GB Super Kuota', note: 'Masa aktif 30 hari', price: 60000 },
        { id: 'data-15gb', name: '15 GB + Unlimited Apps', note: 'Masa aktif 30 hari', price: 72000 },
        { id: 'data-25gb', name: '25 GB Bulanan Jumbo', note: 'Masa aktif 30 hari', price: 98000 },
        { id: 'data-30gb', name: '30 GB Heavy User', note: 'Masa aktif 30 hari', price: 115000 },
        { id: 'data-50gb', name: '50 GB Ultra Stream', note: 'Masa aktif 30 hari', price: 155000 },
        { id: 'data-100gb', name: '100 GB Max Booster', note: 'Masa aktif 30 hari', price: 240000 }
      ]
    },
    {
      slug: 'uang-elektronik',
      name: 'Uang Elektronik',
      type: PREPAID,
      desc: 'Top up saldo dompet digital praktis: GoPay, OVO, DANA, ShopeePay, dan LinkAja.',
      providers: ['GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja'],
      field: {
        label: 'Nomor Akun Dompet Digital / Ponsel',
        placeholder: 'Contoh: 081234567890 (Nomor akun terdaftar)',
        inputmode: 'tel',
        pattern: /^08\d{8,11}$/,
        error: 'Masukkan nomor akun terdaftar yang diawali 08 (10–13 digit).'
      },
      products: [
        { id: 'ewallet-10000', name: 'Saldo Rp10.000', note: 'Top up saldo instan', price: 11000 },
        { id: 'ewallet-20000', name: 'Saldo Rp20.000', note: 'Top up saldo instan', price: 21000 },
        { id: 'ewallet-25000', name: 'Saldo Rp25.000', note: 'Top up saldo instan', price: 26000 },
        { id: 'ewallet-50000', name: 'Saldo Rp50.000', note: 'Paling sering dipilih', price: 51000 },
        { id: 'ewallet-75000', name: 'Saldo Rp75.000', note: 'Top up saldo instan', price: 76000 },
        { id: 'ewallet-100000', name: 'Saldo Rp100.000', note: 'Top up saldo instan', price: 101000 },
        { id: 'ewallet-150000', name: 'Saldo Rp150.000', note: 'Top up saldo instan', price: 151500 },
        { id: 'ewallet-200000', name: 'Saldo Rp200.000', note: 'Top up saldo instan', price: 201500 },
        { id: 'ewallet-300000', name: 'Saldo Rp300.000', note: 'Top up saldo instan', price: 302000 },
        { id: 'ewallet-500000', name: 'Saldo Rp500.000', note: 'Top up saldo instan', price: 502500 },
        { id: 'ewallet-1000000', name: 'Saldo Rp1.000.000', note: 'Batas harian akun terverifikasi', price: 1003500 }
      ]
    },
    {
      slug: 'pln',
      name: 'PLN',
      type: PREPAID,
      desc: 'Beli token listrik prabayar 20 digit atau bayar tagihan listrik bulanan resmi.',
      providers: ['PLN Prabayar (Token Listrik)', 'PLN Pascabayar (Tagihan)'],
      field: {
        label: 'Nomor Meter / ID Pelanggan PLN',
        placeholder: 'Contoh: 142894109281 (11–12 digit)',
        inputmode: 'numeric',
        pattern: /^\d{11,12}$/,
        error: 'Nomor meter atau ID Pelanggan PLN berisi 11–12 digit angka.'
      },
      products: [
        { id: 'token-20000', name: 'Token Listrik Rp20.000', note: 'KWH sesuai tarif resmi PLN', price: 22500 },
        { id: 'token-50000', name: 'Token Listrik Rp50.000', note: 'KWH sesuai tarif resmi PLN', price: 52500 },
        { id: 'token-100000', name: 'Token Listrik Rp100.000', note: 'KWH sesuai tarif resmi PLN', price: 102500 },
        { id: 'token-200000', name: 'Token Listrik Rp200.000', note: 'KWH sesuai tarif resmi PLN', price: 202500 },
        { id: 'token-500000', name: 'Token Listrik Rp500.000', note: 'KWH sesuai tarif resmi PLN', price: 502500 },
        { id: 'token-1000000', name: 'Token Listrik Rp1.000.000', note: 'KWH sesuai tarif resmi PLN', price: 1002500 },
        { id: 'token-5000000', name: 'Token Listrik Rp5.000.000', note: 'KWH sesuai tarif resmi PLN', price: 5002500 }
      ]
    },
    {
      slug: 'internet',
      name: 'Pembayaran Internet',
      type: BILL,
      desc: 'Pemeriksaan tagihan Wi-Fi rumah & kantor: IndiHome, Biznet, First Media, MyRepublic, CBN.',
      providers: ['IndiHome (Telkom)', 'Biznet Home', 'First Media', 'MyRepublic', 'CBN'],
      field: {
        label: 'Nomor Pelanggan Internet',
        placeholder: 'Contoh: 0218940192 (Sesuai tagihan provider)',
        inputmode: 'numeric',
        pattern: /^\d{6,16}$/,
        error: 'Nomor pelanggan internet berisi 6–16 digit angka.'
      },
      adminFee: 2500
    },
    {
      slug: 'bpjs',
      name: 'BPJS Kesehatan',
      type: BILL,
      desc: 'Periksa iuran dan bayar tagihan BPJS Kesehatan keluarga dengan nomor Virtual Account resmi.',
      providers: ['BPJS Kesehatan Mandiri / Keluarga'],
      field: {
        label: 'Nomor Virtual Account BPJS (16 Digit)',
        placeholder: 'Contoh: 8888801234567890',
        inputmode: 'numeric',
        pattern: /^\d{16}$/,
        error: 'Nomor Virtual Account BPJS harus tepat 16 digit angka.'
      },
      adminFee: 2500
    },
    {
      slug: 'pdam',
      name: 'PDAM',
      type: BILL,
      desc: 'Cek tagihan air bersih PDAM berdasarkan wilayah kabupaten / kota dan nomor pelanggan.',
      providers: ['PAM Jaya (DKI Jakarta)', 'PDAM Surya Sembada (Surabaya)', 'PDAM Tirta Moedal (Semarang)', 'PDAM Tirtawening (Bandung)', 'PDAM Lainnya'],
      field: {
        label: 'Nomor Sambungan / Pelanggan PDAM',
        placeholder: 'Contoh: 1049281 (Sesuai meteran/rekening air)',
        inputmode: 'numeric',
        pattern: /^\d{5,15}$/,
        error: 'Nomor pelanggan PDAM berisi 5–15 digit angka.'
      },
      adminFee: 2500
    },
    {
      slug: 'multifinance',
      name: 'Multifinance',
      type: BILL,
      desc: 'Bayar angsuran kredit kendaraan & pembiayaan: FIF Group, BAF, Adira Finance, OTO, WOM.',
      providers: ['FIF Group', 'BAF (Bussan Auto Finance)', 'Adira Finance', 'OTO Kredit', 'WOM Finance'],
      field: {
        label: 'Nomor Kontrak Pembiayaan',
        placeholder: 'Contoh: 1029481920 (Sesuai perjanjian pembiayaan)',
        inputmode: 'numeric',
        pattern: /^\d{8,16}$/,
        error: 'Nomor kontrak pembiayaan berisi 8–16 digit angka.'
      },
      adminFee: 3500
    }
  ];

  // SVG Ikon Bersih & Tajam
  const ICONS = {
    'pulsa': '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2.5"/><line x1="10" y1="18" x2="14" y2="18"/></svg>',
    'paket-data': '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
    'uang-elektronik': '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
    'pln': '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    'internet': '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    'bpjs': '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    'pdam': '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
    'multifinance': '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>'
  };

  categories.forEach(c => {
    c.icon = ICONS[c.slug] || '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
  });

  // Load custom products from Admin Dashboard if customized
  try {
    const customProds = localStorage.getItem('jogatix_admin_products');
    if (customProds) {
      const parsed = JSON.parse(customProds);
      if (Array.isArray(parsed) && parsed.length > 0) {
        categories.forEach(c => {
          const matching = parsed.filter(p => p.categorySlug === c.slug && p.active !== false);
          if (matching.length > 0) {
            c.products = matching.map(p => ({
              id: p.id,
              name: p.name,
              price: Number(p.price) || 0,
              note: p.note || '',
              provider: p.provider || ''
            }));
          }
        });
      }
    }
  } catch (e) {
    console.warn('Catalog storage sync warning:', e);
  }

  const JogatixCatalog = {
    source: 'catalog',
    categories,
    rupiah,
    get: (slug) => categories.find(c => c.slug === slug),
    PREPAID,
    BILL
  };

  window.JogatixCatalog = JogatixCatalog;

  // Dispatch custom event for subscribers
  try {
    window.dispatchEvent(new CustomEvent('jogatix:catalog-ready', { detail: JogatixCatalog }));
  } catch (e) {}

})();
