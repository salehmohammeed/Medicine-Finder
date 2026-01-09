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
                <button class="btn btn-sm btn-warning" onclick="openEditRegion(${r.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteRegion(${r.id})"><i class="fas fa-trash"></i></button>
                </td?
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
    });
    renderRegions();
    fillRegionSelects();
    bootstrap.Modal.getInstance(addRegionModal).hide();
    e.target.reset()
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
        const pharmacistClinic = data.pharmacists.find(p => p.clinic_id === c.id);
        list.innerHTML += `
        <tr>
            <td>${i + 1}</td>
            <td>${c.name}</td>
            <td>${region ? region.name : ""}</td>
            <td>${pharmacistClinic ? pharmacistClinic.name : "لا يوجد صيدلاني"}</td>
            <td>${c.phone}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="openEditClinic(${c.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteClinic(${c.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
}

function deleteClinic(id) {
    data.clinics = data.clinics.filter(c => c.id !== id);
    renderRegions()
    renderClinics();
    renderPharmacists()
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
            <td>${clinic ? clinic.name : "العيادة غير محددة"}</td>
            <td>${p.phone}</td>
            <td>${p.email}</td>
            <td>${p.username}</td>
            <td>${p.password}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="openEditPharmacist(${p.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deletePharmacist(${p.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
}

function deletePharmacist(id) {
    data.pharmacists = data.pharmacists.filter(p => p.id !== id);
    renderPharmacists();
    renderClinics();

}
function fillPharmacistClinicSelect() {
    const select = document.getElementById("pharmacistClinic");
    select.innerHTML = ""; // مسح القديم

    // فلتر العيادات التي لا يوجد فيها صيدلي
    const clinicsWithoutPharmacist = data.clinics.filter(clinic => {
        // تحويل كلا الجانبين إلى number للتأكد
        return !data.pharmacists.some(p => Number(p.clinic_id) === Number(clinic.id));
    });

    if (clinicsWithoutPharmacist.length > 0) {
        // إضافة العيادات المتاحة
        clinicsWithoutPharmacist.forEach(clinic => {
            const option = document.createElement("option");
            option.value = clinic.id;
            option.textContent = clinic.name;
            select.appendChild(option);
        });
        select.disabled = false; // تفعيل الاختيار
    } else {
        // إذا كل العيادات مشغولة
        const option = document.createElement("option");
        option.textContent = "لا يوجد عيادات بدون صيدلي";
        option.value = "";
        option.disabled = true;
        option.selected = true;
        select.appendChild(option);
        select.disabled = true; // منع الاختيار
    }
}

// تحديث الـ select قبل فتح المودال
const addPharmacistModalEl = document.getElementById("addPharmacistModal");
addPharmacistModalEl.addEventListener("show.bs.modal", fillPharmacistClinicSelect);
document.getElementById("addPharmacistForm").addEventListener("submit", e => {
    e.preventDefault();
    // إذا كل العيادات ممتلئة، لا نفعل شيء
    if (!pharmacistClinic.value) return;
    // إيجاد أعلى ID موجود
    const lastId = data.pharmacists.length > 0
        ? Math.max(...data.pharmacists.map(p => p.id))
        : 0;

    data.pharmacists.push({
        id: lastId + 1, // ID جديد = أعلى ID + 1
        name: pharmacistName.value,
        name_en: pharmacistNameEn.value,
        phone: pharmacistPhone.value,
        email: pharmacistEmail.value,
        username: pharmacistUsername.value,
        password: pharmacistPassword.value,
        clinic_id: parseInt(pharmacistClinic.value)
    });
    renderClinics();
    renderPharmacists();
    fillPharmacistClinicSelect(); // تحديث الاختيارات بعد الإضافة
    bootstrap.Modal.getInstance(addPharmacistModal).hide();
    e.target.reset();
});

function fillEditPharmacistClinicSelect(pharmacistId) {
    const select = document.getElementById("editPharmacistClinic");
    select.innerHTML = "";

    const currentPharmacist = data.pharmacists.find(p => p.id === pharmacistId);

    // العيادات المتاحة (فارغة أو العيادة الحالية)
    const availableClinics = data.clinics.filter(clinic =>
        !data.pharmacists.some(p =>
            p.clinic_id === clinic.id && p.id !== pharmacistId
        )
    );

    if (availableClinics.length > 0) {
        availableClinics.forEach(clinic => {
            const option = document.createElement("option");
            option.value = clinic.id;
            option.textContent = clinic.name;

            if (clinic.id === currentPharmacist.clinic_id) {
                option.selected = true;
            }

            select.appendChild(option);
        });

        select.disabled = false;
    } else {
        const option = document.createElement("option");
        option.textContent = "لا يوجد عيادات أخرى بدون صيدلي";
        option.disabled = true;
        option.selected = true;
        select.appendChild(option);
        select.disabled = true;
    }
}

function openEditPharmacist(id) {
    editPharmacistId = id;
    const p = data.pharmacists.find(p => p.id === id);

    editPharmacistName.value = p.name;
    editPharmacistPhone.value = p.phone;
    editPharmacistEmail.value = p.email;
    editPharmacistUsername.value = p.username;
    editPharmacistPassword.value = p.password;


    fillEditPharmacistClinicSelect(id);
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
    renderClinics();
    renderPharmacists();
    renderPharmacists();
    bootstrap.Modal.getInstance(editPharmacistModal).hide();
    e.target.reset();
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