const localGuidesAdminPanel = document.getElementById("localGuidesAdminPanel");
const addLocalGuideForm = document.getElementById("addLocalGuideForm");
const localGuidesAdminList = document.getElementById("localGuidesAdminList");
const localGuideAdminMessage = document.getElementById("localGuideAdminMessage");
const localGuidesAdminApiBase = window.RAMNAGARI_API_BASE_URL || "http://127.0.0.1:8000";

function localGuidesAdminHeaders() {
    return { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("ramnagari_admin_token") || ""}` };
}

function setGuideAdminMessage(message, type = "") {
    if (!localGuideAdminMessage) return;
    localGuideAdminMessage.textContent = message;
    localGuideAdminMessage.className = `admin-message ${type}`;
}

async function localGuideAdminRequest(path, options = {}) {
    const response = await fetch(`${localGuidesAdminApiBase}${path}`, { ...options, headers: localGuidesAdminHeaders() });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || "Request failed");
    return data;
}

function renderAdminGuides(guides) {
    if (!localGuidesAdminList) return;
    localGuidesAdminList.innerHTML = guides.length ? guides.map((guide) => `
        <div class="local-guide-admin-row"><div><strong>${guide.name}</strong><p>${guide.phone} · ${guide.languages || "Hindi"}</p><small>${guide.specialties || "Local assistance"}</small></div><div><span>${guide.is_online ? "Online" : "Offline"}</span><button type="button" class="btn btn-secondary" data-guide-toggle="${guide.id}" data-online="${!guide.is_online}">${guide.is_online ? "Set Offline" : "Set Online"}</button><button type="button" class="btn btn-secondary" data-guide-disable="${guide.id}">Disable</button></div></div>
    `).join("") : "<p>No local guides added yet.</p>";
}

async function loadAdminGuides() {
    const guides = await localGuideAdminRequest("/api/admin/local-guides");
    renderAdminGuides(guides);
}

async function showLocalGuidesAdmin() {
    if (!localGuidesAdminPanel) return;
    try {
        await loadAdminGuides();
        localGuidesAdminPanel.classList.remove("is-hidden");
    } catch (error) {
        localGuidesAdminPanel.classList.add("is-hidden");
    }
}

document.addEventListener("admin:login", showLocalGuidesAdmin);

if (localStorage.getItem("ramnagari_admin_token")) showLocalGuidesAdmin();

if (addLocalGuideForm) {
    addLocalGuideForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        try {
            await localGuideAdminRequest("/api/admin/local-guides", { method: "POST", body: JSON.stringify({ name: document.getElementById("localGuideName").value.trim(), phone: document.getElementById("localGuidePhone").value.trim(), languages: document.getElementById("localGuideLanguages").value.trim(), specialties: document.getElementById("localGuideSpecialties").value.trim(), is_online: document.getElementById("localGuideOnline").value === "true" }) });
            addLocalGuideForm.reset();
            setGuideAdminMessage("Verified guide added.", "success");
            await loadAdminGuides();
        } catch (error) { setGuideAdminMessage(error.message, "error"); }
    });
}

if (localGuidesAdminList) {
    localGuidesAdminList.addEventListener("click", async (event) => {
        const toggle = event.target.closest("[data-guide-toggle]");
        const disable = event.target.closest("[data-guide-disable]");
        try {
            if (toggle) await localGuideAdminRequest(`/api/admin/local-guides/${toggle.dataset.guideToggle}`, { method: "PUT", body: JSON.stringify({ is_online: toggle.dataset.online === "true" }) });
            if (disable) await localGuideAdminRequest(`/api/admin/local-guides/${disable.dataset.guideDisable}`, { method: "DELETE" });
            if (toggle || disable) await loadAdminGuides();
        } catch (error) { setGuideAdminMessage(error.message, "error"); }
    });
}
