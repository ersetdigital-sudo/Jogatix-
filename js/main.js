/* Jogatix — Main Application Script
   Handles Navigation, Mobile Drawer, Interactive Service Desk, and Global Utilities
*/
(function () {
  'use strict';

  // 1. Mobile Navigation Drawer
  function initMobileNav() {
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mobileDrawer = document.querySelector('.mobile-nav-drawer');

    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', function () {
        const isOpen = mobileDrawer.classList.toggle('open');
        mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      // Close when clicking any nav link in drawer
      mobileDrawer.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          mobileDrawer.classList.remove('open');
          mobileToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  // 2. Current Year in Footer
  function initYear() {
    document.querySelectorAll('.current-year').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  }

  // 3. Interactive Service Desk (on layanan.html)
  function initInteractiveDesk() {
    const deskContainer = document.getElementById('services-interactive-desk');
    if (!deskContainer) return;

    const C = window.JogatixCatalog;
    if (!C || !C.categories || C.categories.length === 0) {
      // Retry if catalog isn't loaded yet
      setTimeout(initInteractiveDesk, 50);
      return;
    }

    const navList = document.getElementById('desk-nav-list');
    const searchInput = document.getElementById('desk-search-filter');

    // Detail Pane Elements
    const detailTitle = document.getElementById('desk-detail-title');
    const detailBadge = document.getElementById('desk-detail-badge');
    const detailDesc = document.getElementById('desk-detail-desc');
    const detailProviders = document.getElementById('desk-detail-providers');
    const detailProcessNote = document.getElementById('desk-detail-process-note');

    // Form Pane Elements
    const detectedProvider = document.getElementById('desk-detected-provider');
    const inputLabel = document.getElementById('desk-input-label');
    const customerInput = document.getElementById('desk-customer-id');
    const productsGrid = document.getElementById('desk-products-grid');
    const formError = document.getElementById('desk-form-error');

    // Summary Elements
    const summaryProduct = document.getElementById('desk-summary-product');
    const summaryId = document.getElementById('desk-summary-id');
    const summaryTotal = document.getElementById('desk-summary-total');
    const proceedBtn = document.getElementById('desk-btn-proceed');

    // State
    const urlParams = new URLSearchParams(window.location.search);
    let selectedCatSlug = urlParams.get('kategori') || 'pulsa';
    let selectedProduct = null;
    let selectedProviderName = '';

    // Verify valid category slug
    if (!C.get(selectedCatSlug)) {
      selectedCatSlug = C.categories[0].slug;
    }

    // Build or Bind Navigation List
    // We bind to existing pre-rendered buttons or build them cleanly without ever deleting on click!
    function setupNavButtons() {
      if (!navList) return;

      // Check if buttons are already rendered in HTML
      let buttons = navList.querySelectorAll('.nav-category-item');

      if (buttons.length === 0) {
        // Render buttons if not present
        navList.innerHTML = '';
        C.categories.forEach(c => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'nav-category-item' + (c.slug === selectedCatSlug ? ' active' : '');
          btn.dataset.slug = c.slug;
          btn.innerHTML = `
            <div class="nav-category-left">
              <span class="nav-category-icon">${c.icon}</span>
              <span>${c.name}</span>
            </div>
            <span class="nav-category-type">${c.type === C.PREPAID ? 'Prabayar' : 'Tagihan'}</span>
          `;
          navList.appendChild(btn);
        });
        buttons = navList.querySelectorAll('.nav-category-item');
      }

      // Attach click events without recreating DOM
      buttons.forEach(btn => {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          const slug = this.dataset.slug;
          if (slug) {
            selectCategory(slug);
          }
        });
      });
    }

    // Search filter: hides/shows items WITHOUT destroying them!
    function filterNav(query) {
      if (!navList) return;
      const q = (query || '').trim().toLowerCase();
      const buttons = navList.querySelectorAll('.nav-category-item');
      let visibleCount = 0;

      buttons.forEach(btn => {
        const slug = btn.dataset.slug;
        const cat = C.get(slug);
        let match = true;
        if (q && cat) {
          match = cat.name.toLowerCase().includes(q) || cat.desc.toLowerCase().includes(q) || slug.includes(q);
        }
        btn.style.display = match ? 'flex' : 'none';
        if (match) visibleCount++;
      });

      // Empty search state indicator
      let emptyMsg = document.getElementById('desk-search-empty-msg');
      if (visibleCount === 0) {
        if (!emptyMsg) {
          emptyMsg = document.createElement('div');
          emptyMsg.id = 'desk-search-empty-msg';
          emptyMsg.style.cssText = 'padding: 20px 14px; text-align: center; font-size: 13px; color: #64748B; background: #F8FAFC; border-radius: 8px; border: 1px dashed #CBD5E1; margin-top: 8px;';
          emptyMsg.textContent = 'Layanan "' + query + '" tidak ditemukan.';
          navList.appendChild(emptyMsg);
        } else {
          emptyMsg.style.display = 'block';
          emptyMsg.textContent = 'Layanan "' + query + '" tidak ditemukan.';
        }
      } else if (emptyMsg) {
        emptyMsg.style.display = 'none';
      }
    }

    // Render Provider Selector Chips
    function renderProviderChips(cat) {
      if (!detailProviders) return;
      detailProviders.innerHTML = '';

      if (cat.providers && cat.providers.length > 0) {
        const wrap = document.createElement('div');
        wrap.className = 'provider-chips-wrap';

        const urlProv = urlParams.get('provider') || '';
        const defaultProv = (urlProv && cat.providers.includes(urlProv)) ? urlProv : cat.providers[0];
        selectedProviderName = defaultProv;

        cat.providers.forEach((provName) => {
          const isAct = provName.toLowerCase() === defaultProv.toLowerCase();
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = 'provider-chip-btn' + (isAct ? ' active' : '');
          chip.textContent = provName;

          chip.addEventListener('click', () => {
            wrap.querySelectorAll('.provider-chip-btn').forEach(c => {
              c.classList.remove('active');
            });
            chip.classList.add('active');
            selectedProviderName = provName;

            // Refresh product names in grid for instant visual confirmation
            if (productsGrid) {
              productsGrid.querySelectorAll('.product-card-item').forEach(card => {
                const pid = card.dataset.id;
                const pObj = cat.products ? cat.products.find(x => x.id === pid) : null;
                if (pObj) {
                  const nameTxt = card.querySelector('.product-name-txt');
                  if (nameTxt) {
                    nameTxt.textContent = (cat.slug === 'uang-elektronik' ? (selectedProviderName + ' ') : '') + pObj.name;
                  }
                }
              });
            }
            updateSummary();
          });

          wrap.appendChild(chip);
        });

        detailProviders.appendChild(wrap);
      } else {
        detailProviders.textContent = 'Penyedia Resmi Terhubung Otomatis';
      }
    }

    // Select and activate category
    function selectCategory(slug) {
      selectedCatSlug = slug;
      selectedProduct = null;
      selectedProviderName = '';
      if (formError) formError.textContent = '';
      if (customerInput) customerInput.value = '';

      // Update URL query safely without page reload
      try {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('kategori', slug);
        window.history.replaceState({}, '', newUrl);
      } catch (e) {}

      // Update active class on navigation buttons WITHOUT wiping out the DOM
      if (navList) {
        navList.querySelectorAll('.nav-category-item').forEach(btn => {
          if (btn.dataset.slug === slug) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      }

      const c = C.get(slug);
      if (!c) return;

      // Update Detail Card
      if (detailTitle) detailTitle.textContent = c.name;
      if (detailBadge) detailBadge.textContent = c.type === C.PREPAID ? 'Prabayar' : 'Tagihan Bulanan';
      if (detailDesc) detailDesc.textContent = c.desc;
      
      renderProviderChips(c);

      if (detailProcessNote) {
        detailProcessNote.textContent = c.type === C.PREPAID
          ? 'Otomatis instan setelah pembayaran terkonfirmasi'
          : 'Pemeriksaan tagihan otomatis, nomor seri (SN) resmi diterbitkan';
      }

      // Update Form Card
      if (inputLabel) inputLabel.textContent = c.field.label;
      if (customerInput) {
        customerInput.placeholder = c.field.placeholder;
        customerInput.setAttribute('inputmode', c.field.inputmode || 'text');
      }

      // Render Products Grid
      if (productsGrid) {
        productsGrid.innerHTML = '';
        if (c.type === C.PREPAID && c.products && c.products.length > 0) {
          c.products.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card-item';
            card.dataset.id = p.id;
            const displayName = (c.slug === 'uang-elektronik' && selectedProviderName ? (selectedProviderName + ' ') : '') + p.name;
            card.innerHTML = `
              <div class="product-name-txt">${displayName}</div>
              <div class="product-note-txt">${p.note || ''}</div>
              <div class="product-price-txt">${C.rupiah(p.price)}</div>
            `;
            card.addEventListener('click', () => {
              productsGrid.querySelectorAll('.product-card-item').forEach(el => el.classList.remove('selected'));
              card.classList.add('selected');
              selectedProduct = p;
              if (formError) formError.textContent = '';
              updateSummary();
            });
            productsGrid.appendChild(card);
          });
        } else {
          // Bill inquiries
          productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 20px; background: #F8FAFC; border: 1.5px dashed #CBD5E1; border-radius: 12px; font-size: 14px; color: #475569; line-height: 1.6;">
              <strong style="color: #0E1126; display: block; margin-bottom: 4px; font-size: 15px;">Pemeriksaan Tagihan Otomatis</strong>
              Masukkan nomor atau ID pelanggan di atas. Jumlah tagihan terbaru dan rincian biaya admin sebesar <b>${C.rupiah(c.adminFee || 2500)}</b> akan ditampilkan seketika sebelum tahap pembayaran.
            </div>
          `;
          selectedProduct = {
            id: 'tagihan-' + c.slug,
            name: 'Tagihan ' + c.name,
            price: 0,
            adminFee: c.adminFee || 2500,
            isBill: true
          };
        }
      }

      updateSummary();
    }

    // Update Checkout Bar Summary
    function updateSummary() {
      const c = C.get(selectedCatSlug);
      const custVal = customerInput ? customerInput.value.trim() : '';
      if (summaryId) {
        summaryId.textContent = custVal ? 'ID / Nomor: ' + custVal : '-';
      }

      if (!c) return;

      if (c.type === C.PREPAID) {
        if (selectedProduct) {
          const provPrefix = selectedProviderName ? (selectedProviderName + ' - ') : '';
          if (summaryProduct) summaryProduct.textContent = provPrefix + selectedProduct.name;
          if (summaryTotal) summaryTotal.textContent = C.rupiah(selectedProduct.price);
        } else {
          if (summaryProduct) summaryProduct.textContent = 'Pilih salah satu nominal produk';
          if (summaryTotal) summaryTotal.textContent = 'Rp 0';
        }
      } else {
        const provPrefix = selectedProviderName ? (selectedProviderName + ' - ') : '';
        if (summaryProduct) summaryProduct.textContent = provPrefix + 'Tagihan ' + c.name;
        if (summaryTotal) summaryTotal.textContent = 'Sesuai Tagihan + ' + C.rupiah(c.adminFee || 2500);
      }
    }

    // Input events
    if (customerInput) {
      customerInput.addEventListener('input', () => {
        updateSummary();
        if (formError) formError.textContent = '';
      });
    }

    // Search input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        filterNav(e.target.value);
      });
    }

    // Proceed to Checkout
    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        const c = C.get(selectedCatSlug);
        if (!c) return;

        const custVal = customerInput ? customerInput.value.trim().replace(/[\s-]/g, '') : '';
        if (!custVal) {
          if (formError) formError.textContent = 'Silakan masukkan ' + c.field.label.toLowerCase() + '.';
          customerInput && customerInput.focus();
          return;
        }

        if (c.field.pattern && !c.field.pattern.test(custVal)) {
          if (formError) formError.textContent = c.field.error;
          customerInput && customerInput.focus();
          return;
        }

        if (c.type === C.PREPAID && !selectedProduct) {
          if (formError) formError.textContent = 'Pilih salah satu nominal atau produk terlebih dahulu.';
          return;
        }

        // Navigate to transaksi.html with query parameters
        let targetUrl = `transaksi.html?kategori=${encodeURIComponent(c.slug)}&cust=${encodeURIComponent(custVal)}`;
        if (selectedProduct && selectedProduct.id) {
          targetUrl += `&produk=${encodeURIComponent(selectedProduct.id)}`;
        }
        if (selectedProviderName) {
          targetUrl += `&provider=${encodeURIComponent(selectedProviderName)}`;
        }
        window.location.href = targetUrl;
      });
    }

    // Initialize nav and activate starting category
    setupNavButtons();
    selectCategory(selectedCatSlug);
  }

  // 4. Quick Tracker Form on Homepage (if present)
  function initQuickTracker() {
    const homeTrackForm = document.getElementById('home-quick-tracker-form');
    if (homeTrackForm) {
      homeTrackForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = document.getElementById('home-quick-tracker-input');
        if (input && input.value.trim()) {
          window.location.href = 'cek-transaksi.html?id=' + encodeURIComponent(input.value.trim().toUpperCase());
        }
      });
    }
  }

  // 5. FAQ Accordion Interaction
  function initFaqAccordion() {
    const accordions = document.querySelectorAll('.faq-accordion');
    if (!accordions.length) return;

    accordions.forEach(accordion => {
      const items = accordion.querySelectorAll('.faq-item');

      items.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        if (!trigger) return;

        trigger.addEventListener('click', function () {
          const isCurrentlyOpen = item.classList.contains('is-open');

          // Close other items in the same accordion
          items.forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('is-open')) {
              otherItem.classList.remove('is-open');
              const otherBtn = otherItem.querySelector('.faq-trigger');
              if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            }
          });

          // Toggle clicked item
          if (isCurrentlyOpen) {
            item.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
          } else {
            item.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
          }
        });
      });
    });
  }

  // Execution Bootstrapper
  function boot() {
    initMobileNav();
    initYear();
    initInteractiveDesk();
    initQuickTracker();
    initFaqAccordion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('jogatix:catalog-ready', () => {
    initInteractiveDesk();
  });

})();
