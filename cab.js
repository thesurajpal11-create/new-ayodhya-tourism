const WHATSAPP_NUMBER = "917607745628";

const CAB_LOCATIONS = [
    { id: "ayodhya", label: "Ayodhya" },
    { id: "ayodhya-railway", label: "Ayodhya Railway Station" },
    { id: "faizabad", label: "Faizabad" },
    { id: "varanasi", label: "Varanasi" },
    { id: "prayagraj", label: "Prayagraj" },
    { id: "chitrakoot", label: "Chitrakoot" },
    { id: "mathura", label: "Mathura" },
    { id: "vrindavan", label: "Vrindavan" },
    { id: "vindhyachal", label: "Vindhyachal" },
    { id: "lucknow", label: "Lucknow" },
    { id: "gorakhpur", label: "Gorakhpur" },
    { id: "delhi", label: "Delhi" },
];

const VEHICLE_TYPES = [
    {
        id: "sedan",
        name: "Sedan",
        seats: "4 passengers",
        note: "Couples and small families",
    },
    {
        id: "suv",
        name: "SUV",
        seats: "6 passengers",
        note: "Family outstation trips",
    },
    {
        id: "innova",
        name: "Innova",
        seats: "7 passengers",
        note: "Premium pilgrimage tours",
    },
    {
        id: "tempo",
        name: "Tempo Traveller",
        seats: "12 passengers",
        note: "Groups and yatra teams",
    },
];

const PER_KM_RATES = {
    sedan: 14,
    suv: 16,
    innova: 18,
    tempo: 22,
};

const LOCAL_DAY_RATES = {
    sedan: 2200,
    suv: 2800,
    innova: 3200,
    tempo: 4500,
};

const ROUTE_DATA = {
    "ayodhya|varanasi": { km: 220, duration: "5–6 hours" },
    "ayodhya|prayagraj": { km: 165, duration: "3.5–4 hours" },
    "ayodhya|chitrakoot": { km: 130, duration: "3–3.5 hours" },
    "ayodhya|mathura": { km: 520, duration: "9–10 hours" },
    "ayodhya|vrindavan": { km: 530, duration: "9–10 hours" },
    "ayodhya|vindhyachal": { km: 175, duration: "4–4.5 hours" },
    "ayodhya|lucknow": { km: 135, duration: "3 hours" },
    "ayodhya|gorakhpur": { km: 140, duration: "3–3.5 hours" },
    "ayodhya|faizabad": { km: 10, duration: "25–30 min" },
    "ayodhya|delhi": { km: 680, duration: "11–12 hours" },
    "ayodhya|ayodhya-railway": { km: 8, duration: "20 min" },
    "varanasi|prayagraj": { km: 125, duration: "2.5–3 hours" },
    "varanasi|vindhyachal": { km: 65, duration: "1.5 hours" },
    "prayagraj|chitrakoot": { km: 130, duration: "3 hours" },
    "mathura|vrindavan": { km: 15, duration: "30 min" },
    "lucknow|ayodhya": { km: 135, duration: "3 hours" },
    "faizabad|ayodhya": { km: 10, duration: "25–30 min" },
};

const sourceSelect = document.getElementById("cabSource");
const destinationSelect = document.getElementById("cabDestination");
const tripTypeSelect = document.getElementById("cabTripType");
const pickupDateInput = document.getElementById("cabPickupDate");
const swapRouteButton = document.getElementById("swapRoute");
const estimateButton = document.getElementById("cabEstimateButton");
const estimateSummary = document.getElementById("cabEstimateSummary");
const estimateText = document.getElementById("cabEstimateText");
const rateResults = document.getElementById("cabRateResults");
const routeSummary = document.getElementById("cabRouteSummary");
const ratePlaceholder = document.getElementById("cabRatePlaceholder");

function routeKey(sourceId, destinationId) {
    return [sourceId, destinationId].sort().join("|");
}

function setMinPickupDate() {
    if (!pickupDateInput) {
        return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    pickupDateInput.min = `${year}-${month}-${day}`;
}

function formatRupees(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount || 0);
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;",
    }[character]));
}

