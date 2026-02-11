import { auth, db, storage } from './firebase-config.js';
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
import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

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

    try {
        let imageUrl = null;

        // Upload Image if selected
        if (imageFile) {
            const storageRef = ref(storage, 'products/' + Date.now() + '_' + imageFile.name);
            await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(storageRef);
        } else if (editingProductId) {
            // Keep existing image if editing and no new image selected
            // Note: In a real app we'd fetch the old URL, but here we can just update other fields if image is null
            // Or we could pass the old URL in the openEditModal but for simplicity let's handle updates carefully
            // Wait, if imageUrl is null on update, we shouldn't overwrite the existing one unless we want to remove it.
            // Firestore updateDoc only updates specified fields.
        }

        const productData = {
            name,
            price,
            stock,
            description,
            updatedAt: new Date()
        };

        if (imageUrl) {
            productData.imageUrl = imageUrl;
        }

        if (editingProductId) {
            // Update
            const productRef = doc(db, "products", editingProductId);
            await updateDoc(productRef, productData);
            showToast('Produk berhasil diperbarui.', 'success');
        } else {
            // Create
            productData.createdAt = new Date();
            // If no image uploaded for new product, use placeholder or null
            if (!imageUrl) productData.imageUrl = 'https://via.placeholder.com/300x200?text=No+Image';

            await addDoc(collection(db, "products"), productData);
            showToast('Produk berhasil ditambahkan.', 'success');
        }

        productModal.classList.remove('active');
        loadProducts(); // Refresh list

    } catch (error) {
        console.error("Error saving product: ", error);
        showToast('Gagal menyimpan produk: ' + error.message, 'error');
    } finally {
        saveProductBtn.disabled = false;
        saveProductBtn.textContent = 'Simpan Produk';
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
