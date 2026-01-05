let data = null;
let pharmacist = null;

// تحميل بيانات الـ JSON
async function loadData() {
    try {
        const response = await fetch('data/data.json');
        data = await response.json();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// التحقق من تسجيل دخول الصيدلي
function checkAuth() {
    const pharmacistData = sessionStorage.getItem('pharmacist');
    if (!pharmacistData) {
        window.location.href = 'pharmacist-login.html';
        return;
    }
    sessionStorage.removeItem("pharmacist");
    pharmacist = JSON.parse(pharmacistData);
}

// عرض معلومات الصيدلي والعيادة
function displayDashboard() {
    const clinic = data.clinics.find(c => c.id === pharmacist.clinic_id);
    document.getElementById('pharmacistName').textContent = pharmacist.name;
    document.getElementById('pharmacistEmail').textContent = pharmacist.email;
    document.getElementById('clinicName').textContent = clinic.name;
    document.getElementById('clinicAddress').textContent = clinic.address;
    displayMedicines();
}

// عرض جدول الأدوية مع الفلترة والبحث
function displayMedicines(filter = '') {
    const medicinesList = document.getElementById('medicinesList');
    medicinesList.innerHTML = '';
    const clinicMedicines = data.medicines.filter(m =>
        m.clinic_stock.some(stock => stock.clinic_id === pharmacist.clinic_id) &&
        (m.name.includes(filter) || m.category.includes(filter))
    );

    clinicMedicines.forEach((medicine, index) => {
        const stock = medicine.clinic_stock.find(s => s.clinic_id === pharmacist.clinic_id);
        const row = document.createElement('tr');
        console.log(stock)
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${medicine.name}</td>
            <td>${stock ? stock.quantity : 0}</td>
            <td>${medicine ? medicine.category : ""}</td>
            <td><span class="badge ${stock && stock.is_available ? 'badge-success' : 'badge-danger'}">
                ${stock ? stock.status : 'غير متوفر'}
            </span></td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="openEditModal(${medicine.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteMedicine(${medicine.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        medicinesList.appendChild(row);
    });
}

// فتح نافذة التعديل
function openEditModal(medicineId) {
    const medicine = data.medicines.find(m => m.id === medicineId);
    const stock = medicine.clinic_stock.find(s => s.clinic_id === pharmacist.clinic_id);

    document.getElementById('editMedicineId').value = medicine.id;
    document.getElementById('editMedicineName').value = medicine.name;
    document.getElementById('editMedicineQuantity').value = stock ? stock.quantity : 0;
    document.getElementById('editMedicineCategory').value = medicine.category;
    document.getElementById('editIsAvailable').checked = stock ? stock.is_available : false;

    const modal = new bootstrap.Modal(document.getElementById('editMedicineModal'));
    modal.show();
}

// إضافة دواء جديد
function handleAddMedicine(event) {
    event.preventDefault();
    const newMedicine = {
        id: data.medicines.length + 1,
        name: document.getElementById('medicineName').value,
        category: document.getElementById('medicineCategory').value,
        clinic_stock: [{
            clinic_id: pharmacist.clinic_id,
            quantity: parseInt(document.getElementById('medicineQuantity').value),
            is_available: document.getElementById('isAvailable').checked,
            status: document.getElementById('isAvailable').checked ? 'متوفر' : 'غير متوفر'
        }]
    };
    data.medicines.push(newMedicine);
    displayMedicines();

    const modal = bootstrap.Modal.getInstance(document.getElementById('addMedicineModal'));
    modal.hide();
}

// حفظ التعديلات على دواء
function handleEditMedicine(event) {
    event.preventDefault();
    const medicineId = parseInt(document.getElementById('editMedicineId').value);
    const medicineIndex = data.medicines.findIndex(m => m.id === medicineId);
    const stockIndex = data.medicines[medicineIndex].clinic_stock.findIndex(s => s.clinic_id === pharmacist.clinic_id);

    data.medicines[medicineIndex].name = document.getElementById('editMedicineName').value;
    data.medicines[medicineIndex].category = document.getElementById('editMedicineCategory').value;

    if (stockIndex !== -1) {
        data.medicines[medicineIndex].clinic_stock[stockIndex].quantity = parseInt(document.getElementById('editMedicineQuantity').value);
        data.medicines[medicineIndex].clinic_stock[stockIndex].is_available = document.getElementById('editIsAvailable').checked;
        data.medicines[medicineIndex].clinic_stock[stockIndex].status = document.getElementById('editIsAvailable').checked ? 'متوفر' : 'غير متوفر';
    }

    displayMedicines();

    const modal = bootstrap.Modal.getInstance(document.getElementById('editMedicineModal'));
    modal.hide();
}

// حذف دواء
function deleteMedicine(medicineId) {
    if (!confirm('هل أنت متأكد من حذف هذا الدواء؟')) return;

    const medicineIndex = data.medicines.findIndex(m => m.id === medicineId);
    const stockIndex = data.medicines[medicineIndex].clinic_stock.findIndex(s => s.clinic_id === pharmacist.clinic_id);

    if (stockIndex !== -1) {
        data.medicines[medicineIndex].clinic_stock.splice(stockIndex, 1);
    }

    // إذا لم يتبق أي عيادة للدواء احذفه كامل
    if (data.medicines[medicineIndex].clinic_stock.length === 0) {
        data.medicines.splice(medicineIndex, 1);
    }

    displayMedicines();
}

// تسجيل الخروج
function logout() {
    sessionStorage.removeItem('pharmacist');
    window.location.href = 'pharmacist-login.html';
}

// البحث والفلترة
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            displayMedicines(e.target.value);
        });
    }
}

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    await loadData();
    displayDashboard();

    document.getElementById('addMedicineForm').addEventListener('submit', handleAddMedicine);
    document.getElementById('editMedicineForm').addEventListener('submit', handleEditMedicine);
    document.getElementById('logoutBtn').addEventListener('click', logout);

    setupSearch();
});

