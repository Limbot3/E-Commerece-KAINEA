
function handleScrollAnimations() {
    const allProductsSection = document.getElementById('allProducts');
    if (allProductsSection) {
        const rect = allProductsSection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
            allProductsSection.classList.add('section-visible');
        }
    }
}

function handleSearch() {
    const searchBox = document.querySelector('.search-box');
    const productCards = document.querySelectorAll('.product-card');
    if (!searchBox || !productCards.length) return;
    
    const query = searchBox.value.toLowerCase().trim();
    productCards.forEach(card => {
        const productName = card.querySelector('.product-name').textContent.toLowerCase();
        if (productName.includes(query)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

function initializeSearch() {
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
        searchBox.removeEventListener('input', handleSearch);
        searchBox.removeEventListener('keyup', handleSearch);
        searchBox.addEventListener('input', handleSearch);
        searchBox.addEventListener('keyup', handleSearch);
    }
}

function handleShopNowClick(e) {
    e.preventDefault();
    const button = e.target;
    button.style.transform = 'scale(0.95)';
    setTimeout(() => button.style.transform = 'scale(1)', 150);
    
    let allProductsSection = document.getElementById('allProducts') || document.querySelector('.new-arrivals');
    
    if (allProductsSection) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = allProductsSection.offsetTop - headerHeight - 20;
        
        window.scrollTo({ top: Math.max(0, targetPosition), behavior: 'smooth' });
    } else {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
}


let cartItems = [];
let cartCount = 0;

function addToCart(productId) {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    
    if (!token || !userName) {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            showNotification('Silakan login terlebih dahulu untuk menambahkan produk ke cart!', 'warning');
        } else {
            alert('Silakan login terlebih dahulu!');
        }
        return;
    }
    
    let product;
    const productIdStr = String(productId);
    
    if (productIdStr.startsWith('static-')) {
        product = getStaticProduct(productIdStr);
    } else {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        product = products.find(p => String(p.id) === productIdStr || p.id === productId);
    }
    
    if (!product) return alert('Produk tidak ditemukan!');
    if (product.stock !== undefined && product.stock <= 0) return alert('Maaf, stok produk habis!');
    
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const existingItem = cartItems.find(item => String(item.id) === String(product.id));
    
    if (existingItem) {
        if (product.stock !== undefined && existingItem.quantity >= product.stock) {
            return alert('Maaf, stok tidak mencukupi!');
        }
        existingItem.quantity += 1;
    } else {
        cartItems.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image || 'assets/images/models/1.jpg',
            sku: product.sku || 'N/A',
            quantity: 1
        });
    }
    
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartCount();
    showAddToCartNotification(product.name);
}

function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const totalQuantity = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
    const cartLink = document.getElementById('cartLink');
    if (cartLink) cartLink.textContent = `Cart (${totalQuantity})`;
    
    document.querySelectorAll('a[href="cart.html"]').forEach(link => {
        link.textContent = `Cart (${totalQuantity})`;
    });
}

function initializeCart() {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    
    if (!token || !userName) {
        cartItems = [];
        cartCount = 0;
        localStorage.removeItem('cartItems');
    } else {
        cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        cartCount = cartItems.length;
    }
    updateCartCount();
    reinitializeCartEventListeners();
}

function handleAddToCartClick() {
    const productId = this.getAttribute('data-product-id');
    if (productId) {
        addToCart(productId);
    } else {
        const productCard = this.closest('.product-card');
        if (productCard && productCard.dataset.productId) {
            addToCart(productCard.dataset.productId);
        }
    }
}

function reinitializeCartEventListeners() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.removeEventListener('click', handleAddToCartClick);
        button.addEventListener('click', handleAddToCartClick);
    });
}


function loadProductsFromAdmin() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const activeProducts = products.filter(product => product.status === 'active');
    
    if (activeProducts.length > 0) {
        displayProducts(activeProducts);
    } else {
        displayStaticProducts();
    }
}

function displayProducts(products) {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    let html = '';
    products.forEach(product => {
        const imageSrc = product.image || 'assets/images/models/1.jpg';
        const priceFormatted = product.price ? product.price.toLocaleString('id-ID') : '0';
        html += `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-img">
                    <img src="${imageSrc}" alt="${product.name}">
                    <div class="product-actions">
                        <button class="add-to-cart-btn" data-product-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">Rp ${priceFormatted}</p>
                    <p class="product-description">${product.description || ''}</p>
                    <small class="product-sku">SKU: ${product.sku || 'N/A'}</small>
                </div>
            </div>`;
    });
    
    productsGrid.innerHTML = html;
    reinitializeCartEventListeners();
    initializeSearch();
}

function displayStaticProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    const staticIds = ['static-1', 'static-2', 'static-3', 'static-4', 'static-5', 'static-6', 'static-7', 'static-8'];
    let html = '';
    
    staticIds.forEach(id => {
        const product = getStaticProduct(id);
        const priceFormatted = product.price.toLocaleString('id-ID');
        html += `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-img">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="product-actions">
                        <button class="add-to-cart-btn" data-product-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">Rp ${priceFormatted}</p>
                    <p class="product-description">${product.description}</p>
                    <small class="product-sku">SKU: ${product.sku}</small>
                </div>
            </div>`;
    });
    
    productsGrid.innerHTML = html;
    reinitializeCartEventListeners();
    initializeSearch();
}