function getLocationId(value) {
    const normalized = String(value ?? "").trim().toLowerCase();
    if (!normalized) {
        return "";
    }

    const exactMatch = CAB_LOCATIONS.find(
        (location) => location.id.toLowerCase() === normalized || location.label.toLowerCase() === normalized
    );

    return exactMatch?.id || "";
}

function getLocationLabel(locationId) {
    return CAB_LOCATIONS.find((location) => location.id === locationId)?.label || locationId;
}

function populateLocationSelects() {
    const locationOptions = CAB_LOCATIONS.map(
        (location) => `<option value="${escapeHtml(location.label)}"></option>`
    ).join("");

    const dataList = document.getElementById("cabLocationList");
    if (dataList) {
        dataList.innerHTML = locationOptions;
    }

    if (sourceSelect) {
        sourceSelect.value = "Ayodhya";
    }

    if (destinationSelect) {
        destinationSelect.value = "Varanasi";
    }
}

function getRouteInfo(sourceId, destinationId) {
    if (!sourceId || !destinationId) {
        return null;
    }

    if (sourceId === destinationId) {
        return { km: 80, duration: "8 hours (local)", isLocal: true };
    }

    const route = ROUTE_DATA[routeKey(sourceId, destinationId)];

    if (route) {
        return { ...route, isLocal: false };
    }

    return { km: 200, duration: "Contact for exact time", isLocal: false, isEstimate: true };
}

function calculateVehicleFare(vehicleId, routeInfo, tripType) {
    if (routeInfo.isLocal || tripType === "local") {
        return LOCAL_DAY_RATES[vehicleId];
    }

    const perKm = PER_KM_RATES[vehicleId];
    let fare = Math.round(routeInfo.km * perKm);

    if (tripType === "round") {
        fare = Math.round(fare * 1.75);
    }

    return fare;
}

