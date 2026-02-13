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

// Function to fetch and display products
async function loadProducts() {
    productContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>'; // Show loading

    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        productContainer.innerHTML = ''; // Clear loading

        productContainer.innerHTML = '';

        if (querySnapshot.empty) {
            productContainer.innerHTML = '<p class="text-center">Belum ada produk.</p>';
            return;
        }

        querySnapshot.forEach(doc => {
            const product = doc.data();
            const productId = doc.id;
            const imageUrl = product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';

            // Calculate Price
            let priceHtml = `<div class="price">${formatRupiah(product.price)}</div>`;
            if (discountActive) {
                const discountedPrice = product.price - Math.floor(product.price * (discountPercent / 100));
                priceHtml = `
                    <div style="font-size: 0.9rem; text-decoration: line-through; color: #94a3b8;">${formatRupiah(product.price)}</div>
                    <div class="price" style="color: var(--danger-color);">${formatRupiah(discountedPrice)}</div>
                    <span style="position: absolute; top: 10px; right: 10px; background: var(--danger-color); color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">-${discountPercent}%</span>
                `;
            }

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}">
                <div class="card-content">
                    <div class="product-category">Groceries</div>
                    <div class="product-title">${product.name}</div>
                    <div class="product-desc">${product.description || 'Deskripsi produk tidak tersedia.'}</div>
                    <div class="card-footer">
                        <div>
                            ${priceHtml}
                        </div>
                        <span class="stock-tag">Stok: ${product.stock}</span>
                    </div>
                </div>
            `;
            productContainer.appendChild(card);
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

// Basic Add to Cart (Placeholder)
window.addToCart = (productId) => {
    alert(`Produk ${productId} ditambahkan ke keranjang (Fitur ini belum aktif sepenuhnya).`);
}

// Load products on page load
document.addEventListener('DOMContentLoaded', loadProducts);
