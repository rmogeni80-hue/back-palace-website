// ==========================================
// 1. SUPABASE SETUP
// ==========================================
const SUPABASE_URL = 'https://ojqfzxvxdbyqrimajvbf.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_Wi2ujbJ1ZxtRDvnx_MN6qA_wz1-I7OJ'; 

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 2. AUTHENTICATION (LOGIN)
// ==========================================
function toggleAuth() {
    document.getElementById('auth-modal').classList.toggle('open');
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert("Login failed: " + error.message);
    } else {
        alert("Welcome back!");
        toggleAuth(); 
        document.querySelector('.signin-btn').innerHTML = `<i class="fas fa-user-check"></i> <span class="signin-text">Account</span>`;
    }
}

// ==========================================
// 3. LOAD PRODUCTS FROM SUPABASE
// ==========================================
const EXCHANGE_RATE = 130; // 1 USD = 130 KSh
const productGrid = document.getElementById('product-grid');

async function loadProducts() {
    productGrid.innerHTML = '<p>Loading amazing furniture...</p>';

    // Fetch data from the 'products' table
    const { data: products, error } = await supabaseClient
        .from('products')
        .select('*');

    if (error) {
        console.error("Error loading products:", error);
        productGrid.innerHTML = '<p>Error loading products. Please check the database connection.</p>';
        return;
    }

    // If database is empty
    if (!products || products.length === 0) {
        productGrid.innerHTML = '<p>No products found. Please add some in Supabase.</p>';
        return;
    }

    productGrid.innerHTML = ''; 

    // Loop through the data from Supabase
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Calculate USD price safely
        const priceNum = parseFloat(product.price) || 0;
        const usdPrice = (priceNum / EXCHANGE_RATE).toFixed(2);

        card.innerHTML = `
            <div class="img-container">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="stars">
                    <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                    <span>(5.0)</span>
                </div>
                <div class="price-box">
                    <p class="price-ksh">KSh ${priceNum.toLocaleString()}</p>
                    <p class="price-usd">~ $${usdPrice} USD</p>
                </div>
                <button class="add-to-cart" onclick="addToCart('${product.name}', ${priceNum})">Add to Cart</button>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// Call the function to load data
loadProducts();

// ==========================================
// 4. CART FUNCTIONALITY
// ==========================================
let cartCount = 0;
let cartTotal = 0;

function toggleCart() {
    document.getElementById('cart-panel').classList.toggle('open');
}

function addToCart(productName, price) {
    cartCount++;
    cartTotal += price;
    
    const usdTotal = (cartTotal / EXCHANGE_RATE).toFixed(2);
    
    document.getElementById('cart-count').innerText = cartCount;
    
    const mobileCount = document.getElementById('mobile-cart-count');
    if(mobileCount) mobileCount.innerText = cartCount; 

    document.getElementById('cart-total').innerHTML = `KSh ${cartTotal.toLocaleString()} <br><span style="font-size:12px; color:#64748b; font-weight:normal;">(~ $${usdTotal} USD)</span>`;
    
    const cartItems = document.getElementById('cart-items');
    if (cartCount === 1) cartItems.innerHTML = ''; 

    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `<i class="fas fa-couch" style="color:#ff6a00; margin-right:10px;"></i> <span>${productName} - KSh ${price.toLocaleString()}</span>`;
    cartItems.appendChild(item);

    document.getElementById('cart-panel').classList.add('open');
}

function checkout() {
    const phoneNumber = "254110448044"; 
    let message = "Hello Back Palace, I would like to order the following items:%0A%0A";
    const items = document.querySelectorAll('.cart-item span');
    
    if (items.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    items.forEach((item, index) => {
        message += `${index + 1}. ${item.innerText}%0A`;
    });

    const usdTotal = (cartTotal / EXCHANGE_RATE).toFixed(2);
    message += `%0A*Total:* KSh ${cartTotal.toLocaleString()} (~ $${usdTotal} USD)%0A%0APlease let me know how to proceed.`;
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
}

// ==========================================
// 5. AI ASSISTANT
// ==========================================
function openAssistant() {
    const phoneNumber = "254110448044";
    const message = "Hi Back Palace AI Assistant! I am browsing your website and I need help finding the right sofa. My budget is around...";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
}