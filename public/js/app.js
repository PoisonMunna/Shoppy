document.addEventListener('DOMContentLoaded', () => {
  // Application State
  let products = [];
  let cart = JSON.parse(localStorage.getItem('aethera_cart')) || [];
  let currentUser = JSON.parse(sessionStorage.getItem('aethera_user')) || null;
  const API_BASE = window.location.port === '5000' ? '' : 'http://localhost:5000';

  // DOM Elements
  const header = document.getElementById('header');
  const productsGrid = document.getElementById('products-grid');
  const categoryFilters = document.getElementById('category-filters');
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('overlay');
  const cartBadgeCount = document.getElementById('cart-badge-count');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartTotal = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');



  // Auth Modal Elements
  const authModal = document.getElementById('auth-modal');
  const authToggleBtn = document.getElementById('auth-toggle-btn');
  const authCloseBtn = document.getElementById('auth-close-btn');
  const tabClient = document.getElementById('tab-client');
  const tabAdmin = document.getElementById('tab-admin');
  const formClient = document.getElementById('form-client');
  const formClientSignup = document.getElementById('form-client-signup');
  const formAdmin = document.getElementById('form-admin');
  const toggleSignup = document.getElementById('toggle-signup');
  const toggleSignin = document.getElementById('toggle-signin');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const productModal = document.getElementById('product-modal');
  const productCloseBtn = document.getElementById('product-close-btn');
  const productDetailContent = document.getElementById('product-detail-content');

  // Views & Page Elements
  const heroSection = document.querySelector('.hero');
  const shopSection = document.querySelector('.shop-section');
  const adminPanelSection = document.getElementById('admin-panel');
  const navStoreLink = document.getElementById('nav-store-link');
  const navAdminLink = document.getElementById('nav-admin-link');
  const exitAdminBtn = document.getElementById('exit-admin-btn');
  const logoLink = document.getElementById('logo-link');

  // Admin Panel Elements
  const adminInventoryList = document.getElementById('admin-inventory-list');
  const adminAddProductForm = document.getElementById('admin-add-product-form');

  // Change header background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });



  // ==========================================
  // 2. Fetch & Render Catalog
  // ==========================================
  const fallbackProducts = [
    {
      _id: "6650a2b9d01248001d2d3a01",
      title: "Aethera Mechanical Keyboard",
      description: "Compact 75% mechanical keyboard with translucent keycaps, hot-swappable linear tactile switches, and addressable neon RGB backlighting. Premium aluminum and obsidian casing.",
      price: 189.99,
      imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80",
      stockCount: 15,
      category: "Peripherals",
      rating: 4.8
    },
    {
      _id: "6650a2b9d01248001d2d3a02",
      title: "Nova HUD Visor V2",
      description: "Cyberpunk HUD smart visor glasses featuring an OLED heads-up display, real-time ambient data translation, and high-fidelity bone conduction audio.",
      price: 299.99,
      imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80",
      stockCount: 8,
      category: "Wearables",
      rating: 4.9
    },
    {
      _id: "6650a2b9d01248001d2d3a03",
      title: "Helios Prism Lamp",
      description: "Holographic projection lamp capable of producing 16 million colors and casting mesmerizing fractal patterns on your room walls via customizable apps.",
      price: 89.99,
      imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
      stockCount: 22,
      category: "Gear",
      rating: 4.3
    },
    {
      _id: "6650a2b9d01248001d2d3a04",
      title: "Chronos NFC Smart Ring",
      description: "Titanium smart ring that tracks biometric health patterns, integrates contactless NFC payments, and features a glowing cyan status pulse.",
      price: 149.99,
      imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
      stockCount: 30,
      category: "Wearables",
      rating: 4.6
    },
    {
      _id: "6650a2b9d01248001d2d3a05",
      title: "Obsidian Desk Mat",
      description: "Liquid-resistant textured desk mat with an integrated RGB 15W wireless charging pad and toxic-green neon circuitry detailing.",
      price: 45.99,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
      stockCount: 50,
      category: "Peripherals",
      rating: 4.5
    },
    {
      _id: "6650a2b9d01248001d2d3a06",
      title: "Viper Gaming Mouse",
      description: "Ultralight wireless mouse featuring modular weights, a 26k DPI optical sensor, and electric cyan grip accents with zero-latency response.",
      price: 119.99,
      imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
      stockCount: 12,
      category: "Peripherals",
      rating: 4.7
    }
  ];

  // Fetch Products from Backend
  async function fetchProducts() {
    try {
      const response = await fetch(`${API_BASE}/api/products`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      products = await response.json();
      renderProducts(products);
      renderAdminInventory();
    } catch (error) {
      console.warn('API fetch failed, engaging frontend sandbox mode:', error.message);
      // Failover to client-side data
      products = [...fallbackProducts];
      renderProducts(products);
      renderAdminInventory();
      
      // Inject a warning banner in the catalog header to notify developer
      const titleSection = document.getElementById('categories');
      if (titleSection) {
        titleSection.innerHTML = `
          <span style="color: var(--accent-pink);">[LOCAL SANDBOX MODE]</span>
          <h2>System Catalog</h2>
        `;
      }
    }
  }

  function renderProducts(productsToRender) {
    if (productsToRender.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0; color: var(--text-secondary);">
          <i data-lucide="inbox" style="margin: 0 auto 1rem auto; width: 44px; height: 44px;"></i>
          <p>No equipment matches your search criteria.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    productsGrid.innerHTML = productsToRender.map(product => `
      <article class="product-card" style="cursor: pointer;">
        <div class="product-image-wrapper">
          <img src="${product.imageUrl}" alt="${product.title}" class="product-image" onerror="this.src='https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80'">
          <span class="product-badge">${product.stockCount > 0 ? `${product.stockCount} in stock` : 'Out of stock'}</span>
        </div>
        <div class="product-info">
          <span class="product-category">${product.category}</span>
          <h3 class="product-title">${product.title}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-footer">
            <span class="product-price">${product.price.toFixed(2)}</span>
            <button class="add-to-cart-btn" data-id="${product._id}" aria-label="Add ${product.title} to cart" ${product.stockCount === 0 ? 'disabled' : ''}>
              <i data-lucide="plus"></i>
            </button>
          </div>
        </div>
      </article>
    `).join('');

    // Attach Add to Cart Listeners
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid triggering product card popup
        const id = button.getAttribute('data-id');
        addToCart(id);
      });
    });

    // Attach Card Click Listeners for Detail Popups
    document.querySelectorAll('.product-card').forEach((card, index) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart-btn')) return;
        openProductPopup(productsToRender[index]);
      });
    });

    lucide.createIcons();
  }

  // ==========================================
  // 2.5 Product Detail Modal
  // ==========================================
  function openProductPopup(product) {
    const starsHtml = [];
    const ratingVal = product.rating || 4.5;
    const fullStars = Math.floor(ratingVal);
    const hasHalfStar = ratingVal % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        starsHtml.push('<i data-lucide="star" style="width: 18px; height: 18px; fill: #ffb800; color: #ffb800;"></i>');
      } else if (i === fullStars + 1 && hasHalfStar) {
        starsHtml.push('<i data-lucide="star-half" style="width: 18px; height: 18px; fill: #ffb800; color: #ffb800;"></i>');
      } else {
        starsHtml.push('<i data-lucide="star" style="width: 18px; height: 18px; color: var(--text-secondary);"></i>');
      }
    }

    productDetailContent.innerHTML = `
      <div class="product-popup-layout">
        <div class="product-popup-image-wrapper">
          <img src="${product.imageUrl}" alt="${product.title}" onerror="this.src='https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80'">
        </div>
        <div class="product-popup-info">
          <span class="product-category">${product.category}</span>
          <h2 class="product-popup-title">${product.title}</h2>
          
          <div class="product-popup-rating-container">
            <div class="product-popup-stars">
              ${starsHtml.join('')}
            </div>
            <span class="product-popup-rating-value">${ratingVal.toFixed(1)} / 5.0</span>
          </div>

          <p class="product-popup-description">${product.description}</p>
          
          <div class="product-popup-meta">
            <div class="product-popup-price">$${product.price.toFixed(2)}</div>
            <div class="product-popup-stock ${product.stockCount > 0 ? 'in-stock' : 'out-of-stock'}">
              ${product.stockCount > 0 ? `${product.stockCount} units available` : 'Out of Stock'}
            </div>
          </div>

          <div class="product-popup-actions">
            <button class="btn btn-primary popup-add-btn" data-id="${product._id}" ${product.stockCount === 0 ? 'disabled' : ''} style="width: 100%;">
              <i data-lucide="shopping-cart"></i>
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    `;

    productModal.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Attach Add to Cart listener for the popup button
    productDetailContent.querySelector('.popup-add-btn').addEventListener('click', () => {
      addToCart(product._id);
      closeProductPopup();
    });

    lucide.createIcons();
  }

  function closeProductPopup() {
    productModal.classList.remove('active');
    if (!cartDrawer.classList.contains('open') && !authModal.classList.contains('active')) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  productCloseBtn.addEventListener('click', closeProductPopup);

  // Filter Categories Listener
  categoryFilters.addEventListener('click', (e) => {
    if (!e.target.classList.contains('category-btn')) return;

    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    const category = e.target.getAttribute('data-category').toLowerCase();
    
    if (category === 'all') {
      renderProducts(products);
    } else {
      const filtered = products.filter(p => p.category.toLowerCase() === category);
      renderProducts(filtered);
    }
  });

  // ==========================================
  // 3. Cart State Logic
  // ==========================================
  function openCart() {
    cartDrawer.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  cartToggleBtn.addEventListener('click', openCart);
  cartCloseBtn.addEventListener('click', closeCart);

  function addToCart(productId) {
    const product = products.find(p => p._id === productId);
    if (!product || product.stockCount <= 0) return;

    const cartItemIndex = cart.findIndex(item => item.product._id === productId);

    if (cartItemIndex > -1) {
      if (cart[cartItemIndex].quantity < product.stockCount) {
        cart[cartItemIndex].quantity += 1;
      } else {
        alert(`System limit: Cannot exceed available stock (${product.stockCount} units) for ${product.title}.`);
        return;
      }
    } else {
      cart.push({
        product: {
          _id: product._id,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
          stockCount: product.stockCount
        },
        quantity: 1
      });
    }

    saveCart();
    renderCart();
    openCart();
  }

  function updateQuantity(productId, delta) {
    const cartItemIndex = cart.findIndex(item => item.product._id === productId);
    if (cartItemIndex === -1) return;

    const cartItem = cart[cartItemIndex];
    const newQuantity = cartItem.quantity + delta;

    if (newQuantity <= 0) {
      cart.splice(cartItemIndex, 1);
    } else if (newQuantity <= cartItem.product.stockCount) {
      cartItem.quantity = newQuantity;
    } else {
      alert(`System limit: Cannot exceed available stock (${cartItem.product.stockCount} units).`);
    }

    saveCart();
    renderCart();
  }

  function removeItem(productId) {
    cart = cart.filter(item => item.product._id !== productId);
    saveCart();
    renderCart();
  }

  function saveCart() {
    localStorage.setItem('aethera_cart', JSON.stringify(cart));
  }

  function renderCart() {
    const totalItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
    cartBadgeCount.textContent = totalItemsCount;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart-message">
          <i data-lucide="shopping-cart" class="empty-cart-icon"></i>
          <p>Your equipment deck is empty.</p>
        </div>
      `;
      cartTotal.textContent = '$0.00';
      lucide.createIcons();
      return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.product.imageUrl}" alt="${item.product.title}" class="cart-item-image" onerror="this.src='https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80'">
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.product.title}</h4>
          <span class="cart-item-price">$${(item.product.price * item.quantity).toFixed(2)}</span>
          <div class="cart-item-controls">
            <div class="quantity-controller">
              <button class="qty-btn minus-btn" data-id="${item.product._id}">-</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn plus-btn" data-id="${item.product._id}">+</button>
            </div>
            <button class="remove-item-btn" data-id="${item.product._id}">Remove</button>
          </div>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.qty-btn.minus-btn').forEach(btn => {
      btn.addEventListener('click', () => updateQuantity(btn.getAttribute('data-id'), -1));
    });

    document.querySelectorAll('.qty-btn.plus-btn').forEach(btn => {
      btn.addEventListener('click', () => updateQuantity(btn.getAttribute('data-id'), 1));
    });

    document.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', () => removeItem(btn.getAttribute('data-id')));
    });

    const subtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    cartTotal.textContent = `$${subtotal.toFixed(2)}`;

    lucide.createIcons();
  }

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Cart is empty.');
      return;
    }

    const email = currentUser ? (currentUser.email || currentUser.username) : prompt("Enter your Neural ID (Email) to authorize transaction:");
    if (!email) return;

    if (!/^\S+@\S+\.\S+$/.test(email) && email !== 'admin') {
      alert("Invalid email format. Transaction aborted.");
      return;
    }

    const orderData = {
      email: email,
      items: cart.map(item => ({
        product: { _id: item.product._id, title: item.product.title, price: item.product.price },
        quantity: item.quantity
      }))
    };

    fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.message); });
      }
      return res.json();
    })
    .then(data => {
      if (data.success) {
        alert(`Transaction logged successfully!\nOrder Node ID: ${data.orderId}\nTotal Subtotal: $${data.total.toFixed(2)}`);
        cart = [];
        saveCart();
        renderCart();
        closeCart();
        // Reload storefront products to show updated stock counts
        fetchProducts();
      } else {
        alert(`Transaction failed: ${data.message}`);
      }
    })
    .catch(err => {
      console.error(err);
      alert(`Failed to complete transaction: ${err.message}`);
    });
  });

  // ==========================================
  // 4. Access Portal Modal & Authentication
  // ==========================================
  function openAuthModal() {
    if (currentUser) {
      // If already logged in, prompt logout
      const identStr = currentUser.role === 'admin' ? `Admin (${currentUser.username})` : `Client (${currentUser.email})`;
      if (confirm(`Connected session found:\nNode ID: ${identStr}\n\nDisconnect from AETHERA network?`)) {
        logout();
      }
      return;
    }
    authModal.classList.add('active');
    overlay.classList.add('active');
  }

  function closeAuthModal() {
    authModal.classList.remove('active');
    overlay.classList.remove('active');
  }

  authToggleBtn.addEventListener('click', openAuthModal);
  authCloseBtn.addEventListener('click', closeAuthModal);

  // Overlay click handles closing of all overlays and modals
  overlay.addEventListener('click', () => {
    closeCart();
    closeAuthModal();
    closeProductPopup();
  });

  // Tab selections
  tabClient.addEventListener('click', () => {
    tabClient.classList.add('active');
    tabAdmin.classList.remove('active');
    formClient.classList.remove('hidden');
    formClientSignup.classList.add('hidden');
    formAdmin.classList.add('hidden');
    authModal.classList.remove('admin-mode');
  });

  tabAdmin.addEventListener('click', () => {
    tabAdmin.classList.add('active');
    tabClient.classList.remove('active');
    formAdmin.classList.remove('hidden');
    formClient.classList.add('hidden');
    formClientSignup.classList.add('hidden');
    authModal.classList.add('admin-mode');
  });

  // Toggle between Client Login and Signup
  toggleSignup.addEventListener('click', (e) => {
    e.preventDefault();
    formClient.classList.add('hidden');
    formClientSignup.classList.remove('hidden');
  });

  toggleSignin.addEventListener('click', (e) => {
    e.preventDefault();
    formClientSignup.classList.add('hidden');
    formClient.classList.remove('hidden');
  });

  // Client Signup Form Submit
  formClientSignup.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    fetch(`${API_BASE}/api/auth/client-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.message); });
      }
      return res.json();
    })
    .then(data => {
      if (data.success) {
        currentUser = { email: data.email, role: 'client' };
        sessionStorage.setItem('aethera_user', JSON.stringify(currentUser));
        updateAuthUI();
        closeAuthModal();
        formClientSignup.reset();
        alert(`Secure deck registered and established. Welcome Client: ${data.email}`);
      } else {
        alert(`Registration failed: ${data.message}`);
      }
    })
    .catch(err => {
      console.error(err);
      alert(`Failed to connect to registration server: ${err.message}`);
    });
  });

  // Client form submit
  formClient.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('client-email').value;
    const password = document.getElementById('client-password').value;
    fetch(`${API_BASE}/api/auth/client-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.message); });
      }
      return res.json();
    })
    .then(data => {
      if (data.success) {
        currentUser = { email: data.email, role: 'client' };
        sessionStorage.setItem('aethera_user', JSON.stringify(currentUser));
        updateAuthUI();
        closeAuthModal();
        formClient.reset();
        alert(`Secure deck established. Welcome Client: ${data.email}`);
      } else {
        alert(`Authorization failed: ${data.message}`);
      }
    })
    .catch(err => {
      console.error(err);
      alert(`Failed to connect to authentication server: ${err.message}`);
    });
  });

  // Admin form submit
  formAdmin.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('admin-id').value;
    const password = document.getElementById('admin-passcode').value;
    fetch(`${API_BASE}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.message); });
      }
      return res.json();
    })
    .then(data => {
      if (data.success) {
        currentUser = { username: data.username, role: 'admin' };
        sessionStorage.setItem('aethera_user', JSON.stringify(currentUser));
        updateAuthUI();
        closeAuthModal();
        formAdmin.reset();
        alert(`Console override engaging... Welcome Admin: ${data.username}`);
        showView('admin');
      } else {
        alert(`Authorization failed: ${data.message}`);
      }
    })
    .catch(err => {
      console.error(err);
      alert(`Failed to connect to authentication server: ${err.message}`);
    });
  });

  function logout() {
    currentUser = null;
    sessionStorage.removeItem('aethera_user');
    updateAuthUI();
    showView('store');
    alert("Connection terminated safely. System reverted to default deck.");
  }

  function updateAuthUI() {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        authToggleBtn.innerHTML = `<div class="user-initials-badge admin-badge">AD</div>`;
        navAdminLink.classList.remove('hidden');
      } else {
        const initials = currentUser.email.substring(0, 2).toUpperCase();
        authToggleBtn.innerHTML = `<div class="user-initials-badge">${initials}</div>`;
        navAdminLink.classList.add('hidden');
      }
    } else {
      authToggleBtn.innerHTML = `<i data-lucide="user"></i>`;
      navAdminLink.classList.add('hidden');
      lucide.createIcons();
    }
  }

  // ==========================================
  // 5. SPA View Swapper
  // ==========================================
  function showView(viewName) {
    // Reset active nav styling
    navStoreLink.classList.remove('active');
    navAdminLink.classList.remove('active');

    if (viewName === 'admin') {
      heroSection.classList.add('hidden');
      shopSection.classList.add('hidden');
      adminPanelSection.classList.remove('hidden');
      navAdminLink.classList.add('active');
      renderAdminInventory();
      fetchAdminOrders();
    } else {
      heroSection.classList.remove('hidden');
      shopSection.classList.remove('hidden');
      adminPanelSection.classList.add('hidden');
      navStoreLink.classList.add('active');
    }
  }

  navStoreLink.addEventListener('click', (e) => {
    e.preventDefault();
    showView('store');
  });

  logoLink.addEventListener('click', (e) => {
    e.preventDefault();
    showView('store');
  });

  navAdminLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentUser && currentUser.role === 'admin') {
      showView('admin');
    }
  });

  exitAdminBtn.addEventListener('click', () => {
    showView('store');
  });

  // Route scrolling support
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#admin-panel') return;
      
      e.preventDefault();
      
      // If we are currently in admin view, return to store view first
      if (!adminPanelSection.classList.contains('hidden')) {
        showView('store');
      }

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // offset header height
          behavior: 'smooth'
        });
      }
    });
  });

  // ==========================================
  // 6. Admin Dashboard Actions
  // ==========================================
  function renderAdminInventory() {
    adminInventoryList.innerHTML = products.map(product => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <img src="${product.imageUrl}" alt="${product.title}" style="width: 36px; height: 36px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-glass);">
            <span style="font-weight: 600;">${product.title}</span>
          </div>
        </td>
        <td>${product.category}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td>${product.stockCount}</td>
        <td>
          <div class="admin-actions-cell">
            <button class="btn-icon delete-product-btn" data-id="${product._id}" title="Decommission Listing">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Attach delete listeners
    document.querySelectorAll('.delete-product-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteProduct(id);
      });
    });

    lucide.createIcons();
  }

  function deleteProduct(productId) {
    if (confirm('Decommission this listing from active system inventory?')) {
      fetch(`${API_BASE}/api/products/${productId}`, {
        method: 'DELETE'
      })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.message); });
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          products = products.filter(p => p._id !== productId);
          renderProducts(products);
          renderAdminInventory();
          alert('Listing decommissioned successfully.');
        } else {
          alert(`Failed to delete product: ${data.message}`);
        }
      })
      .catch(err => {
        console.error(err);
        alert(`Error deleting product: ${err.message}`);
      });
    }
  }

  adminAddProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('new-product-title').value;
    const price = parseFloat(document.getElementById('new-product-price').value);
    const stockCount = parseInt(document.getElementById('new-product-stock').value);
    const category = document.getElementById('new-product-category').value;
    const imageUrl = document.getElementById('new-product-image').value;
    const description = document.getElementById('new-product-desc').value;

    const newProduct = {
      title,
      price,
      stockCount,
      category,
      imageUrl,
      description
    };

    fetch(`${API_BASE}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newProduct)
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.message); });
      }
      return res.json();
    })
    .then(data => {
      if (data.success) {
        // Prepend to array to show instantly
        products.unshift(data.product);
        renderProducts(products);
        renderAdminInventory();

        // Reset Form fields
        adminAddProductForm.reset();
        document.getElementById('new-product-image').value = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80";

        alert(`Listing injected successfully: ${title}`);
      } else {
        alert(`Failed to add product: ${data.message}`);
      }
    })
    .catch(err => {
      console.error(err);
      alert(`Error adding product: ${err.message}`);
    });
  });

  // Fetch admin orders from database
  const adminOrdersList = document.getElementById('admin-orders-list');

  function fetchAdminOrders() {
    fetch(`${API_BASE}/api/admin/orders`)
      .then(res => res.json())
      .then(orders => {
        renderAdminOrders(orders);
      })
      .catch(err => {
        console.error("Failed to load transactions feed:", err);
        adminOrdersList.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--accent-pink);">Failed to connect to transaction telemetry feed.</td></tr>`;
      });
  }

  function renderAdminOrders(orders) {
    if (!orders || orders.length === 0) {
      adminOrdersList.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No client transactions logged in database.</td></tr>`;
      return;
    }

    adminOrdersList.innerHTML = orders.map(order => {
      const itemsList = order.items.map(item => {
        const itemTitle = item.product ? item.product.title : 'Decommissioned Item';
        return `${itemTitle} (x${item.quantity})`;
      }).join(', ');

      const clientName = order.user ? order.user.name : 'Guest User';
      const clientEmail = order.user ? order.user.email : 'Guest';
      const syncTime = new Date(order.createdAt).toLocaleString();

      return `
        <tr>
          <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-muted);">${order._id}</td>
          <td>
            <div style="display: flex; flex-direction: column;">
              <span style="font-weight: 600;">${clientName}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${clientEmail}</span>
            </div>
          </td>
          <td style="max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${itemsList}">${itemsList}</td>
          <td style="font-weight: 700; color: #fff;">$${order.totalAmount.toFixed(2)}</td>
          <td>
            <span style="padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; background: rgba(57, 255, 20, 0.1); color: var(--accent-green); border: 1px solid rgba(57, 255, 20, 0.2); font-weight: 600;">
              ${order.paymentStatus}
            </span>
          </td>
          <td style="font-size: 0.8rem; color: var(--text-muted);">${syncTime}</td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================
  // 6.5 Theme Toggling (Dark/Light Mode)
  // ==========================================
  const savedTheme = localStorage.getItem('aethera_theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    updateThemeIcon(true);
  }

  themeToggleBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('aethera_theme', isLight ? 'light' : 'dark');
    updateThemeIcon(isLight);
  });

  function updateThemeIcon(isLight) {
    const icon = themeToggleBtn.querySelector('i');
    if (isLight) {
      icon.setAttribute('data-lucide', 'moon');
    } else {
      icon.setAttribute('data-lucide', 'sun');
    }
    lucide.createIcons();
  }

  // ==========================================
  // 7. Initialization Calls
  // ==========================================
  fetchProducts();
  renderCart();
  updateAuthUI();
});
