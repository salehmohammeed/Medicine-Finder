let data = null;
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

// --- Regions ---
function renderRegions() {
    const list = document.getElementById("regionsList");
    list.innerHTML = "";
    data.regions.forEach((r, i) => {
        const clinicsCount = data.clinics.filter(c => c.region_id === r.id).length;
        list.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${r.name}</td>
                <td>${clinicsCount}</td>
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
        id: Date.now(),
        name: regionName.value,
        name_en: regionNameEn.value
    });
    renderRegions();
    fillRegionSelects();
    bootstrap.Modal.getInstance(addRegionModal).hide();
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
        list.innerHTML += `
        <tr>
            <td>${i + 1}</td>
            <td>${c.name}</td>
            <td>${region ? region.name : ""}</td>
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
    data.clinics.push({
        id: Date.now(),
        name: clinicName.value,
        region_id: parseInt(clinicRegion.value),
        phone: clinicPhone.value
    });
    renderClinics();
    fillClinicSelects();
    bootstrap.Modal.getInstance(addClinicModal).hide();
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

document.addEventListener("DOMContentLoaded", loadData);
