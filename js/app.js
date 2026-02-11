import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

        if (querySnapshot.empty) {
            productContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Belum ada produk yang tersedia.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const product = doc.data();
            const productId = doc.id;

            const productCard = document.createElement('div');
            productCard.className = 'product-card';

            // Default image if none provided
            const imageUrl = product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';

            productCard.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <div class="product-category">Stok: ${product.stock}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description || ''}</p>
                    <div class="product-price">${formatRupiah(product.price)}</div>
                    <button class="btn-primary" onclick="addToCart('${productId}')" style="margin-top: 1rem;">
                        <i class="fa-solid fa-cart-shopping"></i> Beli
                    </button>
                </div>
            `;

            productContainer.appendChild(productCard);
        });

    } catch (error) {
        console.error("Error loading products: ", error);
        productContainer.innerHTML = '<p style="text-align:center; color: red;">Gagal memuat produk. Periksa koneksi internet Anda.</p>';
    }
}

// Basic Add to Cart (Placeholder)
window.addToCart = (productId) => {
    alert(`Produk ${productId} ditambahkan ke keranjang (Fitur ini belum aktif sepenuhnya).`);
}

// Load products on page load
document.addEventListener('DOMContentLoaded', loadProducts);
