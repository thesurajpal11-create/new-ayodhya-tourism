const API_BASE_URL = "http://127.0.0.1:8000";

const form = document.getElementById("partnerApplicationForm");
const statusBox = document.getElementById("partnerApplicationStatus");

async function submitApplication(event) {
    event.preventDefault();
    if (!form) return;

    const payload = {
        hotel_name: document.getElementById("hotel_name").value.trim(),
        owner_name: document.getElementById("owner_name").value.trim(),
        mobile_number: document.getElementById("mobile_number").value.trim(),
        email: document.getElementById("email").value.trim(),
        hotel_address: document.getElementById("hotel_address").value.trim(),
        gst_number: document.getElementById("gst_number").value.trim(),
        number_of_rooms: Number(document.getElementById("number_of_rooms").value),
        hotel_photos: document.getElementById("hotel_photos").value.trim(),
        id_proof_path: document.getElementById("id_proof_path").value.trim(),
    };

    statusBox.textContent = "Submitting application...";
    statusBox.className = "hotel-status";

    try {
        const response = await fetch(`${API_BASE_URL}/api/partners/applications`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Could not submit application");
        form.reset();
        statusBox.textContent = "Application submitted successfully. Admin will review it soon.";
        statusBox.className = "hotel-status success";
    } catch (error) {
        statusBox.textContent = error.message || "Unable to submit application.";
        statusBox.className = "hotel-status error";
    }
}

if (form) {
    form.addEventListener("submit", submitApplication);
}


