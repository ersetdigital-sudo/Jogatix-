/* Jogatix — Transaction Tracking & Lookup Engine
   Provides verification and status retrieval for order IDs
*/
(function () {
  'use strict';

  const searchInput = document.getElementById('tx-search-input');
  const searchBtn = document.getElementById('tx-search-btn');
  const sampleBtns = document.querySelectorAll('.sample-id-btn');

  const resultCard = document.getElementById('tx-result-card');
  const notFoundCard = document.getElementById('tx-not-found-card');

  // Result Elements
  const resId = document.getElementById('res-tx-id');
  const resBadge = document.getElementById('res-status-badge');
  const resCat = document.getElementById('res-category');
  const resProvRow = document.getElementById('res-provider-row');
  const resProv = document.getElementById('res-provider');
  const resProd = document.getElementById('res-product');
  const resCust = document.getElementById('res-customer-id');
  const resDate = document.getElementById('res-date');
  const resPay = document.getElementById('res-payment-method');
  const resTotal = document.getElementById('res-total');
  const resSnBox = document.getElementById('res-sn-box');
  const resSnVal = document.getElementById('res-sn-val');
  const resSysMsg = document.getElementById('res-system-message');
  const notFoundLabel = document.getElementById('not-found-id-label');

  // Pre-configured Verified Sample Orders (Production-style mock records)
  const SAMPLE_DATABASE = {
    'JGX-7749210': {
      id: 'JGX-7749210',
      category: 'Pulsa',
      product: 'Telkomsel 50.000',
      customer: '081283921049',
      date: '09 Okt 2026, 08:42 WIB',
      paymentMethod: 'QRIS',
      total: 'Rp51.500',
      sn: 'SN2026100908420199',
      status: 'SUCCESS',
      statusLabel: 'Berhasil Dikonfirmasi',
      systemMessage: 'Transaksi telah berhasil diproses oleh provider dan pulsa telah diteruskan ke nomor pelanggan.'
    },
    'JGX-8829104': {
      id: 'JGX-8829104',
      category: 'PLN',
      product: 'Token Listrik Rp100.000',
      customer: '142894109281',
      date: '09 Okt 2026, 07:15 WIB',
      paymentMethod: 'VIRTUAL ACCOUNT',
      total: 'Rp102.500',
      sn: '2981-4920-1940-2819',
      status: 'SUCCESS',
      statusLabel: 'Berhasil Dikonfirmasi',
      systemMessage: 'Token listrik 20 digit telah diterbitkan oleh sistem PLN dan siap diinput pada meteran.'
    },
    'JGX-9014521': {
      id: 'JGX-9014521',
      category: 'Uang Elektronik',
      provider: 'GoPay',
      product: 'GoPay Rp50.000',
      customer: '085718293019',
      date: '09 Okt 2026, 09:05 WIB',
      paymentMethod: 'DOMPET DIGITAL',
      total: 'Rp51.000',
      sn: 'TRX-GOPAY-9014521',
      status: 'PENDING',
      statusLabel: 'Sedang Diproses',
      systemMessage: 'Pembayaran terverifikasi. Provider dompet digital sedang menyelesaikan sinkronisasi saldo akhir.'
    },
    'JGX-6102934': {
      id: 'JGX-6102934',
      category: 'Pembayaran Internet',
      product: 'IndiHome 50 Mbps',
      customer: '0218940192',
      date: '09 Okt 2026, 09:12 WIB',
      paymentMethod: 'QRIS',
      total: 'Rp385.000',
      sn: '',
      status: 'WAITING',
      statusLabel: 'Menunggu Pembayaran',
      systemMessage: 'Tagihan siap dibayar. Menunggu konfirmasi pembayaran dari sistem perbankan sebelum tanggal jatuh tempo.'
    },
    'JGX-4198273': {
      id: 'JGX-4198273',
      category: 'Pulsa',
      product: 'Indosat 25.000',
      customer: '085819284910',
      date: '08 Okt 2026, 21:30 WIB',
      paymentMethod: 'VIRTUAL ACCOUNT',
      total: 'Rp26.500',
      sn: '',
      status: 'FAILED',
      statusLabel: 'Transaksi Gagal',
      systemMessage: 'Gangguan sementara pada jaringan provider Indosat. Pengembalian dana dapat diajukan melalui Pusat Bantuan.'
    }
  };

  function getStoredOrders() {
    try {
      return JSON.parse(localStorage.getItem('jogatix_orders') || '{}');
    } catch (e) {
      return {};
    }
  }

  function lookupTransaction(id) {
    if (!id) return;
    const cleanId = id.trim().toUpperCase();

    // Check localStorage first, then pre-configured database
    const localDb = getStoredOrders();
    const order = localDb[cleanId] || SAMPLE_DATABASE[cleanId];

    if (order) {
      if (notFoundCard) notFoundCard.style.display = 'none';
      if (resultCard) resultCard.style.display = 'block';

      if (resId) resId.textContent = order.id;
      if (resCat) resCat.textContent = order.category || '-';
      if (resProvRow && resProv) {
        if (order.provider) {
          resProvRow.style.display = 'flex';
          resProv.textContent = order.provider;
        } else {
          resProvRow.style.display = 'none';
        }
      }
      if (resProd) resProd.textContent = order.product || '-';
      if (resCust) resCust.textContent = order.customer || '-';
      if (resDate) resDate.textContent = order.date || order.createdAt || '-';
      if (resPay) resPay.textContent = order.paymentMethod || 'QRIS';
      if (resTotal) resTotal.textContent = order.totalFormatted || order.total || '-';

      // Status Badge
      if (resBadge) {
        resBadge.className = 'tx-badge';
        if (order.status === 'SUCCESS') {
          resBadge.classList.add('success');
          resBadge.textContent = order.statusLabel || 'Berhasil Dikonfirmasi';
        } else if (order.status === 'PENDING') {
          resBadge.classList.add('pending');
          resBadge.textContent = order.statusLabel || 'Sedang Diproses';
        } else if (order.status === 'WAITING') {
          resBadge.classList.add('waiting');
          resBadge.textContent = order.statusLabel || 'Menunggu Pembayaran';
        } else {
          resBadge.classList.add('failed');
          resBadge.textContent = order.statusLabel || 'Transaksi Belum Berhasil';
        }
      }

      // Serial Number Box
      if (resSnBox) {
        if (order.sn) {
          resSnBox.style.display = 'block';
          if (resSnVal) resSnVal.textContent = order.sn;
        } else {
          resSnBox.style.display = 'none';
        }
      }

      // System Message
      if (resSysMsg) {
        resSysMsg.textContent = order.systemMessage || 'Pesanan terdaftar dalam sistem Jogatix.';
      }

      resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      if (resultCard) resultCard.style.display = 'none';
      if (notFoundCard) notFoundCard.style.display = 'block';
      if (notFoundLabel) notFoundLabel.textContent = cleanId;
      notFoundCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // Search button click
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      lookupTransaction(searchInput.value);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        lookupTransaction(searchInput.value);
      }
    });
  }

  // Sample ID click buttons
  sampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.textContent.trim();
      if (searchInput) searchInput.value = id;
      lookupTransaction(id);
    });
  });

  // URL query parameter auto-lookup (?id=...)
  const urlParam = new URLSearchParams(window.location.search).get('id');
  if (urlParam) {
    if (searchInput) searchInput.value = urlParam;
    lookupTransaction(urlParam);
  }
})();
