/* ==========================================================================
   Jogatix — Official Admin Dashboard Engine
   Full Management: Products, QRIS & Payments, WhatsApp, and Transactions
   ========================================================================== */

(function () {
  'use strict';

  // --- Initial Default Datasets ---
  const DEFAULT_SETTINGS = {
    whatsappNumber: '081234567890',
    whatsappAdminName: 'Customer Care Jogatix',
    whatsappHours: '07:00 - 23:00 WIB Setiap Hari',
    whatsappTemplateOrder: 'Halo Admin Jogatix, saya ingin konfirmasi pembayaran pesanan dengan ID: {id} ({produk}) sebesar {total}. Mohon segera diverifikasi. Terima kasih!',
    whatsappTemplateSuccess: 'Halo Kak! Pesanan Jogatix ID: {id} untuk {produk} telah BERHASIL diproses. Nomor SN / Token Anda: {sn}. Terima kasih telah bertransaksi di Jogatix!',
    qrisImage: '', // base64 or URL
    qrisMerchant: 'JOGATIX DIGITAL COMMERCE',
    qrisNmid: 'ID1020039102910',
    qrisActive: true,
    qrisInstructions: 'Buka aplikasi GoPay, OVO, DANA, ShopeePay, BCA Mobile, atau m-banking lainnya, lalu scan kode QR di atas.',
    banks: [
      { id: 'bca', name: 'BCA', code: 'bca', accNo: '8901289104', accName: 'JOGATIX INDONESIA', active: true },
      { id: 'mandiri', name: 'Mandiri', code: 'mandiri', accNo: '1370019284019', accName: 'JOGATIX INDONESIA', active: true },
      { id: 'bri', name: 'BRI', code: 'bri', accNo: '020601002948301', accName: 'JOGATIX INDONESIA', active: true },
      { id: 'bni', name: 'BNI', code: 'bni', accNo: '0819284910', accName: 'JOGATIX INDONESIA', active: true }
    ],
    ewallets: [
      { id: 'gopay', name: 'GoPay', accNo: '081234567890', accName: 'Jogatix Official', active: true },
      { id: 'dana', name: 'DANA', accNo: '081234567890', accName: 'Jogatix Official', active: true },
      { id: 'ovo', name: 'OVO', accNo: '081234567890', accName: 'Jogatix Official', active: true },
      { id: 'shopeepay', name: 'ShopeePay', accNo: '081234567890', accName: 'Jogatix Official', active: true }
    ],
    adminFeeBill: 2500
  };

  const DEFAULT_SAMPLE_ORDERS = {
    'JGX-7749210': {
      id: 'JGX-7749210',
      category: 'Pulsa',
      categorySlug: 'pulsa',
      provider: 'Telkomsel',
      product: 'Telkomsel — Rp50.000',
      customer: '081283921049',
      createdAt: '09 Okt 2026, 08:42 WIB',
      paymentMethod: 'QRIS',
      total: 51500,
      totalFormatted: 'Rp51.500',
      sn: 'SN2026100908420199',
      status: 'SUCCESS',
      statusLabel: 'Berhasil Dikonfirmasi',
      systemMessage: 'Transaksi telah berhasil diproses oleh provider dan pulsa telah diteruskan ke nomor pelanggan.'
    },
    'JGX-8829104': {
      id: 'JGX-8829104',
      category: 'PLN',
      categorySlug: 'pln',
      provider: 'PLN Prabayar (Token Listrik)',
      product: 'Token Listrik Rp100.000',
      customer: '142894109281',
      createdAt: '09 Okt 2026, 07:15 WIB',
      paymentMethod: 'VIRTUAL ACCOUNT',
      total: 102500,
      totalFormatted: 'Rp102.500',
      sn: '2981-4920-1940-2819',
      status: 'SUCCESS',
      statusLabel: 'Berhasil Dikonfirmasi',
      systemMessage: 'Token listrik 20 digit telah diterbitkan oleh sistem PLN dan siap diinput pada meteran.'
    },
    'JGX-9014521': {
      id: 'JGX-9014521',
      category: 'Uang Elektronik',
      categorySlug: 'uang-elektronik',
      provider: 'GoPay',
      product: 'GoPay — Saldo Rp50.000',
      customer: '085718293019',
      createdAt: '09 Okt 2026, 09:05 WIB',
      paymentMethod: 'DOMPET DIGITAL',
      total: 51000,
      totalFormatted: 'Rp51.000',
      sn: 'TRX-GOPAY-9014521',
      status: 'PENDING',
      statusLabel: 'Sedang Diproses',
      systemMessage: 'Pembayaran terverifikasi. Provider dompet digital sedang menyelesaikan sinkronisasi saldo akhir.'
    },
    'JGX-6102934': {
      id: 'JGX-6102934',
      category: 'Pembayaran Internet',
      categorySlug: 'internet',
      provider: 'IndiHome (Telkom)',
      product: 'Tagihan IndiHome Internet & TV',
      customer: '0218940192',
      createdAt: '09 Okt 2026, 09:12 WIB',
      paymentMethod: 'QRIS',
      total: 385000,
      totalFormatted: 'Rp385.000',
      sn: '',
      status: 'WAITING',
      statusLabel: 'Menunggu Pembayaran',
      systemMessage: 'Tagihan siap dibayar. Menunggu konfirmasi pembayaran dari sistem perbankan sebelum tanggal jatuh tempo.'
    },
    'JGX-4198273': {
      id: 'JGX-4198273',
      category: 'Pulsa',
      categorySlug: 'pulsa',
      provider: 'Indosat Ooredoo',
      product: 'Indosat — Rp25.000',
      customer: '085819284910',
      createdAt: '08 Okt 2026, 21:30 WIB',
      paymentMethod: 'VIRTUAL ACCOUNT',
      total: 26500,
      totalFormatted: 'Rp26.500',
      sn: '',
      status: 'FAILED',
      statusLabel: 'Transaksi Gagal',
      systemMessage: 'Gangguan sementara pada jaringan provider Indosat. Hubungi customer care untuk bantuan.'
    }
  };

  // Helper currency
  const formatRupiah = (n) => 'Rp' + Number(n || 0).toLocaleString('id-ID');

  // --- Storage Accessors ---
  function getSettings() {
    try {
      const stored = localStorage.getItem('jogatix_admin_settings');
      if (stored) return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(stored));
    } catch (e) {}
    return Object.assign({}, DEFAULT_SETTINGS);
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem('jogatix_admin_settings', JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error('Error saving settings:', e);
      return false;
    }
  }

  function getOrders() {
    let orders = {};
    try {
      orders = JSON.parse(localStorage.getItem('jogatix_orders') || '{}');
    } catch (e) {
      orders = {};
    }

    // Merge default samples if not in orders
    let hasNew = false;
    Object.keys(DEFAULT_SAMPLE_ORDERS).forEach(id => {
      if (!orders[id]) {
        orders[id] = DEFAULT_SAMPLE_ORDERS[id];
        hasNew = true;
      }
    });

    if (hasNew) {
      try {
        localStorage.setItem('jogatix_orders', JSON.stringify(orders));
      } catch (e) {}
    }

    return orders;
  }

  function saveOrders(orders) {
    try {
      localStorage.setItem('jogatix_orders', JSON.stringify(orders));
      return true;
    } catch (e) {
      console.error('Error saving orders:', e);
      return false;
    }
  }

  function getProducts() {
    try {
      const stored = localStorage.getItem('jogatix_admin_products');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    // Extract products from window.JogatixCatalog or generate default flat list
    const flat = [];
    if (window.JogatixCatalog && window.JogatixCatalog.categories) {
      window.JogatixCatalog.categories.forEach(cat => {
        if (cat.products && cat.products.length > 0) {
          cat.products.forEach(p => {
            flat.push({
              id: p.id,
              categorySlug: cat.slug,
              categoryName: cat.name,
              provider: (cat.providers && cat.providers.length > 0) ? cat.providers[0] : '',
              name: p.name,
              price: p.price,
              note: p.note || '',
              active: true
            });
          });
        }
      });
    }

    // Fallback if catalog not yet attached
    if (flat.length === 0) {
      flat.push(
        { id: 'pulsa-10000', categorySlug: 'pulsa', categoryName: 'Pulsa', provider: 'Telkomsel', name: 'Rp10.000', price: 11500, note: 'Masa aktif +15 hari', active: true },
        { id: 'pulsa-25000', categorySlug: 'pulsa', categoryName: 'Pulsa', provider: 'Telkomsel', name: 'Rp25.000', price: 26500, note: 'Masa aktif +30 hari', active: true },
        { id: 'pulsa-50000', categorySlug: 'pulsa', categoryName: 'Pulsa', provider: 'Telkomsel', name: 'Rp50.000', price: 51500, note: 'Masa aktif +45 hari', active: true },
        { id: 'pulsa-100000', categorySlug: 'pulsa', categoryName: 'Pulsa', provider: 'Telkomsel', name: 'Rp100.000', price: 101500, note: 'Masa aktif +60 hari', active: true },
        { id: 'data-5gb', categorySlug: 'paket-data', categoryName: 'Paket Data', provider: 'Telkomsel', name: '5 GB Bulanan', price: 32000, note: 'Masa aktif 30 hari', active: true },
        { id: 'data-15gb', categorySlug: 'paket-data', categoryName: 'Paket Data', provider: 'Telkomsel', name: '15 GB + Unlimited Apps', price: 72000, note: 'Masa aktif 30 hari', active: true },
        { id: 'data-25gb', categorySlug: 'paket-data', categoryName: 'Paket Data', provider: 'Telkomsel', name: '25 GB Bulanan Jumbo', price: 98000, note: 'Masa aktif 30 hari', active: true },
        { id: 'ewallet-20000', categorySlug: 'uang-elektronik', categoryName: 'Uang Elektronik', provider: 'GoPay', name: 'Saldo Rp20.000', price: 21000, note: 'Top up saldo instan', active: true },
        { id: 'ewallet-50000', categorySlug: 'uang-elektronik', categoryName: 'Uang Elektronik', provider: 'DANA', name: 'Saldo Rp50.000', price: 51000, note: 'Paling sering dipilih', active: true },
        { id: 'ewallet-100000', categorySlug: 'uang-elektronik', categoryName: 'Uang Elektronik', provider: 'OVO', name: 'Saldo Rp100.000', price: 101000, note: 'Top up saldo instan', active: true },
        { id: 'token-50000', categorySlug: 'pln', categoryName: 'PLN', provider: 'PLN Prabayar (Token Listrik)', name: 'Token Listrik Rp50.000', price: 52500, note: 'KWH sesuai tarif resmi PLN', active: true },
        { id: 'token-100000', categorySlug: 'pln', categoryName: 'PLN', provider: 'PLN Prabayar (Token Listrik)', name: 'Token Listrik Rp100.000', price: 102500, note: 'KWH sesuai tarif resmi PLN', active: true }
      );
    }

    try {
      localStorage.setItem('jogatix_admin_products', JSON.stringify(flat));
    } catch (e) {}

    return flat;
  }

  function saveProducts(products) {
    try {
      localStorage.setItem('jogatix_admin_products', JSON.stringify(products));
      // Dispatch event to inform other pages if listening
      window.dispatchEvent(new CustomEvent('jogatix:products-updated', { detail: products }));
      return true;
    } catch (e) {
      console.error('Error saving products:', e);
      return false;
    }
  }

  // --- Toast Notification System ---
  function showToast(message, type = 'success') {
    const container = document.getElementById('admin-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <div style="font-size: 13.5px; font-weight: 600; color: #0F172A; flex: 1;">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // --- Navigation & View Switching ---
  function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-item-btn[data-view]');
    const viewPanels = document.querySelectorAll('.admin-view-panel');
    const breadcrumbsTitle = document.getElementById('topbar-breadcrumbs-title');
    const breadcrumbsSub = document.getElementById('topbar-breadcrumbs-sub');
    const sidebar = document.getElementById('admin-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle-btn');
    const sidebarClose = document.getElementById('sidebar-close-btn');

    const viewTitles = {
      'overview': { title: 'Ringkasan Statistik', sub: 'Ikhtisar omset, volume pesanan, dan performa transaksi Jogatix' },
      'products': { title: 'Kelola Katalog Produk', sub: 'Atur nominal, harga modal & jual, status aktif, dan variasi layanan' },
      'payment': { title: 'Metode Pembayaran & QRIS', sub: 'Upload foto QRIS resmi, rekening transfer bank, dan e-wallet' },
      'whatsapp': { title: 'Pengaturan WhatsApp CS', sub: 'Atur nomor kontak layanan pelanggan dan template pesan konfirmasi' },
      'transactions': { title: 'Kelola Seluruh Transaksi', sub: 'Verifikasi pembayaran, ubah status pesanan, dan input nomor SN / token' }
    };

    function switchView(viewId) {
      navButtons.forEach(btn => {
        if (btn.dataset.view === viewId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      viewPanels.forEach(panel => {
        if (panel.id === `view-${viewId}`) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });

      if (viewTitles[viewId] && breadcrumbsTitle && breadcrumbsSub) {
        breadcrumbsTitle.textContent = viewTitles[viewId].title;
        breadcrumbsSub.textContent = viewTitles[viewId].sub;
      }

      // Close mobile sidebar on select
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }

      // Trigger view re-renders
      if (viewId === 'overview') renderOverview();
      if (viewId === 'products') renderProductsTable();
      if (viewId === 'payment') renderPaymentSettings();
      if (viewId === 'whatsapp') renderWhatsAppSettings();
      if (viewId === 'transactions') renderTransactionsTable();
    }

    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        switchView(btn.dataset.view);
      });
    });

    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    if (sidebarClose && sidebar) {
      sidebarClose.addEventListener('click', () => {
        sidebar.classList.remove('open');
      });
    }

    // Default switch
    switchView('overview');
  }

  // --- View 1: Overview Dashboard ---
  function renderOverview() {
    const orders = getOrders();
    const orderList = Object.values(orders);
    const products = getProducts();

    let totalRevenue = 0;
    let countSuccess = 0;
    let countWaiting = 0;
    let countPending = 0;
    let countFailed = 0;

    orderList.forEach(o => {
      const status = (o.status || '').toUpperCase();
      if (status === 'SUCCESS') {
        countSuccess++;
        totalRevenue += (Number(o.total) || 0);
      } else if (status === 'WAITING') {
        countWaiting++;
      } else if (status === 'PENDING') {
        countPending++;
      } else if (status === 'FAILED') {
        countFailed++;
      }
    });

    // Update Quick Stats
    const statTotalOrders = document.getElementById('stat-total-orders');
    const statTotalRevenue = document.getElementById('stat-total-revenue');
    const statSuccessOrders = document.getElementById('stat-success-orders');
    const statPendingOrders = document.getElementById('stat-pending-orders');
    const badgeOrderNav = document.getElementById('badge-order-nav');

    if (statTotalOrders) statTotalOrders.textContent = orderList.length;
    if (statTotalRevenue) statTotalRevenue.textContent = formatRupiah(totalRevenue);
    if (statSuccessOrders) statSuccessOrders.textContent = countSuccess;
    if (statPendingOrders) statPendingOrders.textContent = (countPending + countWaiting);
    if (badgeOrderNav) badgeOrderNav.textContent = orderList.length;

    // Render Recent 5 Transactions in Overview
    const recentTableBody = document.getElementById('recent-orders-table-body');
    if (recentTableBody) {
      const sorted = [...orderList].reverse().slice(0, 5);
      if (sorted.length === 0) {
        recentTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94A3B8; padding: 24px;">Belum ada riwayat transaksi.</td></tr>`;
      } else {
        recentTableBody.innerHTML = sorted.map(o => {
          let badgeClass = 'waiting';
          let statusText = 'Menunggu';
          if (o.status === 'SUCCESS') { badgeClass = 'success'; statusText = 'Berhasil'; }
          else if (o.status === 'PENDING') { badgeClass = 'pending'; statusText = 'Diproses'; }
          else if (o.status === 'FAILED') { badgeClass = 'failed'; statusText = 'Gagal'; }

          return `
            <tr>
              <td><span class="tx-id-badge">${o.id}</span></td>
              <td>
                <div style="font-weight: 600; color: #0F172A;">${o.product || o.category}</div>
                <div style="font-size: 12px; color: #64748B;">${o.customer || '-'}</div>
              </td>
              <td><b>${formatRupiah(o.total)}</b></td>
              <td><span style="font-size: 12.5px; color: #475569;">${o.paymentMethod || 'QRIS'}</span></td>
              <td>
                <span class="status-pill-admin ${badgeClass}">
                  <span class="status-dot-sm"></span>
                  ${statusText}
                </span>
              </td>
              <td>
                <button type="button" class="btn-icon-square btn-open-detail" data-id="${o.id}" title="Kelola Transaksi">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </td>
            </tr>
          `;
        }).join('');

        recentTableBody.querySelectorAll('.btn-open-detail').forEach(b => {
          b.addEventListener('click', () => openTransactionModal(b.dataset.id));
        });
      }
    }
  }

  // --- View 2: Product Management ---
  let productFilterCat = 'all';
  let productSearchQuery = '';

  function renderProductsTable() {
    const products = getProducts();
    const tbody = document.getElementById('products-table-body');
    const badgeProdNav = document.getElementById('badge-prod-nav');
    if (badgeProdNav) badgeProdNav.textContent = products.length;

    if (!tbody) return;

    let filtered = products.filter(p => {
      const matchCat = (productFilterCat === 'all' || p.categorySlug === productFilterCat);
      const search = productSearchQuery.toLowerCase();
      const matchSearch = !search ||
        (p.name && p.name.toLowerCase().includes(search)) ||
        (p.provider && p.provider.toLowerCase().includes(search)) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(search));
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94A3B8; padding: 32px;">Tidak ditemukan produk sesuai kriteria pencarian.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const isActive = p.active !== false;
      return `
        <tr>
          <td>
            <span style="font-weight: 700; color: #4F46E5; background: #EEF2FF; padding: 3px 8px; border-radius: 6px; font-size: 12px;">
              ${p.categoryName || p.categorySlug}
            </span>
          </td>
          <td>
            <div style="font-weight: 700; color: #0F172A; font-size: 14px;">${p.name}</div>
            <div style="font-size: 12px; color: #64748B;">ID: ${p.id}</div>
          </td>
          <td>
            <span style="display: inline-block; padding: 2px 8px; background: #F1F5F9; border-radius: 4px; font-size: 12.5px; font-weight: 600; color: #334155;">
              ${p.provider || '-'}
            </span>
          </td>
          <td>
            <div style="font-weight: 800; color: #0F172A; font-size: 14px;">${formatRupiah(p.price)}</div>
          </td>
          <td>
            <span style="font-size: 12.5px; color: #64748B;">${p.note || '-'}</span>
          </td>
          <td>
            <label style="position: relative; display: inline-block; width: 38px; height: 20px; cursor: pointer;">
              <input type="checkbox" class="toggle-product-active" data-id="${p.id}" ${isActive ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
              <span style="position: absolute; inset: 0; background-color: ${isActive ? '#4F46E5' : '#CBD5E1'}; border-radius: 20px; transition: 0.2s;">
                <span style="position: absolute; left: ${isActive ? '20px' : '3px'}; top: 3px; width: 14px; height: 14px; background: white; border-radius: 50%; transition: 0.2s;"></span>
              </span>
            </label>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn-icon-square btn-edit-prod" data-id="${p.id}" title="Edit Produk">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button type="button" class="btn-icon-square danger btn-delete-prod" data-id="${p.id}" title="Hapus Produk">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach listeners
    tbody.querySelectorAll('.toggle-product-active').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const prodId = e.target.dataset.id;
        const allProds = getProducts();
        const target = allProds.find(p => p.id === prodId);
        if (target) {
          target.active = e.target.checked;
          saveProducts(allProds);
          renderProductsTable();
          showToast(`Status produk "${target.name}" berhasil diubah.`);
        }
      });
    });

    tbody.querySelectorAll('.btn-edit-prod').forEach(btn => {
      btn.addEventListener('click', () => openProductModal(btn.dataset.id));
    });

    tbody.querySelectorAll('.btn-delete-prod').forEach(btn => {
      btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
    });
  }

  function initProductControls() {
    const searchInput = document.getElementById('search-products-input');
    const catSelect = document.getElementById('filter-product-cat');
    const btnAddProd = document.getElementById('btn-add-product');
    const btnResetCatalog = document.getElementById('btn-reset-catalog');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        productSearchQuery = e.target.value.trim();
        renderProductsTable();
      });
    }

    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        productFilterCat = e.target.value;
        renderProductsTable();
      });
    }

    if (btnAddProd) {
      btnAddProd.addEventListener('click', () => openProductModal(null));
    }

    if (btnResetCatalog) {
      btnResetCatalog.addEventListener('click', () => {
        if (confirm('Apakah kamu yakin ingin mengembalikan seluruh daftar produk ke konfigurasi bawaan katalog Jogatix?')) {
          localStorage.removeItem('jogatix_admin_products');
          renderProductsTable();
          showToast('Katalog produk telah di-reset ke pengaturan standar bawaan.');
        }
      });
    }
  }

  // Add / Edit Product Modal
  function openProductModal(prodId) {
    const modal = document.getElementById('modal-product');
    const form = document.getElementById('form-product-edit');
    const title = document.getElementById('modal-product-title');
    const hiddenId = document.getElementById('prod-input-id');
    const selCat = document.getElementById('prod-input-cat');
    const inputProv = document.getElementById('prod-input-provider');
    const inputName = document.getElementById('prod-input-name');
    const inputPrice = document.getElementById('prod-input-price');
    const inputNote = document.getElementById('prod-input-note');
    const inputActive = document.getElementById('prod-input-active');

    if (!modal || !form) return;

    if (prodId) {
      const products = getProducts();
      const p = products.find(x => x.id === prodId);
      if (!p) return;

      title.textContent = 'Edit Produk';
      hiddenId.value = p.id;
      selCat.value = p.categorySlug || 'pulsa';
      inputProv.value = p.provider || '';
      inputName.value = p.name || '';
      inputPrice.value = p.price || '';
      inputNote.value = p.note || '';
      inputActive.checked = p.active !== false;
    } else {
      title.textContent = 'Tambah Produk Baru';
      form.reset();
      hiddenId.value = '';
      inputActive.checked = true;
    }

    modal.classList.add('active');
  }

  function saveProductForm(e) {
    e.preventDefault();
    const hiddenId = document.getElementById('prod-input-id').value;
    const catSlug = document.getElementById('prod-input-cat').value;
    const provider = document.getElementById('prod-input-provider').value.trim();
    const name = document.getElementById('prod-input-name').value.trim();
    const price = Number(document.getElementById('prod-input-price').value) || 0;
    const note = document.getElementById('prod-input-note').value.trim();
    const active = document.getElementById('prod-input-active').checked;

    if (!name || price <= 0) {
      alert('Mohon isi nama produk dan nominal harga yang valid.');
      return;
    }

    const catNames = {
      'pulsa': 'Pulsa',
      'paket-data': 'Paket Data',
      'uang-elektronik': 'Uang Elektronik',
      'pln': 'PLN',
      'internet': 'Pembayaran Internet',
      'bpjs': 'BPJS Kesehatan',
      'pdam': 'PDAM',
      'multifinance': 'Multifinance'
    };

    const products = getProducts();

    if (hiddenId) {
      // Edit
      const existing = products.find(p => p.id === hiddenId);
      if (existing) {
        existing.categorySlug = catSlug;
        existing.categoryName = catNames[catSlug] || catSlug;
        existing.provider = provider;
        existing.name = name;
        existing.price = price;
        existing.note = note;
        existing.active = active;
      }
    } else {
      // Create
      const newId = (catSlug + '-' + Date.now().toString().slice(-6));
      products.unshift({
        id: newId,
        categorySlug: catSlug,
        categoryName: catNames[catSlug] || catSlug,
        provider: provider,
        name: name,
        price: price,
        note: note,
        active: active
      });
    }

    saveProducts(products);
    renderProductsTable();
    closeAllModals();
    showToast(hiddenId ? 'Produk berhasil diperbarui!' : 'Produk baru berhasil ditambahkan!');
  }

  function deleteProduct(prodId) {
    if (!confirm('Yakin ingin menghapus produk ini dari katalog?')) return;
    const products = getProducts();
    const updated = products.filter(p => p.id !== prodId);
    saveProducts(updated);
    renderProductsTable();
    showToast('Produk telah dihapus.');
  }

  // --- View 3: Foto QRIS & Metode Pembayaran ---
  function renderPaymentSettings() {
    const settings = getSettings();

    // QRIS inputs
    const switchQris = document.getElementById('setting-qris-active');
    const merchantInput = document.getElementById('setting-qris-merchant');
    const nmidInput = document.getElementById('setting-qris-nmid');
    const instrInput = document.getElementById('setting-qris-instructions');
    const previewMerchant = document.getElementById('preview-qris-merchant');
    const previewNmid = document.getElementById('preview-qris-nmid');
    const previewFrame = document.getElementById('preview-qris-image-frame');
    const feeInput = document.getElementById('setting-admin-fee');

    if (switchQris) switchQris.checked = settings.qrisActive !== false;
    if (merchantInput) merchantInput.value = settings.qrisMerchant || '';
    if (nmidInput) nmidInput.value = settings.qrisNmid || '';
    if (instrInput) instrInput.value = settings.qrisInstructions || '';
    if (feeInput) feeInput.value = settings.adminFeeBill || 2500;

    if (previewMerchant) previewMerchant.textContent = settings.qrisMerchant || 'JOGATIX DIGITAL COMMERCE';
    if (previewNmid) previewNmid.textContent = 'NMID: ' + (settings.qrisNmid || 'ID1020039102910');

    // QRIS Image Display
    if (previewFrame) {
      if (settings.qrisImage) {
        previewFrame.innerHTML = `<img src="${settings.qrisImage}" alt="QRIS Code" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
      } else {
        // Fallback default clean SVG
        previewFrame.innerHTML = `
          <svg width="180" height="180" viewBox="0 0 100 100" fill="#0E1126">
            <rect width="100" height="100" fill="#FFFFFF"/>
            <rect x="10" y="10" width="25" height="25" fill="#0E1126"/>
            <rect x="15" y="15" width="15" height="15" fill="#FFFFFF"/>
            <rect x="65" y="10" width="25" height="25" fill="#0E1126"/>
            <rect x="70" y="15" width="15" height="15" fill="#FFFFFF"/>
            <rect x="10" y="65" width="25" height="25" fill="#0E1126"/>
            <rect x="15" y="70" width="15" height="15" fill="#FFFFFF"/>
            <rect x="45" y="15" width="10" height="10" fill="#0E1126"/>
            <rect x="40" y="40" width="20" height="20" fill="#0E1126"/>
            <rect x="65" y="55" width="15" height="10" fill="#0E1126"/>
            <rect x="45" y="75" width="20" height="15" fill="#0E1126"/>
            <rect x="75" y="75" width="15" height="15" fill="#0E1126"/>
          </svg>
        `;
      }
    }

    // Render Banks
    renderBanksList(settings.banks || []);

    // Render E-Wallets
    renderEwalletsList(settings.ewallets || []);
  }

  function renderBanksList(banks) {
    const container = document.getElementById('bank-accounts-list');
    if (!container) return;

    container.innerHTML = banks.map(b => {
      const badgeClass = `bank-${b.code || 'custom'}`;
      return `
        <div class="bank-card-item ${b.active ? '' : 'inactive'}">
          <div>
            <div class="bank-card-header">
              <span class="bank-logo-badge ${badgeClass}">${b.name}</span>
              <label style="position: relative; display: inline-block; width: 36px; height: 18px; cursor: pointer;">
                <input type="checkbox" class="toggle-bank-active" data-id="${b.id}" ${b.active ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                <span style="position: absolute; inset: 0; background-color: ${b.active ? '#10B981' : '#CBD5E1'}; border-radius: 20px; transition: 0.2s;">
                  <span style="position: absolute; left: ${b.active ? '19px' : '2px'}; top: 2px; width: 14px; height: 14px; background: white; border-radius: 50%; transition: 0.2s;"></span>
                </span>
              </label>
            </div>
            <div class="bank-card-accno">${b.accNo}</div>
            <div class="bank-card-accname">a.n. ${b.accName}</div>
          </div>
          <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid #F1F5F9; padding-top: 10px;">
            <button type="button" class="btn-icon-square btn-edit-bank" data-id="${b.id}" title="Edit Rekening">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button type="button" class="btn-icon-square danger btn-delete-bank" data-id="${b.id}" title="Hapus Rekening">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.toggle-bank-active').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const settings = getSettings();
        const target = settings.banks.find(x => x.id === e.target.dataset.id);
        if (target) {
          target.active = e.target.checked;
          saveSettings(settings);
          renderBanksList(settings.banks);
          showToast(`Status rekening ${target.name} diubah.`);
        }
      });
    });

    container.querySelectorAll('.btn-edit-bank').forEach(btn => {
      btn.addEventListener('click', () => openBankModal(btn.dataset.id));
    });

    container.querySelectorAll('.btn-delete-bank').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('Hapus rekening bank ini?')) return;
        const settings = getSettings();
        settings.banks = settings.banks.filter(x => x.id !== btn.dataset.id);
        saveSettings(settings);
        renderBanksList(settings.banks);
        showToast('Rekening bank berhasil dihapus.');
      });
    });
  }

  function renderEwalletsList(ewallets) {
    const container = document.getElementById('ewallet-accounts-list');
    if (!container) return;

    container.innerHTML = ewallets.map(w => {
      return `
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-weight: 700; color: #0F172A; font-size: 14px;">${w.name}</div>
            <div style="font-family: var(--font-mono); font-weight: 600; color: #4F46E5; font-size: 13.5px;">${w.accNo}</div>
            <div style="font-size: 12px; color: #64748B;">a.n. ${w.accName}</div>
          </div>
          <button type="button" class="btn-icon-square btn-edit-ewallet" data-id="${w.id}" title="Edit E-Wallet">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-edit-ewallet').forEach(btn => {
      btn.addEventListener('click', () => openEwalletModal(btn.dataset.id));
    });
  }

  function initPaymentControls() {
    const formQris = document.getElementById('form-qris-settings');
    const dropzone = document.getElementById('qris-dropzone');
    const fileInput = document.getElementById('qris-file-input');
    const btnClearQris = document.getElementById('btn-clear-qris-image');
    const btnAddBank = document.getElementById('btn-add-bank');

    // QRIS Image File Upload
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          processQrisFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          processQrisFile(e.target.files[0]);
        }
      });
    }

    function processQrisFile(file) {
      if (!file.type.startsWith('image/')) {
        alert('Silakan pilih file gambar yang valid (PNG, JPG, JPEG).');
        return;
      }
      const reader = new FileReader();
      reader.onload = function (evt) {
        const base64 = evt.target.result;
        const settings = getSettings();
        settings.qrisImage = base64;
        saveSettings(settings);
        renderPaymentSettings();
        showToast('Foto QRIS berhasil diunggah dan disimpan!');
      };
      reader.readAsDataURL(file);
    }

    if (btnClearQris) {
      btnClearQris.addEventListener('click', () => {
        if (confirm('Gunakan kembali template QRIS bawaan Jogatix?')) {
          const settings = getSettings();
          settings.qrisImage = '';
          saveSettings(settings);
          renderPaymentSettings();
          showToast('Foto QRIS di-reset ke template standar.');
        }
      });
    }

    if (formQris) {
      formQris.addEventListener('submit', (e) => {
        e.preventDefault();
        const settings = getSettings();
        settings.qrisActive = document.getElementById('setting-qris-active').checked;
        settings.qrisMerchant = document.getElementById('setting-qris-merchant').value.trim();
        settings.qrisNmid = document.getElementById('setting-qris-nmid').value.trim();
        settings.qrisInstructions = document.getElementById('setting-qris-instructions').value.trim();
        settings.adminFeeBill = Number(document.getElementById('setting-admin-fee').value) || 2500;

        saveSettings(settings);
        renderPaymentSettings();
        showToast('Pengaturan pembayaran & QRIS berhasil disimpan!');
      });
    }

    if (btnAddBank) {
      btnAddBank.addEventListener('click', () => openBankModal(null));
    }
  }

  // Bank Account Modal
  function openBankModal(bankId) {
    const modal = document.getElementById('modal-bank');
    const form = document.getElementById('form-bank-edit');
    const title = document.getElementById('modal-bank-title');
    const hiddenId = document.getElementById('bank-input-id');
    const inputName = document.getElementById('bank-input-name');
    const inputAccNo = document.getElementById('bank-input-accno');
    const inputAccName = document.getElementById('bank-input-accname');

    if (!modal || !form) return;

    if (bankId) {
      const settings = getSettings();
      const b = (settings.banks || []).find(x => x.id === bankId);
      if (!b) return;
      title.textContent = 'Edit Rekening Bank';
      hiddenId.value = b.id;
      inputName.value = b.name;
      inputAccNo.value = b.accNo;
      inputAccName.value = b.accName;
    } else {
      title.textContent = 'Tambah Rekening Bank';
      form.reset();
      hiddenId.value = '';
    }

    modal.classList.add('active');
  }

  function saveBankForm(e) {
    e.preventDefault();
    const hiddenId = document.getElementById('bank-input-id').value;
    const name = document.getElementById('bank-input-name').value.trim();
    const accNo = document.getElementById('bank-input-accno').value.trim();
    const accName = document.getElementById('bank-input-accname').value.trim();

    if (!name || !accNo || !accName) {
      alert('Mohon lengkapi seluruh kolom rekening bank.');
      return;
    }

    const settings = getSettings();
    if (!settings.banks) settings.banks = [];

    if (hiddenId) {
      const b = settings.banks.find(x => x.id === hiddenId);
      if (b) {
        b.name = name;
        b.accNo = accNo;
        b.accName = accName;
      }
    } else {
      const newId = 'bank-' + Date.now().toString().slice(-5);
      const code = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      settings.banks.push({
        id: newId,
        code: code,
        name: name,
        accNo: accNo,
        accName: accName,
        active: true
      });
    }

    saveSettings(settings);
    renderBanksList(settings.banks);
    closeAllModals();
    showToast('Data rekening bank berhasil disimpan!');
  }

  // E-Wallet Modal
  function openEwalletModal(ewalletId) {
    const modal = document.getElementById('modal-ewallet');
    const form = document.getElementById('form-ewallet-edit');
    const hiddenId = document.getElementById('ewallet-input-id');
    const inputName = document.getElementById('ewallet-input-name');
    const inputAccNo = document.getElementById('ewallet-input-accno');
    const inputAccName = document.getElementById('ewallet-input-accname');

    if (!modal || !form) return;

    const settings = getSettings();
    const w = (settings.ewallets || []).find(x => x.id === ewalletId);
    if (!w) return;

    hiddenId.value = w.id;
    inputName.value = w.name;
    inputAccNo.value = w.accNo;
    inputAccName.value = w.accName;

    modal.classList.add('active');
  }

  function saveEwalletForm(e) {
    e.preventDefault();
    const hiddenId = document.getElementById('ewallet-input-id').value;
    const accNo = document.getElementById('ewallet-input-accno').value.trim();
    const accName = document.getElementById('ewallet-input-accname').value.trim();

    const settings = getSettings();
    const w = (settings.ewallets || []).find(x => x.id === hiddenId);
    if (w) {
      w.accNo = accNo;
      w.accName = accName;
      saveSettings(settings);
      renderEwalletsList(settings.ewallets);
      closeAllModals();
      showToast(`Nomor akun ${w.name} berhasil diperbarui!`);
    }
  }

  // --- View 4: Pengaturan WhatsApp ---
  function renderWhatsAppSettings() {
    const settings = getSettings();

    const numInput = document.getElementById('setting-wa-number');
    const nameInput = document.getElementById('setting-wa-name');
    const hoursInput = document.getElementById('setting-wa-hours');
    const tplOrderInput = document.getElementById('setting-wa-tpl-order');
    const tplSuccessInput = document.getElementById('setting-wa-tpl-success');
    const previewNum = document.getElementById('preview-wa-num');

    if (numInput) numInput.value = settings.whatsappNumber || '081234567890';
    if (nameInput) nameInput.value = settings.whatsappAdminName || 'Customer Care Jogatix';
    if (hoursInput) hoursInput.value = settings.whatsappHours || '07:00 - 23:00 WIB Setiap Hari';
    if (tplOrderInput) tplOrderInput.value = settings.whatsappTemplateOrder || '';
    if (tplSuccessInput) tplSuccessInput.value = settings.whatsappTemplateSuccess || '';
    if (previewNum) previewNum.textContent = settings.whatsappNumber || '081234567890';
  }

  function initWhatsAppControls() {
    const form = document.getElementById('form-whatsapp-settings');
    const btnTestWa = document.getElementById('btn-test-wa');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const settings = getSettings();
        settings.whatsappNumber = document.getElementById('setting-wa-number').value.trim();
        settings.whatsappAdminName = document.getElementById('setting-wa-name').value.trim();
        settings.whatsappHours = document.getElementById('setting-wa-hours').value.trim();
        settings.whatsappTemplateOrder = document.getElementById('setting-wa-tpl-order').value.trim();
        settings.whatsappTemplateSuccess = document.getElementById('setting-wa-tpl-success').value.trim();

        saveSettings(settings);
        renderWhatsAppSettings();
        showToast('Pengaturan nomor WhatsApp & template berhasil disimpan!');
      });
    }

    if (btnTestWa) {
      btnTestWa.addEventListener('click', () => {
        const num = document.getElementById('setting-wa-number').value.trim().replace(/[^0-9]/g, '');
        let cleanNum = num;
        if (cleanNum.startsWith('0')) cleanNum = '62' + cleanNum.slice(1);
        const testMsg = encodeURIComponent('Halo Admin Jogatix, ini pesan uji coba koneksi WhatsApp dari Dashboard Admin.');
        window.open(`https://wa.me/${cleanNum}?text=${testMsg}`, '_blank');
      });
    }
  }

  // --- View 5: Kelola Transaksi (Transaction Center) ---
  let txFilterStatus = 'all';
  let txSearchQuery = '';

  function renderTransactionsTable() {
    const orders = getOrders();
    const orderList = Object.values(orders);
    const tbody = document.getElementById('transactions-table-body');
    const countLabel = document.getElementById('tx-filter-count-label');

    if (!tbody) return;

    let filtered = orderList.filter(o => {
      const status = (o.status || '').toUpperCase();
      const matchStatus = (txFilterStatus === 'all' || status === txFilterStatus);
      const search = txSearchQuery.toLowerCase();
      const matchSearch = !search ||
        (o.id && o.id.toLowerCase().includes(search)) ||
        (o.customer && o.customer.toLowerCase().includes(search)) ||
        (o.product && o.product.toLowerCase().includes(search)) ||
        (o.provider && o.provider.toLowerCase().includes(search));
      return matchStatus && matchSearch;
    });

    if (countLabel) {
      countLabel.textContent = `Menampilkan ${filtered.length} dari ${orderList.length} transaksi`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #94A3B8; padding: 32px;">Tidak ada transaksi yang cocok dengan filter atau pencarian.</td></tr>`;
      return;
    }

    // Sort newest first
    filtered.sort((a, b) => (b.id || '').localeCompare(a.id || ''));

    tbody.innerHTML = filtered.map(o => {
      let badgeClass = 'waiting';
      let statusText = 'Menunggu';
      if (o.status === 'SUCCESS') { badgeClass = 'success'; statusText = 'Berhasil'; }
      else if (o.status === 'PENDING') { badgeClass = 'pending'; statusText = 'Diproses'; }
      else if (o.status === 'FAILED') { badgeClass = 'failed'; statusText = 'Gagal'; }

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="tx-id-badge">${o.id}</span>
            </div>
            <div style="font-size: 11px; color: #94A3B8; margin-top: 3px;">${o.createdAt || '-'}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: #0F172A; font-size: 13.5px;">${o.product || o.category}</div>
            <div style="font-size: 12px; color: #64748B;">${o.provider ? 'Provider: ' + o.provider : (o.category || '-')}</div>
          </td>
          <td>
            <div style="font-family: var(--font-mono); font-weight: 600; color: #334155;">${o.customer || '-'}</div>
          </td>
          <td>
            <div style="font-weight: 800; color: #0F172A;">${formatRupiah(o.total)}</div>
            <div style="font-size: 11px; color: #94A3B8;">${o.paymentMethod || 'QRIS'}</div>
          </td>
          <td>
            <span class="status-pill-admin ${badgeClass}">
              <span class="status-dot-sm"></span>
              ${statusText}
            </span>
          </td>
          <td>
            ${o.sn ? `<span class="tx-sn-code">${o.sn}</span>` : '<span style="color: #CBD5E1; font-size: 12px;">Belum ada SN</span>'}
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn-icon-square btn-tx-detail" data-id="${o.id}" title="Ubah Status & Detail">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button type="button" class="btn-icon-square btn-tx-wa" data-id="${o.id}" title="Chat WA Pembeli">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </button>
              <button type="button" class="btn-icon-square danger btn-tx-delete" data-id="${o.id}" title="Hapus Transaksi">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-tx-detail').forEach(btn => {
      btn.addEventListener('click', () => openTransactionModal(btn.dataset.id));
    });

    tbody.querySelectorAll('.btn-tx-wa').forEach(btn => {
      btn.addEventListener('click', () => chatCustomerWhatsApp(btn.dataset.id));
    });

    tbody.querySelectorAll('.btn-tx-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteTransaction(btn.dataset.id));
    });
  }

  function initTransactionControls() {
    const searchInput = document.getElementById('search-transactions-input');
    const filterTabs = document.querySelectorAll('.filter-tab-btn[data-status]');
    const btnAddManual = document.getElementById('btn-add-manual-tx');
    const btnExportTx = document.getElementById('btn-export-tx');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        txSearchQuery = e.target.value.trim();
        renderTransactionsTable();
      });
    }

    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        txFilterStatus = tab.dataset.status;
        renderTransactionsTable();
      });
    });

    if (btnAddManual) {
      btnAddManual.addEventListener('click', () => openManualTransactionModal());
    }

    if (btnExportTx) {
      btnExportTx.addEventListener('click', () => exportTransactionsJSON());
    }
  }

  // Transaction Detail & Status Edit Modal
  function openTransactionModal(orderId) {
    const modal = document.getElementById('modal-transaction');
    const orders = getOrders();
    const o = orders[orderId];
    if (!modal || !o) return;

    document.getElementById('modal-tx-id').textContent = o.id;
    document.getElementById('tx-detail-hidden-id').value = o.id;
    document.getElementById('tx-detail-category').textContent = o.category || '-';
    document.getElementById('tx-detail-provider').textContent = o.provider || '-';
    document.getElementById('tx-detail-product').textContent = o.product || '-';
    document.getElementById('tx-detail-customer').textContent = o.customer || '-';
    document.getElementById('tx-detail-total').textContent = formatRupiah(o.total);
    document.getElementById('tx-detail-payment').textContent = o.paymentMethod || 'QRIS';
    document.getElementById('tx-detail-date').textContent = o.createdAt || '-';

    // Editable fields
    document.getElementById('tx-edit-status').value = (o.status || 'SUCCESS').toUpperCase();
    document.getElementById('tx-edit-sn').value = o.sn || '';
    document.getElementById('tx-edit-msg').value = o.systemMessage || '';

    // Direct WhatsApp Button inside modal
    const btnWaModal = document.getElementById('btn-tx-modal-wa');
    if (btnWaModal) {
      btnWaModal.onclick = () => chatCustomerWhatsApp(o.id);
    }

    modal.classList.add('active');
  }

  function saveTransactionForm(e) {
    e.preventDefault();
    const orderId = document.getElementById('tx-detail-hidden-id').value;
    const newStatus = document.getElementById('tx-edit-status').value;
    const newSn = document.getElementById('tx-edit-sn').value.trim();
    const newMsg = document.getElementById('tx-edit-msg').value.trim();

    const orders = getOrders();
    const o = orders[orderId];
    if (o) {
      o.status = newStatus;
      o.sn = newSn;
      o.systemMessage = newMsg;

      const labels = {
        'SUCCESS': 'Berhasil Dikonfirmasi',
        'PENDING': 'Sedang Diproses',
        'WAITING': 'Menunggu Pembayaran',
        'FAILED': 'Transaksi Gagal'
      };
      o.statusLabel = labels[newStatus] || newStatus;

      saveOrders(orders);
      renderTransactionsTable();
      renderOverview();
      closeAllModals();
      showToast(`Status transaksi ${orderId} berhasil diperbarui menjadi ${newStatus}!`);
    }
  }

  function chatCustomerWhatsApp(orderId) {
    const orders = getOrders();
    const o = orders[orderId];
    const settings = getSettings();
    if (!o || !o.customer) {
      alert('Nomor pelanggan tidak tersedia untuk transaksi ini.');
      return;
    }

    let phone = o.customer.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);

    let template = (o.status === 'SUCCESS')
      ? settings.whatsappTemplateSuccess
      : 'Halo Kak, konfirmasi pesanan Jogatix ID {id} untuk {produk} status: {status}. Nominal: {total}. Hubungi kami jika ada pertanyaan.';

    let msg = template
      .replace(/{id}/g, o.id)
      .replace(/{produk}/g, o.product || o.category)
      .replace(/{total}/g, formatRupiah(o.total))
      .replace(/{customer}/g, o.customer)
      .replace(/{pembeli}/g, o.customer)
      .replace(/{sn}/g, o.sn || '-')
      .replace(/{status}/g, o.statusLabel || o.status);

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  function deleteTransaction(orderId) {
    if (!confirm(`Apakah Anda yakin ingin menghapus transaksi ${orderId}? Tindakan ini tidak dapat dibatalkan.`)) return;
    const orders = getOrders();
    delete orders[orderId];
    saveOrders(orders);
    renderTransactionsTable();
    renderOverview();
    showToast(`Transaksi ${orderId} telah dihapus.`);
  }

  // Manual Transaction Modal
  function openManualTransactionModal() {
    const modal = document.getElementById('modal-manual-tx');
    const form = document.getElementById('form-manual-tx');
    if (!modal || !form) return;
    form.reset();
    modal.classList.add('active');
  }

  function saveManualTransaction(e) {
    e.preventDefault();
    const cat = document.getElementById('manual-tx-cat').value;
    const prov = document.getElementById('manual-tx-provider').value.trim();
    const prod = document.getElementById('manual-tx-product').value.trim();
    const cust = document.getElementById('manual-tx-cust').value.trim();
    const price = Number(document.getElementById('manual-tx-price').value) || 0;
    const method = document.getElementById('manual-tx-method').value;
    const status = document.getElementById('manual-tx-status').value;
    const sn = document.getElementById('manual-tx-sn').value.trim();

    if (!prod || !cust || price <= 0) {
      alert('Mohon lengkapi produk, nomor pelanggan, dan nominal harga.');
      return;
    }

    const orderId = 'JGX-' + Math.floor(1000000 + Math.random() * 9000000);
    const orders = getOrders();

    orders[orderId] = {
      id: orderId,
      category: cat,
      categorySlug: cat.toLowerCase().replace(/[^a-z]/g, '-'),
      provider: prov,
      product: (prov ? prov + ' — ' : '') + prod,
      customer: cust,
      createdAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      paymentMethod: method,
      total: price,
      totalFormatted: formatRupiah(price),
      sn: sn || ('TRX-' + (prov || 'JGX').toUpperCase().slice(0, 5) + '-' + Date.now().toString().slice(-6)),
      status: status,
      statusLabel: status === 'SUCCESS' ? 'Berhasil Dikonfirmasi' : (status === 'PENDING' ? 'Sedang Diproses' : 'Menunggu Pembayaran'),
      systemMessage: 'Transaksi manual dicatat oleh Administrator Jogatix.'
    };

    saveOrders(orders);
    renderTransactionsTable();
    renderOverview();
    closeAllModals();
    showToast(`Transaksi manual ${orderId} berhasil dibuat!`);
  }

  function exportTransactionsJSON() {
    const orders = getOrders();
    const jsonStr = JSON.stringify(orders, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jogatix-transaksi-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File rekapan transaksi berhasil diunduh!');
  }

  // --- Modal Utilities ---
  function closeAllModals() {
    document.querySelectorAll('.admin-modal-backdrop').forEach(m => m.classList.remove('active'));
  }

  function initModals() {
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', closeAllModals);
    });

    document.querySelectorAll('.admin-modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeAllModals();
      });
    });

    // Form Submissions
    const formProd = document.getElementById('form-product-edit');
    if (formProd) formProd.addEventListener('submit', saveProductForm);

    const formBank = document.getElementById('form-bank-edit');
    if (formBank) formBank.addEventListener('submit', saveBankForm);

    const formEwallet = document.getElementById('form-ewallet-edit');
    if (formEwallet) formEwallet.addEventListener('submit', saveEwalletForm);

    const formTx = document.getElementById('form-tx-detail-edit');
    if (formTx) formTx.addEventListener('submit', saveTransactionForm);

    const formManual = document.getElementById('form-manual-tx');
    if (formManual) formManual.addEventListener('submit', saveManualTransaction);
  }

  // --- Global Initializer ---
  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initProductControls();
    initPaymentControls();
    initWhatsAppControls();
    initTransactionControls();
    initModals();
    renderOverview();
  });

})();