function buildWhatsAppLink({ sourceId, destinationId, tripType, vehicleName, fare, routeInfo }) {
    const sourceLabel = getLocationLabel(sourceId);
    const destinationLabel = getLocationLabel(destinationId);
    const tripLabel = tripType === "round" ? "Round Trip" : tripType === "local" ? "Local Full Day" : "One Way";
    const dateLine = pickupDateInput?.value ? `\nPickup Date: ${pickupDateInput.value}` : "";

    const message = [
        "Hello Ramnagari Tourism, I need a cab quote:",
        `From: ${sourceLabel}`,
        `To: ${destinationLabel}`,
        `Trip Type: ${tripLabel}`,
        `Vehicle: ${vehicleName}`,
        `Estimated Fare: ${formatRupees(fare)}`,
        routeInfo.km ? `Approx Distance: ${routeInfo.km} km` : "",
        dateLine,
        "",
        "Please confirm availability and final rate. I would like to discuss further.",
    ]
        .filter(Boolean)
        .join("\n");

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function renderRates() {
    const sourceValue = sourceSelect?.value;
    const destinationValue = destinationSelect?.value;
    const sourceId = getLocationId(sourceValue);
    const destinationId = getLocationId(destinationValue);
    const tripType = tripTypeSelect?.value || "one-way";

    if (!sourceId || !destinationId || !rateResults) {
        return;
    }

    const routeInfo = getRouteInfo(sourceId, destinationId);
    const isSamePlace = sourceId === destinationId;

    if (routeSummary) {
        const sourceLabel = getLocationLabel(sourceId);
        const destinationLabel = getLocationLabel(destinationId);
        const tripLabel = isSamePlace || tripType === "local"
            ? "Local Full Day"
            : tripType === "round"
                ? "Round Trip"
                : "One Way";

        routeSummary.innerHTML = `
            <div class="cab-route-chip"><span>From</span><strong>${escapeHtml(sourceLabel)}</strong></div>
            <div class="cab-route-arrow" aria-hidden="true">→</div>
            <div class="cab-route-chip"><span>To</span><strong>${escapeHtml(destinationLabel)}</strong></div>
            <div class="cab-route-meta">
                <span>${escapeHtml(tripLabel)}</span>
                <span>${escapeHtml(routeInfo.duration)}</span>
                <span>${routeInfo.km} km approx.</span>
                ${routeInfo.isEstimate ? "<span>Estimated route — confirm with team</span>" : ""}
            </div>
        `;
        routeSummary.hidden = false;
    }

    if (ratePlaceholder) {
        ratePlaceholder.hidden = true;
    }

    const effectiveTripType = isSamePlace || tripType === "local" ? "local" : tripType;

    rateResults.innerHTML = VEHICLE_TYPES.map((vehicle) => {
        const fare = calculateVehicleFare(vehicle.id, routeInfo, effectiveTripType);
        const whatsappLink = buildWhatsAppLink({
            sourceId,
            destinationId,
            tripType: effectiveTripType,
            vehicleName: vehicle.name,
            fare,
            routeInfo,
        });

        return `
            <article class="cab-rate-card">
                <div class="cab-rate-card-top">
                    <h3>${escapeHtml(vehicle.name)}</h3>
                    <p class="cab-rate-amount">${formatRupees(fare)}</p>
                </div>
                <p class="cab-rate-meta">${escapeHtml(vehicle.seats)} · ${escapeHtml(vehicle.note)}</p>
                <p class="cab-rate-note">Indicative fare. Toll, parking & night charges extra if applicable.</p>
                <div class="cab-rate-actions">
                    <a href="${whatsappLink}" class="btn btn-primary" target="_blank" rel="noopener">Chat on WhatsApp</a>
                    <a href="tel:+917607745628" class="btn btn-secondary">Call Now</a>
                </div>
            </article>
        `;
    }).join("");

    rateResults.hidden = false;
}

function handleRouteChange() {
    if (rateResults) {
        rateResults.hidden = true;
        rateResults.innerHTML = "";
    }

    if (routeSummary) {
        routeSummary.hidden = true;
    }

    if (ratePlaceholder) {
        ratePlaceholder.hidden = false;
    }

    if (estimateSummary) {
        estimateSummary.hidden = true;
    }
}

function showEstimate() {
    const sourceValue = sourceSelect?.value;
    const destinationValue = destinationSelect?.value;
    const sourceId = getLocationId(sourceValue);
    const destinationId = getLocationId(destinationValue);
    const tripType = tripTypeSelect?.value || "one-way";

    if (!sourceId || !destinationId) {
        if (estimateSummary) {
            estimateText.textContent = "Please choose valid source and destination from the list.";
            estimateSummary.hidden = false;
        }
        return;
    }

    const routeInfo = getRouteInfo(sourceId, destinationId);
    const tripLabel = sourceId === destinationId || tripType === "local"
        ? "Local Full Day"
        : tripType === "round"
            ? "Round Trip"
            : "One Way";

    if (estimateSummary) {
        estimateText.innerHTML = `Estimated route from <strong>${escapeHtml(getLocationLabel(sourceId))}</strong> to <strong>${escapeHtml(getLocationLabel(destinationId))}</strong> for <strong>${escapeHtml(tripLabel)}</strong>. Approx. distance: <strong>${routeInfo.km} km</strong>. Duration: <strong>${escapeHtml(routeInfo.duration)}</strong>.`;
        estimateSummary.hidden = false;
    }

    if (ratePlaceholder) {
        ratePlaceholder.hidden = true;
    }

    renderRates();
}

if (swapRouteButton) {
    swapRouteButton.addEventListener("click", () => {
        const sourceValue = sourceSelect.value;
        sourceSelect.value = destinationSelect.value;
        destinationSelect.value = sourceValue;
        handleRouteChange();
    });
}

if (estimateButton) {
    estimateButton.addEventListener("click", showEstimate);
}

[sourceSelect, destinationSelect, tripTypeSelect, pickupDateInput].forEach((element) => {
    element?.addEventListener("change", handleRouteChange);
});

populateLocationSelects();
setMinPickupDate();
handleRouteChange();
