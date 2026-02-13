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
                <img src="${imageUrl}" alt="${product.name}">
                <div class="card-content">
                    <div class="product-category">Groceries</div>
                    <div class="product-title">${product.name}</div>
                    <div class="product-desc">${product.description || 'Deskripsi produk tidak tersedia.'}</div>
                    <div class="card-footer">
                        <div class="price">${formatRupiah(product.price)}</div>
                        <span class="stock-tag">Stok: ${product.stock}</span>
                    </div>
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
