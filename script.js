import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAon06Q_-8RMHdnq4JI4Sxycp59kbe5qIA",
    authDomain: "ironforge-2f688.firebaseapp.com",
    databaseURL: "https://ironforge-2f688-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ironforge-2f688",
    storageBucket: "ironforge-2f688.firebasestorage.app",
    messagingSenderId: "670669941434",
    appId: "1:670669941434:web:73794b7d378cfb32883083",
    measurementId: "G-EQ8T2HMNM4"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- LOAD PRODUCTS FROM FIREBASE ---
// Inside script.js
export function loadProducts(categoryFilter = "All") {
    const productGrid = document.querySelector('.product-grid');
    const productsRef = ref(db, 'products');

    onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        productGrid.innerHTML = ""; 
        const items = Array.isArray(data) ? data : Object.values(data);

        items.forEach(item => {
            if (item && item.Category) {
                if (categoryFilter === "All" || item.Category.toLowerCase() === categoryFilter.toLowerCase()) {
                    productGrid.innerHTML += `
                        <div class="product-card">
                            <img src="${item.Image}" alt="${item.Name}">
                            <h3>${item.Name}</h3>
                            <p class="price">DT${item.Price}.00</p>
                            <!-- CRITICAL: Make sure all 3 arguments are here -->
                            <button onclick="addToCart('${item.Name.replace(/'/g, "\\'")}', ${item.Price}, '${item.Image}')">Add to Cart</button>
                        </div>
                    `;
                }
            }
        });
    });
}

// --- CART LOGIC ---
window.toggleCart = function() {
    document.getElementById('cartSidebar').classList.toggle('active');
    document.getElementById('cartOverlay').classList.toggle('active');
    renderCart();
};

// Inside script.js
window.addToCart = function(name, price, image) {
    let cart = JSON.parse(localStorage.getItem('gymCart')) || [];
    
    // Add the image to the object we save
    cart.push({ name, price, image }); 
    
    localStorage.setItem('gymCart', JSON.stringify(cart));
    updateCartCount();
    
    // Open the cart automatically so the user sees the image
    if(!document.getElementById('cartSidebar').classList.contains('active')) {
        toggleCart();
    }
};

window.removeFromCart = function(index) {
    let cart = JSON.parse(localStorage.getItem('gymCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('gymCart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
};

function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    const totalDisplay = document.getElementById('cartTotalDisplay');
    let cart = JSON.parse(localStorage.getItem('gymCart')) || [];
    
    container.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = "<p style='text-align:center; margin-top:20px; color:#666;'>Your cart is empty.</p>";
    }

    cart.forEach((item, index) => {
        total += parseFloat(item.price);
        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" class="cart-item-img" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>DT${item.price}.00</p>
                </div>
                <button class="remove-item" onclick="removeFromCart(${index})">&times;</button>
            </div>
        `;
    });

    totalDisplay.innerText = `DT${total}.00`;
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.setAttribute('onclick', "window.location.href='checkout.html'");
    }
}

function updateCartCount() {
    const cartLinks = document.querySelectorAll('.nav-actions a');
    const cartText = Array.from(cartLinks).find(a => a.textContent.includes('Cart'));
    let cart = JSON.parse(localStorage.getItem('gymCart')) || [];
    if (cartText) cartText.innerText = `Cart (${cart.length})`;
}

// Set initial count
updateCartCount();