function getStaticProduct(staticId) {
    const staticProducts = {
        'static-1': { id: 'static-1', name: 'Helong Blouse', price: 1200000, image: 'assets/images/models/1.jpg', sku: 'STATIC-001', description: 'Blouse tradisional elegan' },
        'static-2': { id: 'static-2', name: 'Kenari Pantar', price: 1099000, image: 'assets/images/models/2.jpg', sku: 'STATIC-002', description: 'Pakaian adat indah' },
        'static-3': { id: 'static-3', name: 'Lamaholot', price: 1250000, image: 'assets/images/models/3.jpg', sku: 'STATIC-003', description: 'Busana tradisional megah' },
        'static-4': { id: 'static-4', name: 'Timor Lorosae', price: 1500000, image: 'assets/images/models/4.jpg', sku: 'STATIC-004', description: 'Pakaian adat Timor' },
        'static-5': { id: 'static-5', name: 'Rote', price: 1600000, image: 'assets/images/models/6.jpg', sku: 'STATIC-005', description: 'Busana tradisional Rote' },
        'static-6': { id: 'static-6', name: 'Sabu Raijua', price: 1400000, image: 'assets/images/models/7.jpg', sku: 'STATIC-006', description: 'Pakaian adat Sabu' },
        'static-7': { id: 'static-7', name: 'Moat Sikka', price: 1100000, image: 'assets/images/models/9.jpg', sku: 'STATIC-007', description: 'Blouse Moat modern' },
        'static-8': { id: 'static-8', name: 'Humba', price: 1800000, image: 'assets/images/models/10.jpg', sku: 'STATIC-008', description: 'Busana Humba mewah' }
    };
    return staticProducts[staticId];
}


function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 8px;
        color: white; font-weight: 600; z-index: 3000; transform: translateX(100%);
        transition: transform 0.3s ease; max-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    if(type === 'success') notification.style.backgroundColor = '#28a745';
    else if(type === 'error') notification.style.backgroundColor = '#dc3545';
    else if(type === 'warning') { notification.style.backgroundColor = '#ffc107'; notification.style.color = '#000'; }
    else notification.style.backgroundColor = '#17a2b8';
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

function showAddToCartNotification(productName) {
    showNotification(`Berhasil! "${productName}" ditambahkan ke cart`, 'success');
}


function updateUserUI() {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('role'); 
    const userActions = document.getElementById('userActions');

    if (token && userName) {
        
        userActions.innerHTML = `
            <a style="cursor: pointer;" onclick="window.location.href = '${userRole}' === 'admin' ? 'admin.html' : 'user.html'">${userName}</a>
            <a href="cart.html" id="cartLink">Cart (0)</a>
            <a style="cursor: pointer;" id="logoutBtn">Logout</a>
        `;
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html'; 
        });
        updateCartCount();
    } else {
        userActions.innerHTML = `
            <a id="loginLink">Login</a>
            <a href="#" id="registerLink">Register</a>
        `;
        attachLoginRegisterListeners();
    }
}

function attachLoginRegisterListeners() {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    if (loginLink && loginModal) {
        loginLink.onclick = (e) => { e.preventDefault(); loginModal.classList.add('active'); document.body.style.overflow = 'hidden'; };
    }
    if (registerLink && registerModal) {
        registerLink.onclick = (e) => { e.preventDefault(); registerModal.classList.add('active'); document.body.style.overflow = 'hidden'; };
    }
}


document.addEventListener('DOMContentLoaded', function() {
    updateUserUI();
    initializeCart();
    loadProductsFromAdmin();
    initializeSearch();
    handleScrollAnimations();
    window.addEventListener('scroll', handleScrollAnimations);
    
   
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    document.getElementById('openRegisterFromLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('registerModal').classList.add('active');
    });

  
    document.getElementById('shopNowBtn')?.addEventListener('click', handleShopNowClick);
    
   
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        document.getElementById('closeCartSidebar')?.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
        });
    }

 
    document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('https://kainea.marianuswilliam.web.id/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            if (!response.ok) return alert(data.message || 'Login failed');
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('role', data.role); 
            localStorage.setItem('userName', data.name);
            localStorage.setItem('userEmail', email);
            
            if (data.role === 'admin') {
                window.location.href = 'admin.html';
                return;
            }
            
            document.getElementById('loginModal').classList.remove('active');
            document.body.style.overflow = '';
            location.reload();
        } catch (error) {
            console.error('Error:', error);
            alert('Tidak dapat menghubungi server. Pastikan Backend berjalan!');
        }
    });

   
    document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirmPassword').value;
        
        if (password !== confirm) return alert('Passwords do not match');
        
        try {
            const response = await fetch('https://kainea.marianuswilliam.web.id/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            
            if (!response.ok) return alert(data.message || 'Registration failed');
            
            alert('Registration successful! You can now log in.');
            document.getElementById('registerModal').classList.remove('active');
            document.getElementById('loginModal').classList.add('active');
        } catch (error) {
            console.error('Error:', error);
            alert('Tidak dapat menghubungi server. Pastikan Backend berjalan!');
        }
    });
});