import { auth, db } from './firebase-config.js';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const productTableBody = document.getElementById('product-table-body');
const addProductBtn = document.getElementById('add-product-btn');
const productModal = document.getElementById('product-modal');
const closeModal = document.getElementById('close-modal');
const productForm = document.getElementById('product-form');
const modalTitle = document.getElementById('modal-title');
const saveProductBtn = document.getElementById('save-product-btn');
const imagePreview = document.getElementById('image-preview');

let currentUser = null;
let editingProductId = null;

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        document.getElementById('nav-actions').style.display = 'flex';
        loadProducts(); // Load products when logged in
    } else {
        currentUser = null;
        loginSection.style.display = 'block';
        dashboardSection.style.display = 'none';
        document.getElementById('nav-actions').style.display = 'none';
    }
});

// Login Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Login berhasil!', 'success');
    } catch (error) {
        console.error(error);
        showToast('Login gagal: ' + error.message, 'error');
    }
});

// Logout Handler
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        showToast('Logout berhasil.', 'success');
    } catch (error) {
        console.error(error);
        showToast('Logout gagal.', 'error');
    }
});

// Real-time Product Loading
async function loadProducts() {
    productTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Memuat data...</td></tr>';

    try {
        const q = query(collection(db, "products"), orderBy("name"));
        const querySnapshot = await getDocs(q);

        productTableBody.innerHTML = '';

        if (querySnapshot.empty) {
            productTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Tidak ada produk found.</td></tr>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const product = docSnap.data();
            const id = docSnap.id;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${product.imageUrl || 'https://via.placeholder.com/50'}" alt="Product"></td>
                <td>${product.name}</td>
                <td>Rp ${product.price}</td>
                <td>${product.stock}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" onclick="openEditModal('${id}', '${product.name}', ${product.price}, ${product.stock}, '${product.description}', '${product.imageUrl}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteProduct('${id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            productTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading products: ", error);
        productTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Gagal memuat data logic.</td></tr>';
    }
}

// Global functions for inline HTML events
window.deleteProduct = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
        try {
            await deleteDoc(doc(db, "products", id));
            showToast('Produk berhasil dihapus.', 'success');
            loadProducts(); // Refresh list
        } catch (error) {
            console.error("Error removing document: ", error);
            showToast('Gagal menghapus produk.', 'error');
        }
    }
};

window.openEditModal = (id, name, price, stock, description, imageUrl) => {
    editingProductId = id;
    modalTitle.textContent = 'Edit Produk';
    document.getElementById('product-name').value = name;
    document.getElementById('product-price').value = price;
    document.getElementById('product-stock').value = stock;
    document.getElementById('product-description').value = description || '';

    // Store current URL in a safe place
    const imageInput = document.getElementById('product-image');
    imageInput.value = ''; // Reset file input
    imageInput.setAttribute('data-current-url', imageUrl || '');

    if (imageUrl && imageUrl !== 'undefined') {
        imagePreview.innerHTML = `<img src="${imageUrl}" style="max-width: 100px; height: auto;">`;
    } else {
        imagePreview.innerHTML = '';
    }

    productModal.classList.add('active');
};

// Modal Handling
addProductBtn.addEventListener('click', () => {
    editingProductId = null;
    modalTitle.textContent = 'Tambah Produk';
    productForm.reset();
    imagePreview.innerHTML = '';
    productModal.classList.add('active');
});

closeModal.addEventListener('click', () => {
    productModal.classList.remove('active');
});

// ImgBB Configuration
const IMGBB_API_KEY = '5e6d78bf99debf25c27ed095b401fbe8'; // Ganti dengan API Key Anda dari https://api.imgbb.com/

// Product Form Submit (Add/Edit)
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveProductBtn.disabled = true;
    saveProductBtn.textContent = 'Menyimpan...';

    const name = document.getElementById('product-name').value;
    const price = Number(document.getElementById('product-price').value);
    const stock = Number(document.getElementById('product-stock').value);
    const description = document.getElementById('product-description').value;
    const imageFile = document.getElementById('product-image').files[0];
    let imageUrl = document.getElementById('product-image').getAttribute('data-current-url');

    try {
        // Upload Image to ImgBB if a new file is selected
        if (imageFile) {
            saveProductBtn.textContent = 'Mengupload Gambar...';
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                imageUrl = data.data.url;
            } else {
                throw new Error('Gagal upload gambar ke ImgBB: ' + (data.error ? data.error.message : 'Unknown error'));
            }
        }

        const productData = {
            name,
            price,
            stock,
            description,
            imageUrl: imageUrl || 'https://via.placeholder.com/300x200?text=No+Image',
            updatedAt: new Date()
        };

        if (editingProductId) {
            // Update
            const productRef = doc(db, "products", editingProductId);
            await updateDoc(productRef, productData);
            showToast('Produk berhasil diperbarui.', 'success');
        } else {
            // Create
            productData.createdAt = new Date();
            await addDoc(collection(db, "products"), productData);
            showToast('Produk berhasil ditambahkan.', 'success');
        }

        productModal.classList.remove('active');
        loadProducts(); // Refresh list

    } catch (error) {
        console.error("Error saving product: ", error);
        showToast('Gagal: ' + error.message, 'error');
    } finally {
        saveProductBtn.disabled = false;
        saveProductBtn.textContent = 'Simpan Produk';
    }
});

