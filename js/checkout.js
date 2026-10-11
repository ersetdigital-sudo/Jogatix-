/* Jogatix — Checkout & Transaction Flow Engine
   Handles 5-Stage Transaction:
   1. Data Pelanggan & Pemilihan Provider Resmi (GoPay, OVO, DANA, ShopeePay, LinkAja, Telkomsel, dll.)
   2. Pilih Produk / Nominal
   3. Ringkasan Pesanan
   4. Pembayaran (QRIS, VA, E-Wallet)
   5. Pemrosesan & Hasil Sukses dengan Serial Number (SN)
*/
(function () {
  'use strict';

  const C = window.JogatixCatalog;
  if (!C) return;

  // Read URL query parameters
  const params = new URLSearchParams(window.location.search);
  let currentCatSlug = params.get('kategori') || 'pulsa';
  let initialCust = params.get('cust') || params.get('customer') || '';
  let initialProdId = params.get('produk') || '';
  let initialProvider = params.get('provider') || '';

  let currentCategory = C.get(currentCatSlug) || C.categories[0];
  let currentCustomer = initialCust;
  let selectedProvider = '';
  let selectedProduct = null;
  let currentStage = 1;
  let createdOrder = null;
  let selectedPaymentMethod = 'qris';

  // Initialize selectedProvider
  if (currentCategory.providers && currentCategory.providers.length > 0) {
    if (initialProvider) {
      const match = currentCategory.providers.find(p => p.toLowerCase() === initialProvider.toLowerCase());
      selectedProvider = match || currentCategory.providers[0];
    } else {
      selectedProvider = currentCategory.providers[0];
    }
  }

  // DOM Elements
  const steppers = [
    document.getElementById('stepper-1'),
    document.getElementById('stepper-2'),
    document.getElementById('stepper-3'),
    document.getElementById('stepper-4'),
    document.getElementById('stepper-5')
  ];

  const panes = [
    document.getElementById('stage-1-pane'),
    document.getElementById('stage-2-pane'),
    document.getElementById('stage-3-pane'),
    document.getElementById('stage-4-pane'),
    document.getElementById('stage-5-pane')
  ];

  if (!panes[0]) return; // Not on checkout page

  // Stage 1 elements
  const catButtons = document.querySelectorAll('.cat-select-btn');
  const providerSection = document.getElementById('checkout-provider-section');
  const providerLabel = document.getElementById('checkout-provider-label');
  const providerChips = document.getElementById('checkout-provider-chips');
  const providerError = document.getElementById('checkout-provider-error');
  const custLabel = document.getElementById('customer-id-label');
  const custInput = document.getElementById('customer-id-input');
  const custError = document.getElementById('customer-id-error');
  const btnStage1Next = document.getElementById('btn-stage1-next');

  // Stage 2 elements
  const stage2ProviderBar = document.getElementById('stage-2-provider-bar');
  const stage2ProviderName = document.getElementById('stage2-provider-name');
  const btnChangeProvider = document.getElementById('btn-change-provider');
  const productsList = document.getElementById('checkout-products-list');
  const stage2Error = document.getElementById('stage-2-error');
  const btnStage2Back = document.getElementById('btn-stage2-back');
  const btnStage2Next = document.getElementById('btn-stage2-next');

  // Stage 3 elements
  const sumCat = document.getElementById('summary-category-val');
  const sumProviderRow = document.getElementById('summary-provider-row');
  const sumProviderLabel = document.getElementById('summary-provider-label');
  const sumProviderVal = document.getElementById('summary-provider-val');
  const sumCust = document.getElementById('summary-cust-id-val');
  const sumProd = document.getElementById('summary-product-val');
  const sumPrice = document.getElementById('summary-price-val');
  const sumAdmin = document.getElementById('summary-admin-val');
  const sumTotal = document.getElementById('summary-total-val');
  const btnStage3Back = document.getElementById('btn-stage3-back');
  const btnStage3Next = document.getElementById('btn-stage3-next');

  // Stage 4 elements
  const payTotal = document.getElementById('payment-total-val');
  const payCards = document.querySelectorAll('.payment-method-card');
  const payInstructions = document.getElementById('payment-instructions-wrap');
  const btnStage4Check = document.getElementById('btn-stage4-check-payment');

  // Stage 5 elements
  const procState = document.getElementById('stage5-processing-state');
  const successState = document.getElementById('stage5-success-state');
  const finalTxId = document.getElementById('final-tx-id');
  const finalProviderRow = document.getElementById('final-provider-row');
  const finalProviderLabel = document.getElementById('final-provider-label');
  const finalProviderVal = document.getElementById('final-provider-val');
  const finalProdName = document.getElementById('final-product-name');
  const finalCustId = document.getElementById('final-cust-id');
  const finalSnBox = document.getElementById('final-sn-box');
  const finalSnVal = document.getElementById('final-sn-val');
  const btnTracker = document.getElementById('btn-view-in-tracker');

  // --- Helper Functions ---
  function setStage(stageNum) {
    currentStage = stageNum;

    // Update steppers
    steppers.forEach((el, idx) => {
      if (!el) return;
      el.classList.remove('active', 'done');
      if (idx + 1 === stageNum) {
        el.classList.add('active');
      } else if (idx + 1 < stageNum) {
        el.classList.add('done');
      }
    });

    // Update panes
    panes.forEach((pane, idx) => {
      if (!pane) return;
      if (idx + 1 === stageNum) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Stage 1: Category & Customer Data ---
  function renderProviderChips() {
    if (!providerSection || !providerChips) return;

    if (currentCategory.providers && currentCategory.providers.length > 0) {
      providerSection.style.display = 'block';
      if (providerLabel) {
        providerLabel.textContent = currentCategory.slug === 'uang-elektronik'
          ? 'Pilih Dompet Digital / E-Wallet'
          : 'Pilih Operator / Penyedia Resmi';
      }

      // Check if selectedProvider belongs to currentCategory
      const exists = currentCategory.providers.some(p => p.toLowerCase() === (selectedProvider || '').toLowerCase());
      if (!exists) {
        selectedProvider = currentCategory.providers[0];
      }

      providerChips.innerHTML = '';
      currentCategory.providers.forEach(prov => {
        const isAct = prov.toLowerCase() === selectedProvider.toLowerCase();
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'provider-chip-btn' + (isAct ? ' active' : '');
        btn.dataset.provider = prov;
        btn.textContent = prov;

        btn.addEventListener('click', () => {
          providerChips.querySelectorAll('.provider-chip-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          selectedProvider = prov;
          if (providerError) providerError.textContent = '';
        });

        providerChips.appendChild(btn);
      });
    } else {
      providerSection.style.display = 'none';
      selectedProvider = '';
    }
  }

  function initStage1() {
    catButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        catButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const catSlug = btn.dataset.cat;
        currentCategory = C.get(catSlug) || C.categories[0];
        selectedProduct = null;

        if (currentCategory.providers && currentCategory.providers.length > 0) {
          selectedProvider = currentCategory.providers[0];
        } else {
          selectedProvider = '';
        }

        updateStage1Labels();
        renderProviderChips();
      });
    });

    // Set active button based on currentCategory
    catButtons.forEach(btn => {
      if (btn.dataset.cat === currentCategory.slug) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    updateStage1Labels();
    renderProviderChips();

    if (custInput && initialCust) {
      custInput.value = initialCust;
    }

    if (btnStage1Next) {
      btnStage1Next.addEventListener('click', () => {
        const val = custInput ? custInput.value.trim().replace(/[\s-]/g, '') : '';
        if (!val) {
          custError.textContent = 'Silakan masukkan ' + currentCategory.field.label.toLowerCase() + '.';
          custInput && custInput.focus();
          return;
        }

        if (currentCategory.field.pattern && !currentCategory.field.pattern.test(val)) {
          custError.textContent = currentCategory.field.error;
          custInput && custInput.focus();
          return;
        }

        if (currentCategory.providers && currentCategory.providers.length > 0 && !selectedProvider) {
          if (providerError) providerError.textContent = 'Silakan pilih provider terlebih dahulu.';
          return;
        }

        custError.textContent = '';
        if (providerError) providerError.textContent = '';
        currentCustomer = val;
        renderStage2();
        setStage(2);
      });
    }
  }

  function updateStage1Labels() {
    if (custLabel) custLabel.textContent = currentCategory.field.label;
    if (custInput) {
      custInput.placeholder = currentCategory.field.placeholder;
      custInput.setAttribute('inputmode', currentCategory.field.inputmode || 'text');
    }
    if (custError) custError.textContent = '';
    if (providerError) providerError.textContent = '';
  }

  // --- Stage 2: Product Selection ---
  function renderStage2() {
    if (!productsList) return;
    productsList.innerHTML = '';
    stage2Error.textContent = '';

    // Show provider reminder bar in stage 2
    if (stage2ProviderBar && stage2ProviderName) {
      if (selectedProvider) {
        stage2ProviderBar.style.display = 'flex';
        stage2ProviderName.textContent = selectedProvider;
      } else {
        stage2ProviderBar.style.display = 'none';
      }
    }

    if (currentCategory.type === C.PREPAID && currentCategory.products) {
      currentCategory.products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card-item' + (selectedProduct && selectedProduct.id === p.id ? ' selected' : '');
        card.dataset.id = p.id;

        const badgeHtml = selectedProvider ? `<div class="product-provider-badge">${selectedProvider}</div>` : '';
        const displayName = (selectedProvider && currentCategory.slug === 'uang-elektronik')
          ? `${selectedProvider} ${p.name}`
          : p.name;

        card.innerHTML = `
          ${badgeHtml}
          <div class="product-name-txt">${displayName}</div>
          <div class="product-note-txt">${p.note || ''}</div>
          <div class="product-price-txt">${C.rupiah(p.price)}</div>
        `;
        card.addEventListener('click', () => {
          productsList.querySelectorAll('.product-card-item').forEach(el => el.classList.remove('selected'));
          card.classList.add('selected');
          selectedProduct = p;
          stage2Error.textContent = '';
        });
        productsList.appendChild(card);
      });

      // If initial product was requested, auto-select it
      if (initialProdId && !selectedProduct) {
        const match = currentCategory.products.find(p => p.id === initialProdId);
        if (match) {
          selectedProduct = match;
          const matchCard = productsList.querySelector(`[data-id="${initialProdId}"]`);
          if (matchCard) matchCard.classList.add('selected');
        }
      }
    } else {
      // Bill Inquiry Mode
      const billAmount = 145000; // Realistic bill amount
      selectedProduct = {
        id: 'bill-' + currentCategory.slug,
        name: 'Tagihan ' + currentCategory.name,
        price: billAmount,
        adminFee: currentCategory.adminFee || 2500,
        isBill: true
      };
      productsList.innerHTML = `
        <div style="grid-column: 1 / -1; background: #EEF2FF; border: 1.5px solid #C7D2FE; border-radius: 12px; padding: 22px; color: #1E1B4B;">
          <div style="font-weight: 700; font-size: 16px; margin-bottom: 6px;">Tagihan Ditemukan</div>
          <div style="font-size: 14px; color: #4338CA; margin-bottom: 14px;">Nomor Pelanggan: <b>${currentCustomer}</b> (${currentCategory.name})</div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #C7D2FE; font-size: 14px;">
            <span>Jumlah Tagihan:</span>
            <b>${C.rupiah(billAmount)}</b>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #C7D2FE; font-size: 14px;">
            <span>Biaya Administrasi:</span>
            <b>${C.rupiah(currentCategory.adminFee || 2500)}</b>
          </div>
        </div>
      `;
    }
  }

  if (btnChangeProvider) {
    btnChangeProvider.addEventListener('click', () => {
      setStage(1);
      if (providerSection) {
        providerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  if (btnStage2Back) {
    btnStage2Back.addEventListener('click', () => setStage(1));
  }

  if (btnStage2Next) {
    btnStage2Next.addEventListener('click', () => {
      if (!selectedProduct) {
        stage2Error.textContent = 'Pilih salah satu produk atau nominal terlebih dahulu.';
        return;
      }
      renderStage3();
      setStage(3);
    });
  }

  // --- Stage 3: Order Summary ---
  function renderStage3() {
    if (!selectedProduct) return;
    const admin = selectedProduct.isBill ? (currentCategory.adminFee || 2500) : 0;
    const total = selectedProduct.price + admin;

    if (sumCat) sumCat.textContent = currentCategory.name;

    if (sumProviderRow && sumProviderVal) {
      if (selectedProvider) {
        sumProviderRow.style.display = 'flex';
        if (sumProviderLabel) {
          sumProviderLabel.textContent = currentCategory.slug === 'uang-elektronik'
            ? 'Penyedia / Dompet Digital'
            : 'Penyedia / Operator';
        }
        sumProviderVal.textContent = selectedProvider;
      } else {
        sumProviderRow.style.display = 'none';
      }
    }

    if (sumCust) sumCust.textContent = currentCustomer;

    const prodDisplayTitle = (selectedProvider ? selectedProvider + ' — ' : '') + selectedProduct.name;
    if (sumProd) sumProd.textContent = prodDisplayTitle;

    if (sumPrice) sumPrice.textContent = C.rupiah(selectedProduct.price);
    if (sumAdmin) sumAdmin.textContent = admin ? C.rupiah(admin) : 'Rp 0 (Termasuk)';
    if (sumTotal) sumTotal.textContent = C.rupiah(total);
  }

  if (btnStage3Back) {
    btnStage3Back.addEventListener('click', () => setStage(2));
  }

  if (btnStage3Next) {
    btnStage3Next.addEventListener('click', () => {
      createOrder();
      renderStage4();
      setStage(4);
    });
  }

  // Generate realistic order ID
  function generateOrderId() {
    const chars = '0123456789';
    let code = '';
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return 'JGX-' + code;
  }

  // Generate realistic serial number (SN) with provider tag
  function generateSN(prov) {
    const stamp = Date.now().toString().slice(-7);
    if (prov) {
      const cleanP = prov.toUpperCase().replace(/[^A-Z0-9]/g, '');
      return 'TRX-' + cleanP + '-' + stamp;
    }
    return 'SN' + Date.now().toString().slice(-8) + '0928';
  }

  function createOrder() {
    const admin = selectedProduct.isBill ? (currentCategory.adminFee || 2500) : 0;
    const total = selectedProduct.price + admin;
    const orderId = generateOrderId();
    const fullProdTitle = (selectedProvider ? selectedProvider + ' — ' : '') + selectedProduct.name;

    createdOrder = {
      id: orderId,
      category: currentCategory.name,
      categorySlug: currentCategory.slug,
      provider: selectedProvider || '',
      product: fullProdTitle,
      productRawName: selectedProduct.name,
      customer: currentCustomer,
      total: total,
      totalFormatted: C.rupiah(total),
      paymentMethod: selectedPaymentMethod.toUpperCase(),
      createdAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      sn: generateSN(selectedProvider),
      status: 'SUCCESS'
    };

    // Save to localStorage for tracker access
    try {
      const orders = JSON.parse(localStorage.getItem('jogatix_orders') || '{}');
      orders[orderId] = createdOrder;
      localStorage.setItem('jogatix_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Storage warning', e);
    }
  }

  // --- Stage 4: Payment ---
  function renderStage4() {
    if (!createdOrder) return;
    if (payTotal) payTotal.textContent = createdOrder.totalFormatted;

    payCards.forEach(card => {
      card.addEventListener('click', () => {
        payCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedPaymentMethod = card.dataset.method;
        updatePaymentInstructions();
      });
    });

    updatePaymentInstructions();
  }

  function getAdminSettings() {
    try {
      const s = localStorage.getItem('jogatix_admin_settings');
      if (s) return JSON.parse(s);
    } catch (e) {}
    return {
      whatsappNumber: '081234567890',
      qrisMerchant: 'JOGATIX DIGITAL COMMERCE',
      qrisNmid: 'ID1020039102910',
      qrisImage: '',
      banks: [
        { name: 'BCA', accNo: '8901289104', accName: 'JOGATIX INDONESIA', active: true },
        { name: 'Mandiri', accNo: '1370019284019', accName: 'JOGATIX INDONESIA', active: true },
        { name: 'BRI', accNo: '020601002948301', accName: 'JOGATIX INDONESIA', active: true }
      ]
    };
  }

  function updatePaymentInstructions() {
    if (!payInstructions || !createdOrder) return;
    const adminSettings = getAdminSettings();
    let waPhone = (adminSettings.whatsappNumber || '081234567890').replace(/[^0-9]/g, '');
    if (waPhone.startsWith('0')) waPhone = '62' + waPhone.slice(1);
    const waText = encodeURIComponent(`Halo Admin Jogatix, saya ingin konfirmasi pembayaran untuk pesanan ID: ${createdOrder.id} (${createdOrder.product}) sebesar ${createdOrder.totalFormatted}. Nomor tujuan: ${createdOrder.customer}.`);

    if (selectedPaymentMethod === 'qris') {
      const qrisImgHtml = adminSettings.qrisImage
        ? `<img src="${adminSettings.qrisImage}" alt="QRIS Code" style="max-width: 180px; max-height: 180px; object-fit: contain; display: block; margin: 0 auto;">`
        : `<svg width="160" height="160" viewBox="0 0 100 100" fill="#0E1126">
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
          </svg>`;

      payInstructions.innerHTML = `
        <div style="text-align: center; padding: 12px 0;">
          <div style="font-weight: 700; color: #0E1126; margin-bottom: 4px;">${adminSettings.qrisMerchant || 'QRIS Standar Pembayaran Nasional'}</div>
          <div style="font-size: 12px; color: #64748B; font-family: var(--font-mono); margin-bottom: 12px;">NMID: ${adminSettings.qrisNmid || 'ID1020039102910'}</div>
          <div style="font-size: 13.5px; color: #64748B; margin-bottom: 16px;">Buka aplikasi GoPay, OVO, DANA, BCA Mobile, atau aplikasi bank kamu, lalu pindai kode di bawah.</div>
          <div style="display: inline-block; padding: 14px; background: #FFFFFF; border: 2px solid #E2E8F0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            ${qrisImgHtml}
          </div>
          <div style="font-size: 13px; color: #4338CA; font-weight: 700; margin-top: 12px;">ID Transaksi: ${createdOrder.id}</div>
          <div style="margin-top: 16px;">
            <a href="https://wa.me/${waPhone}?text=${waText}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background: #ECFDF5; border: 1px solid #A7F3D0; color: #047857; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              Konfirmasi Cepat via WhatsApp
            </a>
          </div>
        </div>
      `;
    } else if (selectedPaymentMethod === 'va') {
      const activeBanks = (adminSettings.banks || []).filter(b => b.active !== false);
      const banksListHtml = activeBanks.length > 0
        ? activeBanks.map(b => `
            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <b style="color: #0E1126; font-size: 13.5px;">Bank ${b.name}</b>
                <div style="font-size: 12px; color: #64748B;">a.n. ${b.accName}</div>
              </div>
              <span style="font-family: var(--font-mono); font-size: 15px; font-weight: 700; color: #4338CA;">${b.accNo}</span>
            </div>
          `).join('')
        : `<div style="font-size: 14px; color: #4338CA; font-family: var(--font-mono); font-weight: 700; font-size: 18px; margin-bottom: 12px;">8901 2891 0492 8841 (BCA)</div>`;

      payInstructions.innerHTML = `
        <div style="padding: 10px 0;">
          <div style="font-weight: 700; color: #0E1126; margin-bottom: 8px;">Pilihan Rekening Transfer Bank &amp; Virtual Account</div>
          <div style="margin-bottom: 14px;">
            ${banksListHtml}
          </div>
          <p style="font-size: 13px; color: #64748B;">Transfer tepat sesuai nominal: <b>${createdOrder.totalFormatted}</b> melalui menu Transfer pada m-banking atau ATM kamu.</p>
          <div style="margin-top: 14px;">
            <a href="https://wa.me/${waPhone}?text=${waText}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background: #ECFDF5; border: 1px solid #A7F3D0; color: #047857; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              Kirim Bukti Transfer ke WhatsApp
            </a>
          </div>
        </div>
      `;
    } else {
      const provNote = createdOrder.provider ? `<b>${createdOrder.provider}</b>` : 'dompet digital';
      payInstructions.innerHTML = `
        <div style="padding: 10px 0;">
          <div style="font-weight: 700; color: #0E1126; margin-bottom: 8px;">Pembayaran E-Wallet Instan</div>
          <p style="font-size: 13px; color: #64748B;">Pemberitahuan konfirmasi top up ${provNote} akan dikirimkan ke nomor <b>${createdOrder.customer}</b>. Buka aplikasi ${createdOrder.provider || 'dompet digitalmu'} untuk menyelesaikan pembayaran sebesar <b>${createdOrder.totalFormatted}</b>.</p>
          <div style="margin-top: 14px;">
            <a href="https://wa.me/${waPhone}?text=${waText}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background: #ECFDF5; border: 1px solid #A7F3D0; color: #047857; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              Konfirmasi via WhatsApp
            </a>
          </div>
        </div>
      `;
    }
  }

  if (btnStage4Check) {
    btnStage4Check.addEventListener('click', () => {
      btnStage4Check.disabled = true;
      btnStage4Check.innerHTML = `
        <span style="display:inline-block;width:14px;height:14px;border:2px solid #FFFFFF;border-right-color:transparent;border-radius:50%;animation:spin 0.7s linear infinite;"></span>
        Memverifikasi Pembayaran...
      `;

      // Transition to Stage 5
      setTimeout(() => {
        setStage(5);
        renderStage5();
      }, 1200);
    });
  }

  // --- Stage 5: Processing & Success Result ---
  function renderStage5() {
    if (!createdOrder) return;

    if (procState) procState.style.display = 'block';
    if (successState) successState.style.display = 'none';

    // Simulate real-time provider fulfillment confirmation
    setTimeout(() => {
      if (procState) procState.style.display = 'none';
      if (successState) successState.style.display = 'block';

      if (finalTxId) finalTxId.textContent = createdOrder.id;

      if (finalProviderRow && finalProviderVal) {
        if (createdOrder.provider) {
          finalProviderRow.style.display = 'flex';
          if (finalProviderLabel) {
            finalProviderLabel.textContent = createdOrder.categorySlug === 'uang-elektronik'
              ? 'Penyedia / Dompet Digital'
              : 'Penyedia / Operator';
          }
          finalProviderVal.textContent = createdOrder.provider;
        } else {
          finalProviderRow.style.display = 'none';
        }
      }

      if (finalProdName) {
        finalProdName.textContent = createdOrder.category + ' — ' + createdOrder.product;
      }

      if (finalCustId) finalCustId.textContent = createdOrder.customer;
      if (finalSnBox) finalSnBox.style.display = 'block';
      if (finalSnVal) finalSnVal.textContent = createdOrder.sn;

      if (btnTracker) {
        btnTracker.href = `cek-transaksi.html?id=${encodeURIComponent(createdOrder.id)}`;
      }
    }, 1400);
  }

  // Initialize
  initStage1();

  // If query params had both category & customer, proceed to stage 2 directly
  if (initialCust && currentCategory.field.pattern && currentCategory.field.pattern.test(initialCust)) {
    currentCustomer = initialCust;
    renderStage2();
    setStage(2);
  }
})();
