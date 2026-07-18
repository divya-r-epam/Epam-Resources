/**
 * Travila - Main Application Script
 * Vanilla JS — all data loaded dynamically from JSON
 */
(function () {
  'use strict';

  /* ==============================
   * UTILITY HELPERS
   * ============================== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function debounce(fn, ms = 300) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  function throttle(fn, ms = 100) {
    let last = 0;
    return (...a) => { const now = Date.now(); if (now - last >= ms) { last = now; fn(...a); } };
  }

  function showToast(message, type = 'success') {
    const container = $('#toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${message}</span>
      <button class="toast-close" aria-label="Close toast">&times;</button>
    `;
    container.appendChild(toast);
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all .3s';
      setTimeout(() => toast.remove(), 300);
    });
    
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; toast.style.transition = 'all .3s'; }, 3000);
    setTimeout(() => toast.remove(), 3400);
  }

  /* ==============================
   * DATA STORE
   * ============================== */
  const store = { tours: [], blogs: [], destinations: [], spots: [], testimonials: [] };
  let toursShown = 6;

  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    return res.json();
  }

  /* ==============================
   * DYNAMIC RENDERERS
   * ============================== */

  // — Tours —
  function renderTourCard(t) {
    return `<article class="tour-card animate-on-scroll" data-category="${t.category}" data-duration="${t.durationKey}" data-rating="${t.rating}" data-price-range="${t.priceRange}" data-price="${t.price}">
      <div class="card-image">
        <img src="${t.image}" alt="${t.title}" loading="lazy" decoding="async" />
        <span class="tour-badge badge-${t.badgeType}">${t.badge}</span>
        <button class="tour-wishlist" aria-label="Add to wishlist" aria-pressed="false">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
        </button>
        <div class="tour-rating"><span class="tour-rating-star">★</span><span>${t.rating}</span><span class="text-gray-400">(${t.reviews} reviews)</span></div>
      </div>
      <div class="p-5">
        <h3 class="text-lg font-bold text-black mb-2">${t.title}</h3>
        <div class="flex items-center gap-4 text-sm text-[#737373] mb-4">
          <span class="flex items-center gap-1"><img src="assets/our-featured-tours/duration.svg.png" alt="duration" class="w-4 h-4 opacity-60"/>${t.duration}</span>
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            ${t.guests}
          </span>
        </div>
        <div class="flex items-center justify-between card-footer">
          <div><span class="text-xl font-extrabold text-orange">$${t.price.toFixed(2)}</span><span class="text-sm text-[#737373]"> / person</span></div>
          <button class="book-now-btn" aria-label="Book ${t.title}">Book Now</button>
        </div>
      </div>
    </article>`;
  }

  function renderTours(tours, append = false) {
    const grid = $('#tours-grid');
    if (!grid) return;
    if (!append) grid.innerHTML = '';
    const html = tours.map(renderTourCard).join('');
    if (append) grid.insertAdjacentHTML('beforeend', html);
    else grid.innerHTML = html;
    requestAnimationFrame(() => observeAnimations());
    applyTourFilters();
  }

  async function loadTours() {
    try {
      store.tours = await fetchJSON('data/tours.json');
      renderTours(store.tours.slice(0, toursShown));
      updateLoadMoreBtn();
    } catch (e) {
      const grid = $('#tours-grid');
      if (grid) grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10">Failed to load tours. Please refresh the page.</p>';
    }
  }

  function updateLoadMoreBtn() {
    const btn = $('#load-more-tours');
    if (!btn) return;
    if (toursShown >= store.tours.length) {
      btn.disabled = true;
      btn.textContent = 'All Tours Loaded';
      btn.classList.add('opacity-50', 'cursor-not-allowed');
    }
  }

  // — Blog Posts —
  function renderBlogCard(b) {
    return `<article class="news-card animate-on-scroll" data-blog-id="${b.id}">
      <div class="news-image">
        <img loading="lazy" decoding="async" src="${b.image}" alt="${b.title}" />
        <span class="absolute top-4 left-4 bg-white text-black text-xs font-bold px-3 py-1 rounded-full">${b.category}</span>
        <button class="like-btn absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition" aria-label="Save article" aria-pressed="false">
          <svg class="w-4 h-4 like-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
        </button>
      </div>
      <div class="p-5">
        <div class="flex items-center gap-4 text-xs text-[#737373] mb-3">
          <span class="flex items-center gap-1"><img src="assets/news-tips-guides/SVG.png" alt="date" class="w-3 h-3 opacity-60"/>${b.date}</span>
          <span class="flex items-center gap-1"><img src="assets/news-tips-guides/time.svg.png" alt="time" class="w-3 h-3 opacity-60"/>${b.readTime}</span>
          <span class="flex items-center gap-1"><img src="assets/news-tips-guides/comment.svg.png" alt="comments" class="w-3 h-3 opacity-60"/>${b.comments} comments</span>
        </div>
        <h3 class="text-base font-bold text-black mb-4 leading-snug">${b.title}</h3>
        <div class="flex items-center justify-between card-footer">
          <div class="flex items-center gap-2">
            <img loading="lazy" src="${b.authorAvatar}" alt="${b.author}" class="w-8 h-8 rounded-full object-cover"/>
            <span class="text-sm font-semibold text-black">${b.author}</span>
          </div>
          <button class="keep-reading-btn px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-black hover:bg-black hover:text-white transition">Keep Reading</button>
        </div>
      </div>
    </article>`;
  }

  async function loadBlogs() {
    try {
      store.blogs = await fetchJSON('data/blog-posts.json');
      const grid = $('#blog-grid');
      if (grid) {
        grid.innerHTML = store.blogs.slice(0, 3).map(renderBlogCard).join('');
        requestAnimationFrame(() => observeAnimations());
        
        // Add click handlers for like buttons
        grid.querySelectorAll('.like-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const isPressed = btn.getAttribute('aria-pressed') === 'true';
            btn.setAttribute('aria-pressed', !isPressed);
            
            const icon = btn.querySelector('.like-icon');
            if (!isPressed) {
              icon.setAttribute('fill', 'currentColor');
              icon.classList.add('text-red-500');
              showToast('Article saved to favorites!', 'success');
            } else {
              icon.setAttribute('fill', 'none');
              icon.classList.remove('text-red-500');
              showToast('Article removed from favorites', 'success');
            }
          });
        });
        
        // Add click handlers for keep reading buttons
        grid.querySelectorAll('.keep-reading-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const card = btn.closest('.news-card');
            const title = card.querySelector('h3')?.textContent?.trim();
            showToast(`Reading "${title}" - Full article coming soon!`, 'success');
          });
        });
      }
    } catch (e) {
      const grid = $('#blog-grid');
      if (grid) grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10">Failed to load blog posts.</p>';
    }
  }

  // — Destinations —
  function renderDestinationItem(d) {
    return `<div class="destination-item"><img src="${d.image}" alt="${d.name}"/><h3>${d.name}</h3><p>${d.tours} Tours</p></div>`;
  }

  async function loadDestinations() {
    try {
      store.destinations = await fetchJSON('data/destinations.json');
      const carousel = $('#destinations-carousel');
      if (carousel) { carousel.innerHTML = store.destinations.map(renderDestinationItem).join(''); }
    } catch (e) { console.warn('Failed to load destinations', e); }
  }

  // — Popular Spots —
  function renderSpotCard(s) {
    const categoryLabels = {
      'adventure': 'Adventure',
      'cultural': 'Cultural',
      'nature': 'Nature',
      'urban': 'Urban'
    };
    const durationLabels = {
      '1-3': '1-3 Days',
      '4-7': '4-7 Days',
      '8+': '8+ Days'
    };
    const ratingLabels = {
      '2': '2★',
      '3': '3★',
      '4': '4★',
      '5': '5★'
    };
    const priceLabels = {
      'budget': 'Budget',
      'mid': 'Standard',
      'luxury': 'Premium'
    };
    
    const categoryLabel = categoryLabels[s.category] || s.category || 'All';
    const durationLabel = durationLabels[s.duration] || s.duration || 'All';
    const ratingLabel = ratingLabels[s.rating] || s.rating || 'All';
    const priceLabel = priceLabels[s.price] || s.price || 'All';
    
    return `<article class="spot-card animate-on-scroll cursor-pointer" data-spot="${s.name}" data-tours="${s.tours}" data-activities="${s.activities}" data-category="${s.category || 'all'}" data-duration="${s.duration || 'all'}" data-rating="${s.rating || 'all'}" data-price="${s.price || 'all'}">
      <img loading="lazy" decoding="async" src="${s.image}" alt="${s.name}"/>
      <div class="spot-info">
        <h3 class="text-base font-bold text-black">${s.name}</h3>
        <div class="flex items-center gap-2 text-xs text-[#737373] mt-1">
          <span>${s.tours} Tours,</span><span>${s.activities} Activities</span><span class="ml-auto">→</span>
        </div>
        <div class="flex items-center gap-2 mt-2 text-xs">
          <span class="spot-filter-tag">${categoryLabel}</span>
          <span class="spot-filter-tag">${durationLabel}</span>
          <span class="spot-filter-tag">${ratingLabel} rating</span>
          <span class="spot-filter-tag spot-price-${s.price || 'budget'}">${priceLabel} price</span>
        </div>
      </div>
    </article>`;
  }

  async function loadSpots() {
    try {
      store.spots = await fetchJSON('data/spots.json');
      const grid = $('#spots-grid');
      if (grid) {
        grid.innerHTML = store.spots.map(renderSpotCard).join('');
        requestAnimationFrame(() => observeAnimations());
        
        // Add click handlers to spot cards - open demo modal
        grid.querySelectorAll('.spot-card').forEach(card => {
          card.addEventListener('click', () => {
            const spotName = card.dataset.spot;
            const demoModal = $('#demo-modal');
            if (demoModal) {
              demoModal.classList.remove('hidden');
              demoModal.classList.add('flex');
              document.body.style.overflow = 'hidden';
              // Update modal content with spot info
              const modalTitle = demoModal.querySelector('h3');
              const modalDesc = demoModal.querySelector('p');
              const modalDetail = demoModal.querySelector('.bg-gray-100 p');
              if (modalTitle) modalTitle.textContent = spotName;
              if (modalDesc) modalDesc.textContent = `Explore tours and activities in ${spotName}`;
              if (modalDetail) modalDetail.textContent = `${card.dataset.tours || 'Multiple'} Tours, ${card.dataset.activities || 'Various'} Activities available`;
            }
          });
        });
        
        // Initialize popular spots filters
        initPopularSpotsFilters();
      }
    } catch (e) { console.warn('Failed to load spots', e); }
  }

  function initPopularSpotsFilters() {
    const filterButtons = $$('.filter-btn');
    const filterOptions = $$('.filter-option');
    const grid = $('#spots-grid');
    if (!grid || filterButtons.length === 0) return;

    let activeFilters = {
      category: 'all',
      duration: 'all',
      rating: 'all',
      price: 'all'
    };

    // Toggle dropdown visibility
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const filterType = btn.dataset.filterType;
        const dropdown = $(`#popular-filter-${filterType}-dropdown`);
        
        // Close all other dropdowns
        $$('.filter-btn').forEach(otherBtn => {
          if (otherBtn !== btn) {
            const otherType = otherBtn.dataset.filterType;
            const otherDropdown = $(`#popular-filter-${otherType}-dropdown`);
            if (otherDropdown) {
              otherDropdown.classList.add('hidden');
              otherBtn.setAttribute('aria-expanded', 'false');
            }
          }
        });

        // Toggle current dropdown
        if (dropdown) {
          dropdown.classList.toggle('hidden');
          btn.setAttribute('aria-expanded', !dropdown.classList.contains('hidden'));
        }
      });
    });

    // Handle filter option clicks
    filterOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const filterType = option.dataset.filterType;
        const filterValue = option.dataset.filterValue;
        
        // Update active filter
        activeFilters[filterType] = filterValue;
        
        // Update button label
        const btn = $(`#popular-filter-${filterType}`);
        if (btn) {
          const label = btn.querySelector('.filter-label');
          if (label) {
            label.textContent = option.textContent;
          }
        }

        // Close dropdown
        const dropdown = $(`#popular-filter-${filterType}-dropdown`);
        if (dropdown) {
          dropdown.classList.add('hidden');
          btn.setAttribute('aria-expanded', 'false');
        }

        // Filter cards
        const cards = grid.querySelectorAll('.spot-card');
        let visibleCount = 0;
        cards.forEach(card => {
          let show = true;
          
          if (activeFilters.category !== 'all' && card.dataset.category !== activeFilters.category) {
            show = false;
          }
          if (activeFilters.duration !== 'all' && card.dataset.duration !== activeFilters.duration) {
            show = false;
          }
          if (activeFilters.rating !== 'all' && card.dataset.rating !== activeFilters.rating) {
            show = false;
          }
          if (activeFilters.price !== 'all' && card.dataset.price !== activeFilters.price) {
            show = false;
          }
          
          card.style.display = show ? 'block' : 'none';
          if (show) visibleCount++;
        });

        // Show no results message if needed
        let noResultsMsg = $('#spots-no-results');
        if (visibleCount === 0) {
          if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'spots-no-results';
            noResultsMsg.className = 'col-span-full text-center py-12 text-gray-500';
            noResultsMsg.innerHTML = '<p class="text-lg">No spots found matching your filters.</p>';
            grid.appendChild(noResultsMsg);
          }
          noResultsMsg.style.display = 'block';
        } else if (noResultsMsg) {
          noResultsMsg.style.display = 'none';
        }
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
      $$('.filter-btn').forEach(btn => {
        const filterType = btn.dataset.filterType;
        const dropdown = $(`#popular-filter-${filterType}-dropdown`);
        if (dropdown) {
          dropdown.classList.add('hidden');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // — Testimonials —
  function renderStars(n) {
    return Array.from({ length: n }, () =>
      `<img loading="lazy" src="assets/they-love-travila/star.svg fill.png" alt="star" class="w-4 h-4"/>`
    ).join('');
  }

  function renderTestimonialCard(t) {
    return `<article class="testimonial-card flex-shrink-0 snap-start w-[90vw] sm:w-[360px] lg:w-[400px] xl:w-[420px] bg-white rounded-3xl p-6">
      <h3 class="text-lg font-bold text-black mb-3">${t.title}</h3>
      <p class="text-sm text-[#737373] leading-relaxed mb-6">${t.text}</p>
      <div class="flex items-center justify-between card-footer">
        <div class="flex items-center gap-3">
          <img loading="lazy" src="${t.avatar}" alt="${t.name}" class="w-10 h-10 rounded-full object-cover"/>
          <div><div class="text-sm font-bold text-black">${t.name}</div><div class="text-xs text-[#737373]">${t.location}</div></div>
        </div>
        <div class="flex gap-0.5">${renderStars(t.rating)}</div>
      </div>
    </article>`;
  }

  async function loadTestimonials() {
    try {
      store.testimonials = await fetchJSON('data/testimonials.json');
      const carousel = $('#testimonial-carousel');
      if (carousel) { carousel.innerHTML = store.testimonials.map(renderTestimonialCard).join(''); }
    } catch (e) { console.warn('Failed to load testimonials', e); }
  }

  /* ==============================
   * DROPDOWNS (Language / Currency)
   * ============================== */
  function initDropdowns() {
    ['lang-menu', 'currency-menu'].forEach(id => {
      const menu = $(`#${id}`);
      if (!menu) return;
      const dd = menu.querySelector('ul');
      if (!dd) return;
      menu.addEventListener('mouseenter', () => dd.classList.remove('hidden'));
      menu.addEventListener('mouseleave', () => dd.classList.add('hidden'));
      menu.addEventListener('keydown', e => {
        if (e.key === 'Escape') dd.classList.add('hidden');
      });
    });

    // Make nav items clickable and close dropdowns after clicking
    $$('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = $(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            // Close mobile menu if open
            const mobileMenu = $('#mobile-menu');
            if (mobileMenu && mobileMenu._close && mobileMenu.classList.contains('open')) {
              mobileMenu._close();
            }
          }
        }
      });
    });

    // Desktop dropdown click handling
    $$('.group ul li a').forEach(dropdownLink => {
      dropdownLink.addEventListener('click', (e) => {
        const href = dropdownLink.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = $(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  /* ==============================
   * MOBILE MENU
   * ============================== */
  function initMobileMenu() {
    const btn = $('#mobile-menu-btn');
    const menu = $('#mobile-menu');
    const closeBtn = $('#mobile-menu-close');
    if (!btn || !menu) return;

    function closeMobileMenu() {
      menu.classList.remove('open');
      menu.inert = true;
      document.body.style.overflow = '';
      btn.setAttribute('aria-expanded', 'false');
      // Close all sub-dropdowns too
      $$('.mobile-dropdown-content').forEach(c => c.classList.remove('show'));
      $$('.mobile-dropdown-btn').forEach(b => b.classList.remove('open'));
    }

    function openMobileMenu() {
      menu.classList.add('open');
      menu.inert = false;
      document.body.style.overflow = 'hidden';
      btn.setAttribute('aria-expanded', 'true');
    }

    btn.addEventListener('click', () => {
      const isOpen = menu.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close button inside the menu
    if (closeBtn) {
      closeBtn.addEventListener('click', closeMobileMenu);
    }

    // Expose close function for other handlers
    menu._close = closeMobileMenu;
  }

  /* ==============================
   * HERO SEARCH TABS
   * ============================== */
  function initSearchTabs() {
    const tabs = $$('.search-tab');
    const forms = $$('.search-form');
    const searchBtns = $$('.hero-search-btn');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        
        // Switch forms
        const formType = tab.textContent.toLowerCase();
        forms.forEach(form => {
          if (form.dataset.form === formType) {
            form.classList.remove('hidden');
            form.classList.add('active');
          } else {
            form.classList.add('hidden');
            form.classList.remove('active');
          }
        });
      });
      tab.addEventListener('keydown', e => {
        const idx = tabs.indexOf(tab);
        let next = idx;
        if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
        else return;
        e.preventDefault();
        tabs[next].focus();
        tabs[next].click();
      });
    });

    // Handle search button clicks
    searchBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const activeForm = $('.search-form.active');
        if (activeForm) {
          const formType = activeForm.dataset.form;
          const inputs = activeForm.querySelectorAll('select, input');
          let hasValues = false;
          inputs.forEach(input => {
            if (input.value && input.value !== '') hasValues = true;
          });
          
          if (hasValues) {
            showToast(`Searching for ${formType}...`, 'success');
            // Simulate search - in real app, this would make an API call
            setTimeout(() => {
              showToast('No results found for your search. Try different filters.', 'error');
            }, 1000);
          } else {
            showToast('Please fill in at least one search field.', 'error');
          }
        }
      });
    });
  }

  /* ==============================
   * DESTINATIONS CAROUSEL (Infinite Scroll)
   * ============================== */
  function initDestinationsCarousel() {
    const carousel = $('#destinations-carousel');
    const prev = $('#dest-prev');
    const next = $('#dest-next');
    if (!carousel || !prev || !next) return;
    let offset = 0;
    const itemWidth = 162;
    const scrollAmount = itemWidth; // Changed to scroll one card at a time
    let isAnimating = false;

    function getMaxOffset() {
      const items = carousel.children.length;
      const containerWidth = carousel.parentElement.offsetWidth;
      return Math.max(0, items * itemWidth - containerWidth);
    }

    prev.addEventListener('click', () => {
      if (isAnimating) return;
      isAnimating = true;
      
      // Check if we're at the start, if so, go to end for infinite effect
      if (offset <= 0) {
        carousel.style.transition = 'none';
        carousel.style.transform = `translateX(-${getMaxOffset()}px)`;
        offset = getMaxOffset();
        setTimeout(() => {
          carousel.style.transition = 'transform 0.3s ease';
          offset = getMaxOffset() - scrollAmount;
          carousel.style.transform = `translateX(-${offset}px)`;
          setTimeout(() => { isAnimating = false; }, 300);
        }, 50);
      } else {
        offset = Math.max(0, offset - scrollAmount);
        carousel.style.transition = 'transform 0.3s ease';
        carousel.style.transform = `translateX(-${offset}px)`;
        setTimeout(() => { isAnimating = false; }, 300);
      }
    });

    next.addEventListener('click', () => {
      if (isAnimating) return;
      isAnimating = true;
      
      // Check if we're near the end, if so, reset to start for infinite effect
      if (offset >= getMaxOffset() - scrollAmount) {
        carousel.style.transition = 'none';
        carousel.style.transform = 'translateX(0px)';
        offset = 0;
        setTimeout(() => {
          carousel.style.transition = 'transform 0.3s ease';
          offset = scrollAmount;
          carousel.style.transform = `translateX(-${offset}px)`;
          setTimeout(() => { isAnimating = false; }, 300);
        }, 50);
      } else {
        offset = Math.min(getMaxOffset(), offset + scrollAmount);
        carousel.style.transition = 'transform 0.3s ease';
        carousel.style.transform = `translateX(-${offset}px)`;
        setTimeout(() => { isAnimating = false; }, 300);
      }
    });
    
    // Add touch/drag support for horizontal scrolling
    let startX = 0;
    let isDragging = false;
    
    carousel.addEventListener('mousedown', (e) => {
      startX = e.pageX - carousel.offsetLeft;
      isDragging = true;
    });
    
    carousel.addEventListener('mouseleave', () => {
      isDragging = false;
    });
    
    carousel.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX);
      if (walk > 50 && offset > 0) {
        offset = Math.max(0, offset - scrollAmount);
        carousel.style.transition = 'transform 0.3s ease';
        carousel.style.transform = `translateX(-${offset}px)`;
      } else if (walk < -50 && offset < getMaxOffset()) {
        offset = Math.min(getMaxOffset(), offset + scrollAmount);
        carousel.style.transition = 'transform 0.3s ease';
        carousel.style.transform = `translateX(-${offset}px)`;
      }
    });
    
    carousel.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
    });

    // Add touch support for mobile
    let touchStartX = 0;
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0 && offset < getMaxOffset()) {
          // Swipe left - scroll right
          offset = Math.min(getMaxOffset(), offset + scrollAmount);
          carousel.style.transition = 'transform 0.3s ease';
          carousel.style.transform = `translateX(-${offset}px)`;
        } else if (diff < 0 && offset > 0) {
          // Swipe right - scroll left
          offset = Math.max(0, offset - scrollAmount);
          carousel.style.transition = 'transform 0.3s ease';
          carousel.style.transform = `translateX(-${offset}px)`;
        }
      }
    }, { passive: true });

    let autoScroll = setInterval(() => next.click(), 3500);
    carousel.parentElement.addEventListener('mouseenter', () => clearInterval(autoScroll));
    carousel.parentElement.addEventListener('mouseleave', () => {
      autoScroll = setInterval(() => next.click(), 3500);
    });
  }

  // Moves real cards between the two ends of a track, so arrows never reveal
  // an empty area at the start or end of either carousel.
  function initSeamlessCarousel(carousel, prev, next, gap, interval) {
    if (!carousel || !prev || !next || carousel.children.length < 2) return;
    let moving = false;
    let autoScroll;

    const step = () => carousel.firstElementChild.getBoundingClientRect().width + gap;
    const move = direction => {
      if (moving) return;
      moving = true;
      const distance = step();

      if (direction < 0) {
        carousel.insertBefore(carousel.lastElementChild, carousel.firstElementChild);
        carousel.style.transition = 'none';
        carousel.style.transform = `translateX(-${distance}px)`;
        requestAnimationFrame(() => {
          carousel.style.transition = 'transform 0.35s ease';
          carousel.style.transform = 'translateX(0)';
        });
      } else {
        carousel.style.transition = 'transform 0.35s ease';
        carousel.style.transform = `translateX(-${distance}px)`;
      }
    };

    carousel.addEventListener('transitionend', () => {
      if (!moving) return;
      if (carousel.style.transform !== 'translateX(0px)' && carousel.style.transform !== 'translateX(0)') {
        carousel.appendChild(carousel.firstElementChild);
      }
      carousel.style.transition = 'none';
      carousel.style.transform = 'translateX(0)';
      moving = false;
    });

    prev.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    carousel.addEventListener('touchstart', event => { carousel._touchX = event.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', event => {
      const difference = carousel._touchX - event.changedTouches[0].clientX;
      if (Math.abs(difference) > 40) move(difference > 0 ? 1 : -1);
    }, { passive: true });

    const startAuto = () => { autoScroll = setInterval(() => move(1), interval); };
    const stopAuto = () => clearInterval(autoScroll);
    carousel.parentElement.addEventListener('mouseenter', stopAuto);
    carousel.parentElement.addEventListener('mouseleave', startAuto);
    startAuto();
  }

  function initDestinationsCarousel() {
    initSeamlessCarousel($('#destinations-carousel'), $('#dest-prev'), $('#dest-next'), 32, 3500);
  }

  /* ==============================
   * PROMO BANNERS CAROUSEL (Infinite Scroll)
   * ============================== */
  function initPromoCarousel() {
    const carousel = $('#promo-carousel');
    const prev = $('#promo-prev');
    const next = $('#promo-next');
    if (!carousel || !prev || !next) return;
    let offset = 0;
    let isAnimating = false;

    function getCardWidth() {
      const card = carousel.querySelector('.promo-card');
      return card ? card.offsetWidth + 24 : 400;
    }

    function getMaxOffset() {
      const maxOffset = carousel.scrollWidth - carousel.parentElement.offsetWidth;
      return Math.max(0, maxOffset);
    }

    prev.addEventListener('click', () => {
      if (isAnimating) return;
      isAnimating = true;
      
      // Check if we're at the start, if so, go to end for infinite effect
      if (offset <= 0) {
        carousel.style.transition = 'none';
        carousel.style.transform = `translateX(-${getMaxOffset()}px)`;
        offset = getMaxOffset();
        setTimeout(() => {
          carousel.style.transition = 'transform 0.3s ease';
          offset = getMaxOffset() - getCardWidth();
          carousel.style.transform = `translateX(-${offset}px)`;
          setTimeout(() => { isAnimating = false; }, 300);
        }, 50);
      } else {
        offset = Math.max(0, offset - getCardWidth());
        carousel.style.transition = 'transform 0.3s ease';
        carousel.style.transform = `translateX(-${offset}px)`;
        setTimeout(() => { isAnimating = false; }, 300);
      }
    });

    next.addEventListener('click', () => {
      if (isAnimating) return;
      isAnimating = true;
      
      // Check if we're near the end, if so, reset to start for infinite effect
      if (offset >= getMaxOffset() - getCardWidth()) {
        carousel.style.transition = 'none';
        carousel.style.transform = 'translateX(0px)';
        offset = 0;
        setTimeout(() => {
          carousel.style.transition = 'transform 0.3s ease';
          offset = getCardWidth();
          carousel.style.transform = `translateX(-${offset}px)`;
          setTimeout(() => { isAnimating = false; }, 300);
        }, 50);
      } else {
        offset = Math.min(getMaxOffset(), offset + getCardWidth());
        carousel.style.transition = 'transform 0.3s ease';
        carousel.style.transform = `translateX(-${offset}px)`;
        setTimeout(() => { isAnimating = false; }, 300);
      }
    });
    
    // Add touch/drag support for horizontal scrolling
    let startX = 0;
    let isDragging = false;
    
    carousel.addEventListener('mousedown', (e) => {
      startX = e.pageX - carousel.offsetLeft;
      isDragging = true;
    });
    
    carousel.addEventListener('mouseleave', () => {
      isDragging = false;
    });
    
    carousel.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX);
      if (walk > 50 && offset > 0) {
        offset = Math.max(0, offset - getCardWidth());
        carousel.style.transition = 'transform 0.3s ease';
        carousel.style.transform = `translateX(-${offset}px)`;
      } else if (walk < -50 && offset < getMaxOffset()) {
        offset = Math.min(getMaxOffset(), offset + getCardWidth());
        carousel.style.transition = 'transform 0.3s ease';
        carousel.style.transform = `translateX(-${offset}px)`;
      }
    });
    
    carousel.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
    });

    // Add touch support for mobile
    let touchStartX = 0;
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0 && offset < getMaxOffset()) {
          // Swipe left - scroll right
          offset = Math.min(getMaxOffset(), offset + getCardWidth());
          carousel.style.transition = 'transform 0.3s ease';
          carousel.style.transform = `translateX(-${offset}px)`;
        } else if (diff < 0 && offset > 0) {
          // Swipe right - scroll left
          offset = Math.max(0, offset - getCardWidth());
          carousel.style.transition = 'transform 0.3s ease';
          carousel.style.transform = `translateX(-${offset}px)`;
        }
      }
    }, { passive: true });

    let autoScroll = setInterval(() => next.click(), 4000);
    carousel.parentElement.addEventListener('mouseenter', () => clearInterval(autoScroll));
    carousel.parentElement.addEventListener('mouseleave', () => {
      autoScroll = setInterval(() => next.click(), 4000);
    });
  }

  function initPromoCarousel() {
    initSeamlessCarousel($('#promo-carousel'), $('#promo-prev'), $('#promo-next'), 24, 4000);
  }

  /* ==============================
   * TESTIMONIALS CAROUSEL (Infinite Scroll)
   * ============================== */
  function initTestimonialsCarousel() {
    const wrapper = $('.testimonial-carousel-wrapper');
    const carousel = $('#testimonial-carousel');
    const prev = $('#testimonial-prev');
    const next = $('#testimonial-next');
    if (!wrapper || !carousel || !prev || !next) return;
    
    let offset = 0;
    let isAnimating = false;

    function getCardWidth() {
      const card = carousel.querySelector('.testimonial-card');
      return card ? card.offsetWidth + 24 : 380;
    }

    function getMaxOffset() {
      const maxOffset = carousel.scrollWidth - wrapper.offsetWidth;
      return Math.max(0, maxOffset);
    }

    prev.addEventListener('click', () => {
      if (isAnimating) return;
      isAnimating = true;
      
      // Check if we're at the start, if so, go to end for infinite effect
      if (offset <= 0) {
        carousel.style.transition = 'none';
        carousel.style.transform = `translateX(-${getMaxOffset()}px)`;
        offset = getMaxOffset();
        setTimeout(() => {
          carousel.style.transition = 'transform 0.3s ease';
          offset = getMaxOffset() - getCardWidth();
          carousel.style.transform = `translateX(-${offset}px)`;
          setTimeout(() => { isAnimating = false; }, 300);
        }, 50);
      } else {
        offset = Math.max(0, offset - getCardWidth());
        carousel.style.transition = 'transform 0.3s ease';
        carousel.style.transform = `translateX(-${offset}px)`;
        setTimeout(() => { isAnimating = false; }, 300);
      }
    });

    next.addEventListener('click', () => {
      if (isAnimating) return;
      isAnimating = true;
      
      // Check if we're near the end, if so, reset to start for infinite effect
      if (offset >= getMaxOffset() - getCardWidth()) {
        carousel.style.transition = 'none';
        carousel.style.transform = 'translateX(0px)';
        offset = 0;
        setTimeout(() => {
          carousel.style.transition = 'transform 0.3s ease';
          offset = getCardWidth();
          carousel.style.transform = `translateX(-${offset}px)`;
          setTimeout(() => { isAnimating = false; }, 300);
        }, 50);
      } else {
        offset = Math.min(getMaxOffset(), offset + getCardWidth());
        carousel.style.transition = 'transform 0.3s ease';
        carousel.style.transform = `translateX(-${offset}px)`;
        setTimeout(() => { isAnimating = false; }, 300);
      }
    });
    
    // Add touch/drag support for horizontal scrolling
    let startX = 0;
    let isDragging = false;
    
    carousel.addEventListener('mousedown', (e) => {
      startX = e.pageX - carousel.offsetLeft;
      isDragging = true;
    });
    
    carousel.addEventListener('mouseleave', () => {
      isDragging = false;
    });
    
    carousel.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX);
      if (walk > 50 && offset > 0) {
        offset = Math.max(0, offset - getCardWidth());
        carousel.style.transition = 'transform 0.3s ease';
        carousel.style.transform = `translateX(-${offset}px)`;
      } else if (walk < -50 && offset < getMaxOffset()) {
        offset = Math.min(getMaxOffset(), offset + getCardWidth());
        carousel.style.transition = 'transform 0.3s ease';
        carousel.style.transform = `translateX(-${offset}px)`;
      }
    });
    
    carousel.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
    });

    // Add touch support for mobile
    let touchStartX = 0;
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0 && offset < getMaxOffset()) {
          // Swipe left - scroll right
          offset = Math.min(getMaxOffset(), offset + getCardWidth());
          carousel.style.transition = 'transform 0.3s ease';
          carousel.style.transform = `translateX(-${offset}px)`;
        } else if (diff < 0 && offset > 0) {
          // Swipe right - scroll left
          offset = Math.max(0, offset - getCardWidth());
          carousel.style.transition = 'transform 0.3s ease';
          carousel.style.transform = `translateX(-${offset}px)`;
        }
      }
    }, { passive: true });
  }

  /* ==============================
   * TOUR FILTERS
   * ============================== */
  function applyTourFilters() {
    const cat = $('#filter-category')?.value || '';
    const dur = $('#filter-duration')?.value || '';
    const rat = $('#filter-rating')?.value || '';
    const price = $('#filter-price')?.value || '';

    $$('.tour-card').forEach(card => {
      let show = true;
      if (cat && card.dataset.category !== cat) show = false;
      if (dur && card.dataset.duration !== dur) show = false;
      if (rat && parseFloat(card.dataset.rating) < parseFloat(rat)) show = false;
      if (price && card.dataset.priceRange !== price) show = false;
      card.style.display = show ? '' : 'none';
    });
  }

  function initTourFilters() {
    ['filter-category', 'filter-duration', 'filter-rating', 'filter-price'].forEach(id => {
      const el = $(`#${id}`);
      if (el) el.addEventListener('change', applyTourFilters);
    });
    const clearBtn = $('#clear-tour-filters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        ['filter-category', 'filter-duration', 'filter-rating', 'filter-price'].forEach(id => {
          const el = $(`#${id}`);
          if (el) el.value = '';
        });
        applyTourFilters();
      });
    }
  }

  /* ==============================
   * LOAD MORE TOURS
   * ============================== */
  function initLoadMore() {
    const btn = $('#load-more-tours');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const nextBatch = store.tours.slice(toursShown, toursShown + 3);
      if (nextBatch.length === 0) return;
      toursShown += nextBatch.length;
      renderTours(store.tours.slice(0, toursShown));
      updateLoadMoreBtn();
    });
  }

  /* ==============================
   * WISHLIST TOGGLE
   * ============================== */
  function initWishlist() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.tour-wishlist');
      if (!btn) return;
      const isActive = btn.classList.toggle('active');
      btn.setAttribute('aria-pressed', isActive);
      const svg = btn.querySelector('svg path');
      if (svg) { svg.setAttribute('fill', isActive ? '#ef4444' : 'none'); svg.setAttribute('stroke', isActive ? '#ef4444' : 'currentColor'); }
      showToast(isActive ? 'Added to wishlist ❤️' : 'Removed from wishlist', isActive ? 'success' : 'error');
    });
  }

  /* ==============================
   * STICKY HEADER
   * ============================== */
  function initStickyHeader() {
    const header = $('#header');
    if (!header) return;
    window.addEventListener('scroll', throttle(() => {
      header.classList.toggle('header-shadow', window.scrollY > 10);
    }, 100));
  }

  /* ==============================
   * NEWSLETTER SUBSCRIBE
   * ============================== */
  function initNewsletter() {
    const btn = $('#subscribe-btn');
    const input = $('#newsletter-input');
    const msg = $('#newsletter-msg');
    if (!btn || !input) return;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Get subscribed emails from localStorage
    const subscribedEmails = JSON.parse(localStorage.getItem('subscribedEmails') || '[]');

    btn.addEventListener('click', () => {
      const val = input.value.trim();
      if (!val) {
        showToast('Please enter your email address', 'error');
        if (msg) { msg.textContent = 'Please enter your email'; msg.className = 'text-xs mt-2 text-red-400'; }
        return;
      }
      if (!emailRe.test(val)) {
        showToast('Please enter a valid email address', 'error');
        if (msg) { msg.textContent = 'Invalid email format'; msg.className = 'text-xs mt-2 text-red-400'; }
        return;
      }
      
      // Check if email is already subscribed
      if (subscribedEmails.includes(val)) {
        showToast('This email is already subscribed', 'error');
        if (msg) { msg.textContent = 'Email already subscribed'; msg.className = 'text-xs mt-2 text-red-400'; }
        return;
      }
      
      // Add email to subscribed list
      subscribedEmails.push(val);
      localStorage.setItem('subscribedEmails', JSON.stringify(subscribedEmails));
      
      showToast('Subscribed successfully! 🎉', 'success');
      if (msg) { msg.textContent = 'Thank you for subscribing!'; msg.className = 'text-xs mt-2 text-green-400'; }
      input.value = '';
    });
  }

  /* ==============================
   * FAQ ACCORDION
   * ============================== */
  function initAccordion() {
    $$('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const item = header.closest('.accordion-item');
        const content = item.querySelector('.accordion-content');
        const isOpen = header.getAttribute('aria-expanded') === 'true';

        // Close all others
        $$('.accordion-item').forEach(other => {
          if (other !== item) {
            const otherHeader = other.querySelector('.accordion-header');
            const otherContent = other.querySelector('.accordion-content');
            otherHeader.setAttribute('aria-expanded', 'false');
            otherContent.style.maxHeight = '0';
            otherContent.classList.remove('open');
          }
        });

        // Toggle current
        header.setAttribute('aria-expanded', !isOpen);
        if (!isOpen) {
          content.style.maxHeight = content.scrollHeight + 'px';
          content.classList.add('open');
        } else {
          content.style.maxHeight = '0';
          content.classList.remove('open');
        }
      });
    });
  }

  /* ==============================
   * CONTACT FORM VALIDATION
   * ============================== */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;

    const validators = {
      'contact-name': { test: v => v.length >= 2, msg: 'Name must be at least 2 characters' },
      'contact-email': { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Please enter a valid email' },
      'contact-phone': { test: v => /^[+]?[\d\s()-]{7,15}$/.test(v), msg: 'Please enter a valid phone number' },
      'contact-subject': { test: v => v.length >= 3, msg: 'Subject must be at least 3 characters' },
      'contact-message': { test: v => v.length >= 10, msg: 'Message must be at least 10 characters' }
    };

    function validateField(id) {
      const input = $(`#${id}`);
      const error = $(`#${id.replace('contact-', '')}-error`);
      if (!input || !validators[id]) return true;
      const val = input.value.trim();
      const valid = val && validators[id].test(val);
      input.classList.toggle('error', !valid);
      input.classList.toggle('success', valid);
      if (error) { error.textContent = valid ? '' : validators[id].msg; error.classList.toggle('hidden', valid); }
      return valid;
    }

    // Real-time validation on blur
    Object.keys(validators).forEach(id => {
      const input = $(`#${id}`);
      if (input) input.addEventListener('blur', () => validateField(id));
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      Object.keys(validators).forEach(id => { if (!validateField(id)) valid = false; });

      if (valid) {
        const success = $('#contact-success');
        if (success) success.classList.remove('hidden');
        showToast('Message sent successfully! ✉️', 'success');
        setTimeout(() => {
          form.reset();
          Object.keys(validators).forEach(id => {
            const input = $(`#${id}`);
            if (input) { input.classList.remove('error', 'success'); }
          });
          if (success) success.classList.add('hidden');
        }, 3000);
      } else {
        showToast('Please fix the errors in the form', 'error');
      }
    });
  }

  /* ==============================
   * LANGUAGE & CURRENCY DROPDOWNS
   * ============================== */
  function initLangCurrencyDropdowns() {
    const langMenu = $('#lang-menu');
    const langDropdown = $('#lang-dropdown');
    const langTrigger = langMenu?.querySelector('.flex.items-center');
    const currencyMenu = $('#currency-menu');
    const currencyDropdown = $('#currency-dropdown');
    const currencyTrigger = currencyMenu?.querySelector('.flex.items-center');

    // Language dropdown
    if (langMenu && langDropdown && langTrigger) {
      langTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.toggle('hidden');
        currencyDropdown?.classList.add('hidden');
      });

      langDropdown.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const langCode = link.querySelector('span')?.textContent || link.textContent.trim();
          const flagImg = link.querySelector('img');
          if (flagImg && langTrigger.querySelector('img')) {
            langTrigger.querySelector('img').src = flagImg.src;
          }
          const langLabel = langTrigger.querySelector('.lang-label');
          if (langLabel) langLabel.textContent = langCode;
          langDropdown.classList.add('hidden');
          showToast(`Language changed to ${langCode}`, 'success');
        });
      });
    }

    // Currency dropdown
    if (currencyMenu && currencyDropdown && currencyTrigger) {
      currencyTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        currencyDropdown.classList.toggle('hidden');
        langDropdown?.classList.add('hidden');
      });
    }

    function updateCurrencyDisplay(symbol) {
      const desktopCurrencyLabel = currencyMenu?.querySelector('.currency-label');
      if (desktopCurrencyLabel) desktopCurrencyLabel.textContent = symbol;
      localStorage.setItem('selectedCurrency', symbol);
    }

    // Load saved currency on page load
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      updateCurrencyDisplay(savedCurrency);
    }

    // Desktop currency dropdown click handler
    if (currencyMenu && currencyDropdown) {
      currencyDropdown.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const currencySymbol = link.dataset.symbol;
          const currencyCode = link.textContent.trim();
          updateCurrencyDisplay(currencySymbol);
          currencyDropdown.classList.add('hidden');
          showToast(`Currency changed to ${currencyCode}`, 'success');
        });
      });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
      langDropdown?.classList.add('hidden');
      currencyDropdown?.classList.add('hidden');
    });
  }

  /* ==============================
   * DARK THEME TOGGLE
   * ============================== */
  function initDarkTheme() {
    const toggle = $('#theme-toggle');
    const toggleMobile = $('#theme-toggle-mobile');

    const isDark = localStorage.getItem('darkTheme') === 'true';
    if (isDark) {
      document.body.classList.add('dark-theme');
    }

    function handleToggle() {
      document.body.classList.toggle('dark-theme');
      const isNowDark = document.body.classList.contains('dark-theme');
      localStorage.setItem('darkTheme', isNowDark);
      showToast(isNowDark ? 'Dark theme enabled' : 'Light theme enabled', 'success');
    }

    if (toggle) toggle.addEventListener('click', handleToggle);
    if (toggleMobile) toggleMobile.addEventListener('click', handleToggle);
  }

  /* ==============================
   * SEARCH OVERLAY
   * ============================== */
  function initSearchOverlay() {
    const overlay = $('#search-overlay');
    const input = $('#search-input');
    const results = $('#search-results');
    const closeBtn = $('#search-close');
    const heroBtn = $('#hero-search-btn');
    if (!overlay || !input) return;

    function openSearch() {
      overlay.classList.remove('hidden');
      requestAnimationFrame(() => overlay.classList.add('active'));
      input.focus();
      document.body.style.overflow = 'hidden';
    }

    function closeSearch() {
      overlay.classList.remove('active');
      setTimeout(() => overlay.classList.add('hidden'), 300);
      document.body.style.overflow = '';
      input.value = '';
      if (results) results.innerHTML = '';
    }

    if (heroBtn) heroBtn.addEventListener('click', openSearch);
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeSearch(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) closeSearch();
      // Ctrl/Cmd + K shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
    });

    const doSearch = debounce(query => {
      if (!results) return;
      query = query.toLowerCase().trim();
      if (!query) { results.innerHTML = ''; return; }

      let html = '';
      const matchedTours = store.tours.filter(t => t.title.toLowerCase().includes(query));
      const matchedDests = store.destinations.filter(d => d.name.toLowerCase().includes(query));
      const matchedSpots = store.spots.filter(s => s.name.toLowerCase().includes(query));
      const matchedBlogs = store.blogs.filter(b => b.title.toLowerCase().includes(query));

      if (matchedTours.length) {
        html += '<div class="search-result-category">Tours</div>';
        matchedTours.forEach(t => { html += `<div class="search-result-item"><strong>${t.title}</strong> — $${t.price.toFixed(2)}/person</div>`; });
      }
      if (matchedDests.length) {
        html += '<div class="search-result-category mt-3">Destinations</div>';
        matchedDests.forEach(d => { html += `<div class="search-result-item">${d.name} — ${d.tours} Tours</div>`; });
      }
      if (matchedSpots.length) {
        html += '<div class="search-result-category mt-3">Popular Spots</div>';
        matchedSpots.forEach(s => { html += `<div class="search-result-item">${s.name} — ${s.tours} Tours, ${s.activities} Activities</div>`; });
      }
      if (matchedBlogs.length) {
        html += '<div class="search-result-category mt-3">Blog Posts</div>';
        matchedBlogs.forEach(b => { html += `<div class="search-result-item">${b.title}</div>`; });
      }
      if (!html) html = '<p class="text-sm text-gray-400 py-4 text-center">No results found</p>';
      results.innerHTML = html;
    }, 300);

    input.addEventListener('input', () => doSearch(input.value));
  }

  /* ==============================
   * VIDEO MODAL
   * ============================== */
  function initVideoModal() {
    const modal = $('#video-modal');
    const iframe = $('#video-iframe');
    const playBtn = $('#play-video');
    const closeBtn = $('#video-close');
    const backdrop = $('#video-modal-backdrop');
    if (!modal || !iframe) return;
    const videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';

    function open() {
      modal.classList.remove('hidden');
      iframe.src = videoUrl;
      document.body.style.overflow = 'hidden';
    }
    function close() {
      modal.classList.add('hidden');
      iframe.src = '';
      document.body.style.overflow = '';
    }

    if (playBtn) playBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) close(); });
  }

  /* ==============================
   * BACK TO TOP
   * ============================== */
  function initBackToTop() {
    const btn = $('#back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', throttle(() => {
      if (window.scrollY > 300) {
        btn.classList.remove('hidden');
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
        setTimeout(() => { if (!btn.classList.contains('visible')) btn.classList.add('hidden'); }, 300);
      }
    }, 100));
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ==============================
   * SCROLL ANIMATIONS
   * ============================== */
  function observeAnimations() {
    if (!('IntersectionObserver' in window)) {
      $$('.animate-on-scroll').forEach(el => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    $$('.animate-on-scroll').forEach((el, i) => {
      // Stagger grid children
      const delayClass = `delay-${(i % 3) * 100 + 100}`;
      if (!el.classList.contains('delay-100') && !el.classList.contains('delay-200') && !el.classList.contains('delay-300')) {
        el.classList.add(delayClass);
      }
      observer.observe(el);
    });
  }

  /* ==============================
   * HERO SEARCH TABS
   * ============================== */
  function initSearchTabs() {
    const tabs = $$('.search-tab');
    const forms = $$('.search-form');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.textContent.toLowerCase().trim();
        
        // Update tab states
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        
        // Update form visibility
        forms.forEach(form => {
          form.classList.remove('active');
          if (form.dataset.form === tabName) {
            form.classList.add('active');
          }
        });
      });
    });

    // Search the Popular Spots cards using the selected hero-form values.
    const searchBtns = $$('.hero-search-btn');
    searchBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const activeForm = $('.search-form.active');
        if (!activeForm) return;

        const formType = activeForm.dataset.form;
        const values = Array.from(activeForm.querySelectorAll('select'))
          .map(field => field.value.trim())
          .filter(Boolean);
        const spotsSection = $('#popular-spots');
        const cards = $$('#spots-grid .spot-card');
        const activity = values[0]?.toLowerCase() || '';
        const activityCategory = activity.includes('adventure') || activity.includes('water')
          ? 'adventure'
          : activity.includes('cultural') || activity.includes('food')
            ? 'cultural'
            : activity.includes('sightseeing') ? 'all' : null;

        let matches = 0;
        cards.forEach(card => {
          const searchable = `${card.dataset.spot} ${card.dataset.category}`.toLowerCase();
          const match = formType === 'activities' && activityCategory !== null
            ? activityCategory === 'all' || card.dataset.category === activityCategory
            : values.some(value => searchable.includes(value.toLowerCase()));
          card.style.display = match ? 'block' : 'none';
          if (match) matches++;
        });

        if (!matches) {
          showToast(`No Popular Spots are available for ${values[0] || formType}.`, 'error');
          return;
        }

        spotsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showToast(`Showing ${matches} Popular Spot${matches === 1 ? '' : 's'} for ${values[0] || formType}.`, 'success');
      });
    });
  }

  /* ==============================
   * MOBILE DROPDOWNS
   * ============================== */
  function initMobileDropdowns() {
    const dropdownBtns = $$('.mobile-dropdown-btn');
    
    dropdownBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        // Find the dropdown content within the same parent li
        const dropdownLi = btn.closest('.mobile-dropdown');
        if (!dropdownLi) return;
        const content = dropdownLi.querySelector('.mobile-dropdown-content');
        if (!content) return;
        
        const isOpen = content.classList.contains('show');
        
        // Close all other dropdowns
        $$('.mobile-dropdown-content').forEach(c => c.classList.remove('show'));
        $$('.mobile-dropdown-btn').forEach(b => b.classList.remove('open'));
        
        // Toggle current dropdown
        if (!isOpen) {
          content.classList.add('show');
          btn.classList.add('open');
        }
      });
    });

    // Handle ALL mobile nav link clicks - navigate to section and close menu
    $$('#mobile-menu .mobile-nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = $(href);
          if (target) {
            // Close mobile menu first
            const mobileMenu = $('#mobile-menu');
            if (mobileMenu && mobileMenu._close) {
              mobileMenu._close();
            }
            // Smooth scroll to section after a brief delay for menu close animation
            setTimeout(() => {
              target.scrollIntoView({ behavior: 'smooth' });
            }, 150);
          }
        }
      });
    });
  }

  /* ==============================
   * DEMO MODAL (Generalized)
   * ============================== */
  function initDemoModal() {
    const demoModal = $('#demo-modal');
    const closeDemoModal = $('#close-demo-modal');
    const demoModalOk = $('#demo-modal-ok');

    function openDemoModal() {
      if (demoModal) {
        demoModal.classList.remove('hidden');
        demoModal.classList.add('flex');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeDemoModalFn() {
      if (demoModal) {
        demoModal.classList.add('hidden');
        demoModal.classList.remove('flex');
        document.body.style.overflow = '';
      }
    }

    if (closeDemoModal) closeDemoModal.addEventListener('click', closeDemoModalFn);
    if (demoModalOk) demoModalOk.addEventListener('click', closeDemoModalFn);
    if (demoModal) {
      demoModal.addEventListener('click', (e) => {
        if (e.target === demoModal) closeDemoModalFn();
      });
    }

    // Link all elements with data-demo-link attribute
    document.addEventListener('click', e => {
      const link = e.target.closest('[data-demo-link]');
      if (link) {
        e.preventDefault();
        openDemoModal();
      }
    });
  }

  /* ==============================
   * BOOK NOW BUTTONS (delegation)
   * ============================== */
  function initBookNow() {
    const bookingModal = $('#booking-modal');
    const closeBookingModal = $('#close-booking-modal');
    const bookingForm = $('#booking-form');
    let lastClickedBtn = null;

    document.addEventListener('click', e => {
      const btn = e.target.closest('.book-now-btn');
      if (!btn) return;
      lastClickedBtn = btn;
      const card = btn.closest('.tour-card');
      const name = card ? card.querySelector('h3')?.textContent?.trim() : 'this tour';
      
      // Open booking modal
      if (bookingModal) {
        bookingModal.classList.remove('hidden');
        bookingModal.classList.add('flex');
        document.body.style.overflow = 'hidden';
      }
    });

    // Close booking modal
    if (closeBookingModal) {
      closeBookingModal.addEventListener('click', () => {
        bookingModal.classList.add('hidden');
        bookingModal.classList.remove('flex');
        document.body.style.overflow = '';
      });
    }

    // Close modal on backdrop click
    if (bookingModal) {
      bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
          bookingModal.classList.add('hidden');
          bookingModal.classList.remove('flex');
          document.body.style.overflow = '';
        }
      });
    }

    // Handle booking form submission
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(bookingForm);
        const data = Object.fromEntries(formData);
        
        // Validate
        if (!data.fullName || !data.email || !data.phone || !data.travelDate || !data.guests) {
          showToast('Please fill in all required fields', 'error');
          return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          showToast('Please enter a valid email address', 'error');
          return;
        }

        // Phone validation (basic)
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        if (!phoneRegex.test(data.phone)) {
          showToast('Please enter a valid phone number', 'error');
          return;
        }

        // Success
        showToast('Booking submitted successfully! We will contact you soon.', 'success');
        
        // Change button state
        if (lastClickedBtn) {
          lastClickedBtn.textContent = 'Booked';
          lastClickedBtn.classList.add('booked');
          lastClickedBtn.disabled = true;
          lastClickedBtn.style.backgroundColor = '#22C55E';
          lastClickedBtn.style.color = '#fff';
        }
        
        bookingForm.reset();
        bookingModal.classList.add('hidden');
        bookingModal.classList.remove('flex');
        document.body.style.overflow = '';
      });
    }
  }

  /* ==============================
   * SIGN IN MODAL
   * ============================== */
  function initSignInModal() {
    const signinModal = $('#signin-modal');
    const closeSigninModal = $('#close-signin-modal');
    const signinForm = $('#signin-form');
    const signinBtn = $('#signin-btn');

    // Open sign in modal
    if (signinBtn) {
      signinBtn.addEventListener('click', () => {
        if (signinModal) {
          signinModal.classList.remove('hidden');
          signinModal.classList.add('flex');
          document.body.style.overflow = 'hidden';
        }
      });
    }

    // Mobile sign in button
    ['#mobile-signin-btn', '#mobile-header-signin-btn'].forEach(selector => {
      const mobileSigninBtn = $(selector);
      mobileSigninBtn?.addEventListener('click', () => {
        if (signinModal) {
          signinModal.classList.remove('hidden');
          signinModal.classList.add('flex');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    // Close sign in modal
    if (closeSigninModal) {
      closeSigninModal.addEventListener('click', () => {
        signinModal.classList.add('hidden');
        signinModal.classList.remove('flex');
        document.body.style.overflow = '';
      });
    }

    // Close modal on backdrop click
    if (signinModal) {
      signinModal.addEventListener('click', (e) => {
        if (e.target === signinModal) {
          signinModal.classList.add('hidden');
          signinModal.classList.remove('flex');
          document.body.style.overflow = '';
        }
      });
    }

    // Handle sign in form submission
    if (signinForm) {
      signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(signinForm);
        const data = Object.fromEntries(formData);
        
        // Validate
        if (!data.email || !data.password) {
          showToast('Please fill in all required fields', 'error');
          return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          showToast('Please enter a valid email address', 'error');
          return;
        }

        // Password validation
        if (data.password.length < 6) {
          showToast('Password must be at least 6 characters', 'error');
          return;
        }

        // Success
        showToast('Signed in successfully!', 'success');
        
        // Update sign in button to show username/email
        const userEmail = data.email;
        if (signinBtn) {
          signinBtn.textContent = userEmail.split('@')[0];
        }
        
        signinForm.reset();
        signinModal.classList.add('hidden');
        signinModal.classList.remove('flex');
        document.body.style.overflow = '';
      });
    }
  }

  /* ==============================
   * CHATBOT
   * ============================== */
  // Travila Knowledge Base - Pre-filled Q&A data
  const travilaKnowledgeBase = [
    {
      keywords: ['what', 'travila', 'about', 'company', 'service'],
      answer: "Travila is your ultimate travel companion. We offer tour bookings, hotel reservations, ticket bookings, and rental services. We help you discover dream destinations worldwide with curated travel experiences."
    },
    {
      keywords: ['book', 'booking', 'tour', 'how', 'reserve'],
      answer: "To book a tour, browse our featured tours section, select your desired tour, and click the 'Book Now' button. You'll be prompted to fill in your details, and our team will contact you to confirm your booking."
    },
    {
      keywords: ['destination', 'popular', 'place', 'where', 'go'],
      answer: "We offer tours to popular destinations in Europe, Asia, and the Americas. Some of our top destinations include Paris, Tokyo, New York, Bali, and many more. Check our 'Popular Destinations' section for the full list!"
    },
    {
      keywords: ['price', 'cost', 'expensive', 'cheap', 'budget'],
      answer: "Our tour prices vary depending on the destination, duration, and type of tour. We offer budget-friendly options as well as luxury experiences. Each tour listing shows the price upfront so you can plan accordingly."
    },
    {
      keywords: ['cancel', 'refund', 'policy'],
      answer: "Our cancellation policy varies by tour. Generally, cancellations made 7 days before the tour are eligible for a full refund. For specific policies, please check the tour details or contact our support team."
    },
    {
      keywords: ['payment', 'pay', 'method', 'card'],
      answer: "We accept various payment methods including credit cards, debit cards, and online payment platforms. Payment is processed securely through our booking system."
    },
    {
      keywords: ['hotel', 'accommodation', 'stay', 'room'],
      answer: "Yes, we offer hotel booking services! You can find luxury hotels, budget accommodations, and resorts through our platform. Use our search feature to find the perfect stay for your trip."
    },
    {
      keywords: ['contact', 'support', 'help', 'email', 'phone'],
      answer: "You can contact us through the 'Contact Us' section in our footer, or email us at support@travila.com. Our support team is available 24/7 to assist you with any questions."
    },
    {
      keywords: ['sign', 'login', 'account', 'register'],
      answer: "To create an account, click the 'Sign In' button in the navigation bar and select the option to register. Having an account allows you to manage your bookings, save favorites, and get personalized recommendations."
    },
    {
      keywords: ['review', 'rating', 'testimonial'],
      answer: "We value customer feedback! You can read reviews from other travelers in our 'They Love Travila' section. After completing a tour, you'll also be invited to leave your own review."
    },
    {
      keywords: ['group', 'family', 'honeymoon', 'adventure'],
      answer: "We offer specialized tours for different travel styles including family tours, honeymoon packages, and adventure tours. Each tour type is designed to provide the best experience for your specific travel needs."
    },
    {
      keywords: ['visa', 'passport', 'document', 'travel'],
      answer: "Visa requirements depend on your destination and nationality. We provide general guidance, but we recommend checking with the embassy of your destination country for the most up-to-date visa requirements."
    },
    {
      keywords: ['insurance', 'travel', 'protect'],
      answer: "We recommend purchasing travel insurance for your trip. While we don't directly sell insurance, we can provide recommendations for trusted travel insurance providers."
    },
    {
      keywords: ['custom', 'customize', 'personalize', 'tailor'],
      answer: "Yes! We offer customizable tour packages. Contact our team with your preferences, and we'll create a personalized itinerary that matches your interests, budget, and schedule."
    },
    {
      keywords: ['discount', 'offer', 'deal', 'promo'],
      answer: "We regularly offer special promotions and discounts. Check our promo banners on the homepage for current deals, and subscribe to our newsletter to receive exclusive offers directly in your inbox."
    }
  ];

  // Keywords that indicate non-Travila related questions
  const nonTravilaKeywords = [
    'weather', 'news', 'politics', 'sports', 'cooking', 'recipe',
    'programming', 'coding', 'tech', 'gaming', 'movie', 'music',
    'stock', 'crypto', 'finance', 'investment', 'health', 'medical',
    'joke', 'riddle', 'math', 'science', 'history', 'general'
  ];

  function initChatbot() {
    const toggleBtn = $('#chatbot-toggle');
    const closeBtn = $('#chatbot-close');
    const chatWindow = $('#chatbot-window');
    const input = $('#chatbot-input');
    const sendBtn = $('#chatbot-send');
    const messagesContainer = $('#chatbot-messages');

    if (!toggleBtn || !chatWindow) return;

    // Toggle chat window
    toggleBtn.addEventListener('click', () => {
      const isClosed = chatWindow.classList.contains('chatbot-closed');
      if (isClosed) {
        chatWindow.classList.remove('chatbot-closed');
        if (input) input.focus();
      } else {
        chatWindow.classList.add('chatbot-closed');
      }
    });

    closeBtn.addEventListener('click', () => {
      chatWindow.classList.add('chatbot-closed');
    });

    // Send message function
    function sendMessage() {
      const message = input.value.trim();
      if (!message) return;

      // Add user message
      addMessage(message, 'user');
      input.value = '';

      // Process and respond
      setTimeout(() => {
        const response = processMessage(message);
        addMessage(response, 'bot');
      }, 500);
    }

    // Add message to chat
    function addMessage(text, sender) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'flex items-start gap-2';

      if (sender === 'bot') {
        messageDiv.innerHTML = `
          <div class="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-[#FEFA17]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%]">
            <p class="text-sm text-gray-700">${text}</p>
          </div>
        `;
      } else {
        messageDiv.className = 'flex items-start gap-2 justify-end';
        messageDiv.innerHTML = `
          <div class="bg-black p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%]">
            <p class="text-sm text-white">${text}</p>
          </div>
        `;
      }

      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Process user message and find matching answer
    function processMessage(message) {
      const lowerMessage = message.toLowerCase();

      // Check for non-Travila related keywords
      const isNonTravila = nonTravilaKeywords.some(keyword => 
        lowerMessage.includes(keyword)
      );

      if (isNonTravila) {
        return "I can only help with questions related to Travila's travel services, tours, destinations, and bookings. Please ask me something about our travel offerings!";
      }

      // Find best matching answer
      let bestMatch = null;
      let highestScore = 0;

      travilaKnowledgeBase.forEach(item => {
        let score = 0;
        item.keywords.forEach(keyword => {
          if (lowerMessage.includes(keyword.toLowerCase())) {
            score++;
          }
        });

        if (score > highestScore) {
          highestScore = score;
          bestMatch = item;
        }
      });

      if (bestMatch && highestScore > 0) {
        return bestMatch.answer;
      }

      // Default response
      return "I'm not sure I understand. I can help you with questions about Travila's tours, destinations, bookings, hotels, and travel services. Could you please rephrase your question?";
    }

    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  /* ==============================
   * INITIALIZATION
   * ============================== */
  document.addEventListener('DOMContentLoaded', async () => {
    // Load all dynamic data in parallel
    await Promise.allSettled([
      loadTours(),
      loadBlogs(),
      loadDestinations(),
      loadSpots(),
      loadTestimonials()
    ]);

    // Initialize all interactive features
    initDropdowns();
    initMobileMenu();
    initMobileDropdowns();
    initLangCurrencyDropdowns();
    initDarkTheme();
    initDemoModal();
    initSearchTabs();
    initDestinationsCarousel();
    initPromoCarousel();
    initTestimonialsCarousel();
    initTourFilters();
    initLoadMore();
    initWishlist();
    initStickyHeader();
    initNewsletter();
    initAccordion();
    initContactForm();
    initSearchOverlay();
    initVideoModal();
    initBackToTop();
    initBookNow();
    initSignInModal();
    initChatbot();
    observeAnimations();
  });
})();
