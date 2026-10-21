const API_BASE_URL = "http://127.0.0.1:8000";
const PARTNER_EMAIL = "ayodhyaramnagritourism@gmail.com";

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
        const emailResponse = await fetch(`https://formsubmit.co/ajax/${PARTNER_EMAIL}`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...payload,
                _subject: `New Hotel Partner Application: ${payload.hotel_name}`,
                _template: "table",
                _captcha: "false",
                _replyto: payload.email,
            }),
        });
        const emailData = await emailResponse.json().catch(() => ({}));
        if (!emailResponse.ok || emailData.success === false) {
            throw new Error("Email could not be sent. Please try again.");
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/partners/applications`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error("Backend application was not saved");
            }
        } catch (backendError) {
            console.warn("Partner application API unavailable; application email was sent.", backendError);
        }
        form.reset();
        statusBox.textContent = "Thank you. Your application details have been emailed for review. Our team will contact you; your hotel will not be listed until it has been reviewed.";
        statusBox.className = "hotel-status success";
    } catch (error) {
        statusBox.textContent = error.message || "Unable to send hotel details. Please try again.";
        statusBox.className = "hotel-status error";
    }
}

if (form) {
    form.addEventListener("submit", submitApplication);
}