// Filter medicines by category and status
const filterCategory = document.getElementById("filterCategory");
const filterStatus = document.getElementById("filterStatus");

async function populateFilterCategories() {
    await loadData();
    if (!filterCategory) return;
    console.log(data)
    const categories = [...new Set(data.medicines.map(m => m.category))]; // جميع الفئات بدون تكرار
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        filterCategory.appendChild(option);
    });
}

function applyFilters() {
    if (!filterCategory || !filterStatus) return;
    const category = filterCategory.value;
    const status = filterStatus.value;

    const medicinesList = document.getElementById("medicinesList");
    if (!medicinesList) return;

    medicinesList.innerHTML = '';
    const clinicMedicines = data.medicines.filter(m =>
        m.clinic_stock.some(stock => stock.clinic_id === pharmacist.clinic_id)
    ).filter(m => {
        const stock = m.clinic_stock.find(s => s.clinic_id === pharmacist.clinic_id);
        return (!category || m.category === category) && (!status || stock.status === status);
    });

    clinicMedicines.forEach((medicine, index) => {
        const stock = medicine.clinic_stock.find(s => s.clinic_id === pharmacist.clinic_id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${medicine.name}</td>
            <td>${stock.quantity}</td>
            <td>${medicine.category}</td>
            <td><span class="badge ${stock.is_available ? 'badge-success' : 'badge-danger'}">${stock.status}</span></td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="openEditModal(${medicine.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteMedicine(${medicine.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        medicinesList.appendChild(row);
    });
}

// Events
if (filterCategory) filterCategory.addEventListener("change", applyFilters);
if (filterStatus) filterStatus.addEventListener("change", applyFilters);

// Call once بعد تحميل البيانات لملأ الفئات
populateFilterCategories();
