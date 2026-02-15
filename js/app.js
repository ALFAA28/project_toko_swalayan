import { db } from './firebase-config.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const productContainer = document.getElementById('product-container');

// Function to format currency (IDR)
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(amount);
}

let allProductsCache = [];

async function loadProducts() {
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        // 1. Get Settings for Discount
        let discountActive = false;
        let discountPercent = 0;
        let discountName = '';

        try {
            const settingsSnap = await getDoc(doc(db, "settings", "store_config"));
            if (settingsSnap.exists()) {
                const s = settingsSnap.data();
                if (s.discountActive) {
                    discountActive = true;
                    discountPercent = s.discountPercent;
                    discountName = s.discountName;
                }
            }
        } catch (err) {
            console.warn("Could not load settings", err);
        }

        const querySnapshot = await getDocs(collection(db, "products"));

        productContainer.innerHTML = '';
        allProductsCache = []; // Reset cache

        if (querySnapshot.empty) {
            productContainer.innerHTML = '<p class="text-center">Belum ada produk.</p>';
            return;
        }

        querySnapshot.forEach(doc => {
            const product = doc.data();
            product.id = doc.id; // Save ID
            // Store discount info in object for easy access
            product.discountActive = discountActive;
            product.discountPercent = discountPercent;
            product.finalPrice = discountActive ? (product.price - Math.floor(product.price * (discountPercent / 100))) : product.price;

            allProductsCache.push(product);

            createProductCard(product);
        });

        // Show banner if discount active
        if (discountActive) {
            const pageTitle = document.getElementById('page-title');
            pageTitle.innerHTML = `Produk Terbaru <span style="background: var(--danger-color); color: white; padding: 0.2rem 1rem; border-radius: 20px; font-size: 1rem; vertical-align: middle; margin-left: 1rem;">🔥 ${discountName} IS LIVE!</span>`;
        }

    } catch (error) {
        console.error("Error fetching products: ", error);
        productContainer.innerHTML = '<p class="text-center" style="color: red;">Gagal memuat produk. Cek koneksi internet.</p>';
    }
}

function createProductCard(product) {
    const productContainer = document.getElementById('product-container');
    const imageUrl = product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';

    // Calculate Price HTML
    let priceHtml = `<div class="price">${formatRupiah(product.price)}</div>`;
    if (product.discountActive) {
        priceHtml = `
            <div style="font-size: 0.9rem; text-decoration: line-through; color: #94a3b8;">${formatRupiah(product.price)}</div>
            <div class="price" style="color: var(--danger-color);">${formatRupiah(product.finalPrice)}</div>
            <span style="position: absolute; top: 10px; right: 10px; background: var(--danger-color); color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">-${product.discountPercent}%</span>
        `;
    }

    const card = document.createElement('div');
    card.className = 'product-card reveal'; // Add reveal class for animation

    // Add click event to open modal
    card.onclick = (e) => {
        // Prevent modal if clicking specifically on something else if needed, but card click is fine
        openProductModal(product);
    };

    card.innerHTML = `
        <img src="${imageUrl}" alt="${product.name}">
        <div class="card-content">
            <div class="product-category">Groceries</div>
            <div class="product-title">${product.name}</div>
            <div class="product-desc">${product.description || 'Deskripsi produk tidak tersedia.'}</div>
            <div class="card-footer">
                <div>${priceHtml}</div>
                <span class="stock-tag">Stok: ${product.stock}</span>
            </div>
        </div>
    `;
    productContainer.appendChild(card);

    // Trigger animation check
    checkScroll();
}

// --- SEARCH FEATURE ---
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const productContainer = document.getElementById('product-container');
        productContainer.innerHTML = '';

        const filtered = allProductsCache.filter(p => p.name.toLowerCase().includes(term));

        if (filtered.length === 0) {
            productContainer.innerHTML = '<p class="text-center">Produk tidak ditemukan.</p>';
        } else {
            filtered.forEach(p => createProductCard(p));
        }
        checkScroll(); // Re-trigger animation for new elements
    });
}

// --- MODAL FEATURE ---
const modal = document.getElementById('product-modal');
const closeModal = document.querySelector('.close-modal');

if (closeModal) {
    closeModal.onclick = () => {
        modal.classList.remove('active');
    }
}

window.onclick = (event) => {
    if (event.target == modal) {
        modal.classList.remove('active');
    }
}

function openProductModal(product) {
    document.getElementById('modal-img').src = product.imageUrl || 'https://via.placeholder.com/300';
    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-desc').textContent = product.description || 'Tidak ada deskripsi.';

    const priceEl = document.getElementById('modal-price');
    if (product.discountActive) {
        priceEl.innerHTML = `<span style="text-decoration: line-through; font-size: 1rem; color: gray;">${formatRupiah(product.price)}</span> ${formatRupiah(product.finalPrice)}`;
        priceEl.style.color = 'var(--danger-color)';
    } else {
        priceEl.textContent = formatRupiah(product.price);
        priceEl.style.color = 'var(--primary-color)';
    }

    // Update WhatsApp Link
    const waMessage = `Halo, saya ingin memesan *${product.name}* seharga *${formatRupiah(product.finalPrice)}*. Apakah stok masih ada?`;
    const waBtn = document.querySelector('.btn-whatsapp');
    waBtn.href = `https://wa.me/6281234567890?text=${encodeURIComponent(waMessage)}`;

    modal.classList.add('active');
}

// --- SCROLL ANIMATION ---
window.addEventListener('scroll', checkScroll);

function checkScroll() {
    const reveals = document.querySelectorAll('.reveal');
    const windowHeight = window.innerHeight;
    const elementVisible = 50;

    reveals.forEach(reveal => {
        const elementTop = reveal.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
            reveal.classList.add('active');
        }
    });
}

// Basic Add to Cart (Placeholder)
window.addToCart = (productId) => {
    alert(`Produk ${productId} ditambahkan ke keranjang (Fitur ini belum aktif sepenuhnya).`);
}

// Load products on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();

    // --- MOBILE MENU TOGGLE ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent closing immediately
            navLinks.classList.toggle('active');

            // Toggle icon
            const icon = hamburger.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.querySelector('i').classList.replace('fa-times', 'fa-bars');
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                hamburger.querySelector('i').classList.replace('fa-times', 'fa-bars');
            }
        });
    }
});
