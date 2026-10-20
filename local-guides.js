const localGuidesList = document.getElementById("localGuidesList");
const localGuideQuestionForm = document.getElementById("localGuideQuestionForm");
const localGuideQuestion = document.getElementById("localGuideQuestion");
const localGuideFeedback = document.getElementById("localGuideFeedback");
const localGuideApiBase = window.RAMNAGARI_API_BASE_URL || "http://127.0.0.1:8000";
let onlineLocalGuides = [];

function safeText(value) {
    const node = document.createElement("span");
    node.textContent = value || "";
    return node.innerHTML;
}

function renderTravelDeskAssistance(message) {
    if (!localGuidesList) return;
    localGuidesList.innerHTML = `
        <article class="local-guide-assistance">
            <h3>Plan your visit with our travel team</h3>
            <p>${safeText(message)}</p>
            <div class="local-guide-assistance-actions">
                <a href="https://wa.me/917607745628?text=Hello%20Ramnagari%20Tourism%2C%20I%20need%20help%20planning%20my%20visit." target="_blank" rel="noopener">Chat on WhatsApp</a>
                <a href="tel:+917607745628">Call our team</a>
            </div>
        </article>
    `;
}

function renderLocalGuides() {
    if (!localGuidesList) return;
    if (!onlineLocalGuides.length) {
        renderTravelDeskAssistance("No local guide is available online right now. Contact us for temple visits, sightseeing, cabs and travel arrangements.");
        return;
    }
    localGuidesList.innerHTML = onlineLocalGuides.map((guide) => `
        <article class="local-guide-card">
            <div class="local-guide-avatar" aria-hidden="true">${safeText(guide.name.charAt(0).toUpperCase())}</div>
            <div><span class="guide-online-status">● Online now</span><h3>${safeText(guide.name)}</h3><p>${safeText(guide.languages || "Hindi")}</p><small>${safeText(guide.specialties || "Local assistance")}</small></div>
        </article>
    `).join("");
}

async function loadOnlineLocalGuides() {
    if (!localGuidesList) return;
    try {
        const response = await fetch(`${localGuideApiBase}/api/local-guides/online`);
        if (!response.ok) throw new Error("Unable to load guides");
        onlineLocalGuides = await response.json();
        renderLocalGuides();
    } catch (error) {
        renderTravelDeskAssistance("Live guide availability is temporarily unavailable. Our team can still help with temple visits, sightseeing, cabs and travel arrangements.");
    }
}

if (localGuideQuestionForm) {
    localGuideQuestionForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const question = localGuideQuestion.value.trim();
        const replyMethod = localGuideQuestionForm.querySelector("input[name='guideReplyMethod']:checked").value;
        if (!question) return;
        const guide = onlineLocalGuides[0];
        const phone = (guide?.phone || "917607745628").replace(/\D/g, "");
        const guideName = guide?.name || "Ramnagari Tourism travel desk";
        const message = `Namaste ${guideName}, mujhe Ayodhya local help chahiye.\n\nQuestion: ${question}\n\nPreferred reply: ${replyMethod}`;
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        if (replyMethod === "Voice call") {
            localGuideFeedback.textContent = `${guideName} ko aapki call request ke saath WhatsApp message bheja ja raha hai.`;
        } else {
            localGuideFeedback.textContent = `Connecting you with ${guideName} on WhatsApp…`;
        }
        window.open(whatsappUrl, "_blank", "noopener");
    });
}

loadOnlineLocalGuides();