// Preview Image on Selection
document.getElementById('product-image').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" style="max-width: 100px; height: auto;">`;
        }
        reader.readAsDataURL(file);
    }
});

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');

    toast.className = `toast ${type} show`;
    toastMsg.textContent = message;

    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
    }, 3000);
}

// --- TAB NAVIGATION ---
window.switchTab = (tabName) => {
    // Hide all contents
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    // Deactivate all buttons
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    // Show selected
    document.getElementById(`tab-${tabName}`).style.display = 'block';
    // Activate button (need to find which one clicked, but simpler to loop logic or use e.target)
    // For simplicity, we assume buttons are in order or finding by text/index.
    // Let's just re-query based on logic in HTML calls
    const b = Array.from(document.querySelectorAll('.tab-btn')).find(el => el.getAttribute('onclick').includes(tabName));
    if (b) b.classList.add('active');

    if (tabName === 'cashier') {
        loadCashierProducts();
    } else if (tabName === 'reports') {
        loadReports();
    }
};

// --- CASHIER LOGIC ---
let cart = [];
let allProductsCache = [];

async function loadCashierProducts() {
    const container = document.getElementById('cashier-product-list');
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const q = query(collection(db, "products"), orderBy("name"));
        const snapshot = await getDocs(q);

        allProductsCache = [];
        container.innerHTML = '';

        snapshot.forEach(doc => {
            const p = doc.data();
            p.id = doc.id;
            allProductsCache.push(p);

            const div = document.createElement('div');
            div.className = 'product-card-small';
            div.onclick = () => addToCart(p);
            div.innerHTML = `
                <img src="${p.imageUrl || 'https://via.placeholder.com/100'}" alt="${p.name}">
                <h4>${p.name}</h4>
                <p>Rp ${p.price}</p>
                <small>Stok: ${p.stock}</small>
            `;
            container.appendChild(div);
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = 'Error loading products.';
    }
}

// Search Filter
document.getElementById('cashier-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const container = document.getElementById('cashier-product-list');
    container.innerHTML = '';

    const filtered = allProductsCache.filter(p => p.name.toLowerCase().includes(term));

    filtered.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product-card-small';
        div.onclick = () => addToCart(p);
        div.innerHTML = `
            <img src="${p.imageUrl || 'https://via.placeholder.com/100'}" alt="${p.name}">
            <h4>${p.name}</h4>
            <p>Rp ${p.price}</p>
            <small>Stok: ${p.stock}</small>
        `;
        container.appendChild(div);
    });
});

