// Ganti URL ini dengan URL Web App dari Google Apps Script yang Anda dapatkan di Langkah 1
const APPS_SCRIPT_URL = 'GANTI_DENGAN_URL_WEB_APP_ANDA';

// Elements
const form = document.getElementById('inventoryForm');
const tableBody = document.getElementById('tableBody');
const refreshBtn = document.getElementById('refreshBtn');
const submitBtn = document.getElementById('submitBtn');

// Auto-calculate total stok
const inputBagus = document.getElementById('bagus');
const inputLayak = document.getElementById('layak');
const inputRusak = document.getElementById('rusak');
const inputStok = document.getElementById('stok');

function calculateStok() {
    const bagus = parseInt(inputBagus.value) || 0;
    const layak = parseInt(inputLayak.value) || 0;
    const rusak = parseInt(inputRusak.value) || 0;
    inputStok.value = bagus + layak + rusak;
}

inputBagus.addEventListener('input', calculateStok);
inputLayak.addEventListener('input', calculateStok);
inputRusak.addEventListener('input', calculateStok);

// Fetch & Display Data
async function fetchInventory() {
    tableBody.innerHTML = `<tr><td colspan="7" class="loading-text">Memuat data dari server...</td></tr>`;
    
    try {
        const response = await fetch(APPS_SCRIPT_URL);
        const data = await response.json();
        
        tableBody.innerHTML = '';
        
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="loading-text">Belum ada data inventaris.</td></tr>`;
            return;
        }

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${item.id}</strong></td>
                <td>${item.nama}</td>
                <td><span class="badge">${item.kategori}</span></td>
                <td style="color: var(--success)">${item.bagus}</td>
                <td style="color: var(--warning)">${item.layak}</td>
                <td style="color: var(--danger)">${item.rusak}</td>
                <td><strong>${item.stok}</strong></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="7" class="loading-text" style="color: var(--danger)">Gagal memuat data. Periksa koneksi internet.</td></tr>`;
        console.error('Error fetching data:', error);
    }
}

// Submit Data
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerText = 'Menyimpan...';

    const formData = new FormData(form);
    const dataParams = new URLSearchParams(formData);

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: dataParams
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            alert('Data barang berhasil ditambahkan!');
            form.reset();
            inputStok.value = ''; // Clear readonly field
            fetchInventory(); // Auto refresh table
        } else {
            alert('Gagal menyimpan data.');
        }
    } catch (error) {
        console.error('Error submitting data:', error);
        alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Simpan Data';
    }
});

// Refresh button listener
refreshBtn.addEventListener('click', fetchInventory);

// Initial Load
document.addEventListener('DOMContentLoaded', fetchInventory);
