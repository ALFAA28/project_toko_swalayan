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