function addToCart(product) {
    if (product.stock <= 0) {
        showToast('Stok habis!', 'error');
        return;
    }

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        if (existing.qty < product.stock) {
            existing.qty++;
        } else {
            showToast('Mencapai batas stok.', 'error');
        }
    } else {
        cart.push({ ...product, qty: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <small>@ ${item.price} x ${item.qty} = ${subtotal}</small>
            </div>
            <div class="cart-controls">
                <button class="btn-qty" onclick="changeQty('${item.id}', -1)">-</button>
                <span>${item.qty}</span>
                <button class="btn-qty" onclick="changeQty('${item.id}', 1)">+</button>
            </div>
        `;
        container.appendChild(div);
    });

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: gray;">Keranjang masih kosong</p>';
    }

    document.getElementById('cart-total').textContent = `Rp ${total}`;

    // Enable checkout if cart not empty
    const payBtn = document.getElementById('checkout-btn');
    payBtn.disabled = cart.length === 0;

    calculateChange();
}

window.changeQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    // Check stock limit
    const product = allProductsCache.find(p => p.id === id);

    if (delta > 0) {
        if (item.qty < product.stock) {
            item.qty++;
        } else {
            showToast('Stok tidak cukup.', 'error');
            return;
        }
    } else {
        item.qty--;
    }

    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    updateCartUI();
};

document.getElementById('pay-amount').addEventListener('input', calculateChange);

function calculateChange() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const pay = Number(document.getElementById('pay-amount').value);
    const change = pay - total;

    const changeEl = document.getElementById('change-amount');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (cart.length > 0 && pay >= total) {
        changeEl.textContent = `Rp ${change}`;
        changeEl.style.color = 'green';
        checkoutBtn.disabled = false;
    } else {
        changeEl.textContent = `Rp 0`;
        changeEl.style.color = 'black';
        checkoutBtn.disabled = true;
    }
}

document.getElementById('checkout-btn').addEventListener('click', async () => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const pay = Number(document.getElementById('pay-amount').value);

    if (pay < total) {
        showToast('Uang pembayaran kurang!', 'error');
        return;
    }

    if (!confirm('Proses transaksi?')) return;

    try {
        const checkoutBtn = document.getElementById('checkout-btn');
        checkoutBtn.textContent = 'Memproses...';
        checkoutBtn.disabled = true;

        // 1. Transaction Data
        const transaction = {
            date: new Date(),
            total: total,
            pay: pay,
            change: pay - total,
            items: cart.map(i => ({
                id: i.id,
                name: i.name,
                price: i.price,
                qty: i.qty,
                subtotal: i.price * i.qty
            })),
            cashierEmail: auth.currentUser?.email || 'admin'
        };

        // 2. Reduce Stock in Database
        for (const item of cart) {
            const productRef = doc(db, "products", item.id);
            const newStock = item.stock - item.qty;
            await updateDoc(productRef, { stock: newStock });
        }

        // 3. Save Transaction
        await addDoc(collection(db, "transactions"), transaction);

        showToast('Transaksi Berhasil!', 'success');

        // Reset
        cart = [];
        document.getElementById('pay-amount').value = '';
        updateCartUI();
        loadCashierProducts(); // Refresh stock display

    } catch (error) {
        console.error(error);
        showToast('Gagal memproses transaksi.', 'error');
    } finally {
        document.getElementById('checkout-btn').textContent = 'Bayar & Cetak';
    }
});

// --- REPORT LOGIC ---
async function loadReports() {
    const tbody = document.getElementById('report-table-body');
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Memuat data...</td></tr>';

    try {
        // Get transactions, order by date desc
        const q = query(collection(db, "transactions"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);

        tbody.innerHTML = '';
        let totalIncome = 0;
        let todayIncome = 0;
        let count = 0;

        const today = new Date().toDateString();

        snapshot.forEach(doc => {
            const t = doc.data();
            count++;
            totalIncome += t.total;

            const tDate = t.date.toDate(); // Firestore timestamp
            if (tDate.toDateString() === today) {
                todayIncome += t.total;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tDate.toLocaleString()}</td>
                <td>Rp ${t.total}</td>
                <td>${t.items.map(i => `${i.name} (x${i.qty})`).join(', ')}</td>
            `;
            tbody.appendChild(row);
        });

        if (count === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Belum ada transaksi.</td></tr>';
        }

        // Update Stats
        document.getElementById('today-income').textContent = `Rp ${todayIncome}`;
        document.getElementById('total-transactions').textContent = count;

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:red;">Gagal memuat laporan. Index mungkin sedang dibangun.</td></tr>';
    }
}
