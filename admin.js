const API_BASE_URL = window.RAMNAGARI_API_BASE_URL || "http://127.0.0.1:8000";
const adminLoginForm = document.getElementById("adminLoginForm");
const adminPanel = document.getElementById("adminPanel") || document.createElement("div");
const adminStatus = document.getElementById("adminStatus") || document.getElementById("adminLoginMessage");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
const createPartnerForm = document.getElementById("createPartnerForm");
const applicationsList = document.getElementById("partnerApplicationsList") || document.getElementById("applicationsList");
const partnersList = document.getElementById("partnerAccountsList") || document.getElementById("partnersList");
let adminToken = localStorage.getItem("ramnagari_admin_token") || "";

function setStatus(message, type = "") {
    if (!adminStatus) return;
    adminStatus.textContent = message;
    adminStatus.className = `hotel-status ${type}`.trim();
}

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
    };
}

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(options.auth !== false ? getAuthHeaders() : {}),
        },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || "Request failed");
    }
    return data;
}

function renderApplications(applications) {
    if (!applicationsList) return;
    if (!applications.length) {
        applicationsList.innerHTML = "<p>No applications yet.</p>";
        return;
    }
    applicationsList.innerHTML = applications.map((application) => `
        <div class="content-card" style="margin-bottom: 12px; padding: 12px;">
            <strong>${application.hotel_name}</strong>
            <p>${application.owner_name} · ${application.email}</p>
            <p>Status: ${application.status}</p>
            <p>${application.hotel_address}</p>
            <div class="page-cta-row" style="margin-top: 8px;">
                <button class="btn btn-primary" data-action="approve" data-id="${application.id}">Approve</button>
                <button class="btn btn-secondary" data-action="reject" data-id="${application.id}">Reject</button>
            </div>
        </div>
    `).join("");
}

function renderPartners(partners) {
    if (!partnersList) return;
    if (!partners.length) {
        partnersList.innerHTML = "<p>No partner accounts yet.</p>";
        return;
    }
    partnersList.innerHTML = partners.map((partner) => `
        <div class="content-card" style="margin-bottom: 12px; padding: 12px;">
            <strong>${partner.name}</strong>
            <p>${partner.email} · ${partner.username || "No username"}</p>
            <p>Status: ${partner.is_active ? "Active" : "Disabled"}</p>
            <div class="page-cta-row" style="margin-top: 8px;">
                <button class="btn btn-secondary" data-action="reset" data-id="${partner.id}">Reset Password</button>
                <button class="btn btn-secondary" data-action="disable" data-id="${partner.id}">Disable</button>
            </div>
        </div>
    `).join("");
}

async function loadPartnerData() {
    const applications = await request("/api/partners/applications");
    const partners = await request("/api/partners/accounts");
    renderApplications(applications);
    renderPartners(partners);
}

async function loginAdmin(event) {
    event.preventDefault();
    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value;
    try {
        const data = await request("/api/auth/login", {
            method: "POST",
            auth: false,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        adminToken = data.access_token;
        localStorage.setItem("ramnagari_admin_token", adminToken);
        setStatus("Admin login successful.", "success");
        document.dispatchEvent(new CustomEvent("admin:login"));
        adminPanel.style.display = "block";
        adminLogoutBtn.style.display = "inline-flex";
        await loadPartnerData();
    } catch (error) {
        setStatus(error.message || "Login failed.", "error");
    }
}

function logoutAdmin() {
    adminToken = "";
    localStorage.removeItem("ramnagari_admin_token");
    adminPanel.style.display = "none";
    adminLogoutBtn.style.display = "none";
    setStatus("Logged out.");
}

async function createPartner(event) {
    event.preventDefault();
    try {
        await request("/api/partners/accounts", {
            method: "POST",
            body: JSON.stringify({
                name: document.getElementById("partnerName").value.trim(),
                email: document.getElementById("partnerEmail").value.trim(),
                phone: document.getElementById("partnerPhone").value.trim(),
                username: document.getElementById("partnerUsername").value.trim(),
                password: document.getElementById("partnerPassword").value.trim(),
            }),
        });
        createPartnerForm.reset();
        setStatus("Partner account created.", "success");
        await loadPartnerData();
    } catch (error) {
        setStatus(error.message || "Could not create partner account.", "error");
    }
}

async function handleAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const action = button.getAttribute("data-action");
    const id = Number(button.getAttribute("data-id"));
    try {
        if (action === "approve") {
            await request(`/api/partners/applications/${id}/approve`, { method: "POST" });
        } else if (action === "reject") {
            await request(`/api/partners/applications/${id}/reject`, { method: "POST" });
        } else if (action === "reset") {
            await request(`/api/partners/accounts/${id}/reset-password`, { method: "POST" });
        } else if (action === "disable") {
            await request(`/api/partners/accounts/${id}`, { method: "DELETE" });
        }
        await loadPartnerData();
        setStatus("Action completed.", "success");
    } catch (error) {
        setStatus(error.message || "Action failed.", "error");
    }
}

if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", loginAdmin);
}
if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", logoutAdmin);
}
if (createPartnerForm) {
    createPartnerForm.addEventListener("submit", createPartner);
}
if (applicationsList || partnersList) {
    document.addEventListener("click", handleAction);
}

if (adminToken) {
    if (adminPanel && adminPanel !== document.createElement("div")) {
        adminPanel.style.display = "block";
    }
    if (adminLogoutBtn) {
        adminLogoutBtn.style.display = "inline-flex";
    }
    setStatus("Admin session restored.");
    loadPartnerData().catch(() => setStatus("Unable to load partner data.", "error"));
}


