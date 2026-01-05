let data = null;
let manager = null;
let editRegionId = null;
let editClinicId = null;
let editPharmacistId = null;


async function loadData() {
    const res = await fetch("data/data.json");
    data = await res.json();
    renderRegions();
    renderClinics();
    renderPharmacists();
    fillRegionSelects();
    fillClinicSelects();
}
// التحقق من تسجيل دخول المدير
function checkAuth() {
    const managerData = sessionStorage.getItem('manager');
    if (!managerData) {
        window.location.href = 'manager-login.html';
        return;
    }
    // sessionStorage.removeItem("manager");
    manager = JSON.parse(managerData);
}

// --- Regions ---
function renderRegions() {
    const list = document.getElementById("regionsList");
    list.innerHTML = "";
    data.regions.forEach((r, i) => {
        const regionClinics = data.clinics.filter(c => c.region_id === r.id);

        const clinicsHTML = regionClinics.map(c => `
            <div class="clinic-item">
                ${c.name}
                <span class="${c.is_open ? 'text-success' : 'text-danger'}">
                    (${c.status})
                </span>
            </div>
        `).join("");

        const clinicsCount = data.clinics.filter(c => c.region_id === r.id).length;
        list.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${r.name}</td>
                <td>${clinicsCount || 'اضافة جديدة'}</td>
                <td>${clinicsHTML || 'لا توجد عيادات'}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="openEditRegion(${r.id})">تعديل</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteRegion(${r.id})">حذف</button>
                </td>
            </tr>
        `;
    });

}

function deleteRegion(id) {
    if (data.clinics.some(c => c.region_id === id)) { alert("لا يمكن حذف منطقة تحتوي على عيادات"); return; }
    data.regions = data.regions.filter(r => r.id !== id);
    renderRegions();
    fillRegionSelects();
}

document.getElementById("addRegionForm").addEventListener("submit", e => {

    e.preventDefault();
    data.regions.push({
        id: data.regions.length + 1,
        name: regionName.value,
        name_en: regionNameEn.value,
        clinics_count: clinicCount.value
    });
    renderRegions();
    fillRegionSelects();
    bootstrap.Modal.getInstance(addRegionModal).hide();
    regionName.value = "";
    regionNameEn.value = "";
    clinicCount.value = "";
});

function openEditRegion(id) {
    editRegionId = id;
    const region = data.regions.find(r => r.id === id);
    editRegionName.value = region.name;
    editRegionNameEn.value = region.name_en;
    bootstrap.Modal.getOrCreateInstance(editRegionModal).show();
}

document.getElementById("editRegionForm").addEventListener("submit", e => {
    e.preventDefault();
    const region = data.regions.find(r => r.id === editRegionId);
    region.name = editRegionName.value;
    region.name_en = editRegionNameEn.value;
    renderRegions();
    fillRegionSelects();
    bootstrap.Modal.getInstance(editRegionModal).hide();
});

// --- Clinics ---
function renderClinics() {
    const list = document.getElementById("clinicsList");
    list.innerHTML = "";
    data.clinics.forEach((c, i) => {
        const region = data.regions.find(r => r.id === c.region_id);
        const pharmacistClinic = data.pharmacists.find(r => r.id === c.pharmacist_id)
        console.log(c)
        list.innerHTML += `
        <tr>
            <td>${i + 1}</td>
            <td>${c.name}</td>
            <td>${region ? region.name : ""}</td>
            <td>${pharmacistClinic ? pharmacistClinic.name : ""}</td>
            <td>${c.phone}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="openEditClinic(${c.id})">تعديل</button>
                <button class="btn btn-danger btn-sm" onclick="deleteClinic(${c.id})">حذف</button>
            </td>
        </tr>`;
    });
}

function deleteClinic(id) {
    data.clinics = data.clinics.filter(c => c.id !== id);
    renderClinics();
    fillClinicSelects();
}

document.getElementById("addClinicForm").addEventListener("submit", e => {
    e.preventDefault();

    const newClinic = {
        id: data.clinics.length + 1, // id = عدد العيادات + 1
        region_id: Number(clinicRegion.value), // id المنطقة المختارة
        name: clinicName.value,
        name_en: clinicNameEn.value,
        address: clinicAddress.value,
        address_en: clinicAddressEn.value,
        phone: clinicPhone.value,
        working_hours: clinicHours.value,
        working_hours_en: clinicHoursEn.value,
        is_open: clinicStatus.value === "true",
        status: clinicStatus.value === "true" ? "مفتوحة" : "مغلقة",
        status_en: clinicStatus.value === "true" ? "Open" : "Closed",
        pharmacist_id: clinicPharmacist.value
            ? Number(clinicPharmacist.value)
            : null
    };

    data.clinics.push(newClinic);
    // إعادة العرض
    renderClinics();
    renderRegions();
    fillClinicSelects();

    // إغلاق المودال
    bootstrap.Modal.getInstance(addClinicModal).hide();

    // تصفير الفورم
    e.target.reset();
});


function openEditClinic(id) {
    editClinicId = id;
    const clinic = data.clinics.find(c => c.id === id);
    editClinicName.value = clinic.name;
    editClinicPhone.value = clinic.phone;
    editClinicRegion.value = clinic.region_id;
    bootstrap.Modal.getOrCreateInstance(editClinicModal).show();
}

document.getElementById("editClinicForm").addEventListener("submit", e => {
    e.preventDefault();
    const clinic = data.clinics.find(c => c.id === editClinicId);
    clinic.name = editClinicName.value;
    clinic.phone = editClinicPhone.value;
    clinic.region_id = parseInt(editClinicRegion.value);
    renderClinics();
    fillClinicSelects();
    bootstrap.Modal.getInstance(editClinicModal).hide();
});

// --- Pharmacists ---
function renderPharmacists() {
    const list = document.getElementById("pharmacistsList");
    list.innerHTML = "";
    data.pharmacists.forEach((p, i) => {
        const clinic = data.clinics.find(c => c.id === p.clinic_id);
        list.innerHTML += `
        <tr>
            <td>${i + 1}</td>
            <td>${p.name}</td>
            <td>${clinic ? clinic.name : ""}</td>
            <td>${p.phone}</td>
            <td>${p.email}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="openEditPharmacist(${p.id})">تعديل</button>
                <button class="btn btn-danger btn-sm" onclick="deletePharmacist(${p.id})">حذف</button>
            </td>
        </tr>`;
    });
}

function deletePharmacist(id) {
    data.pharmacists = data.pharmacists.filter(p => p.id !== id);
    renderPharmacists();
}

document.getElementById("addPharmacistForm").addEventListener("submit", e => {
    e.preventDefault();
    data.pharmacists.push({
        id: Date.now(),
        name: pharmacistName.value,
        phone: pharmacistPhone.value,
        email: pharmacistEmail.value,
        username: pharmacistUsername.value,
        password: pharmacistPassword.value,
        clinic_id: parseInt(pharmacistClinic.value)
    });
    renderPharmacists();
    bootstrap.Modal.getInstance(addPharmacistModal).hide();
});

function openEditPharmacist(id) {
    editPharmacistId = id;
    const p = data.pharmacists.find(p => p.id === id);
    editPharmacistName.value = p.name;
    editPharmacistPhone.value = p.phone;
    editPharmacistEmail.value = p.email;
    editPharmacistUsername.value = p.username;
    editPharmacistPassword.value = p.password;
    editPharmacistClinic.value = p.clinic_id;
    bootstrap.Modal.getOrCreateInstance(editPharmacistModal).show();
}

document.getElementById("editPharmacistForm").addEventListener("submit", e => {
    e.preventDefault();
    const p = data.pharmacists.find(p => p.id === editPharmacistId);
    p.name = editPharmacistName.value;
    p.phone = editPharmacistPhone.value;
    p.email = editPharmacistEmail.value;
    p.username = editPharmacistUsername.value;
    p.password = editPharmacistPassword.value;
    p.clinic_id = parseInt(editPharmacistClinic.value);
    renderPharmacists();
    bootstrap.Modal.getInstance(editPharmacistModal).hide();
});

// --- Fill selects ---
function fillRegionSelects() {
    [clinicRegion, editClinicRegion].forEach(sel => {
        sel.innerHTML = "";
        data.regions.forEach(r => {
            sel.innerHTML += `<option value="${r.id}">${r.name}</option>`;
        });
    });
}

function fillClinicSelects() {
    [pharmacistClinic, editPharmacistClinic].forEach(sel => {
        sel.innerHTML = "";
        data.clinics.forEach(c => {
            sel.innerHTML += `<option value="${c.id}">${c.name}</option>`;
        });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    checkAuth();
    loadData();
})

// تسجيل الخروج
function logout() {
    sessionStorage.removeItem('manager');
    window.location.href = 'manager-login.html';
}