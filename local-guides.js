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

function renderLocalGuides() {
    if (!localGuidesList) return;
    if (!onlineLocalGuides.length) {
        localGuidesList.innerHTML = "<p class=\"local-guides-empty\">No guide is marked online right now. You can still send your question to our travel desk.</p>";
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
        localGuidesList.innerHTML = "<p class=\"local-guides-empty\">Local guide service is temporarily unavailable. Please contact our travel desk.</p>";
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
