const API_BASE_URL = "http://127.0.0.1:8000";

const destinationSelect = document.getElementById("hotelDestinationSelect");
const categorySelect = document.getElementById("hotelCategorySelect");
const hotelFilterForm = document.getElementById("hotelFilterForm");
const hotelOptionsGrid = document.getElementById("hotelOptionsGrid");
const hotelStatus = document.getElementById("hotelStatus");
const authForm = document.getElementById("hotelAuthForm");
const authEmail = document.getElementById("hotelAuthEmail");
const authPassword = document.getElementById("hotelAuthPassword");
const authRole = document.getElementById("hotelAuthRole");
const authStatus = document.getElementById("hotelAuthStatus");
const authLogoutBtn = document.getElementById("hotelAuthLogoutBtn");

const DESTINATION_IMAGES = {
    ayodhya: "../ayodhya.jpg",
    varanasi: "../varanasi.jpg",
    chitrakoot: "../chitrakoot.jpg",
    mathura: "../mathura.jpg",
    gaya: "../gaya.jpg",
    prayagraj: "../prayagraj.jpg",
    vindhyachal: "../vindhyachal.jpg",
    vrindavan: "../mathura.jpg",
    kashi: "../varanasi.jpg",
};

const CATEGORY_SCORES = {
    Budget: 6.4,
    "2 Star": 7.0,
    "3 Star": 7.8,
    "4 Star": 8.5,
};

const DEMO_HOTEL_OPTIONS = [
    {
        display_name: "Ramna Residency",
        category: "3 Star",
        selling_price_per_room: 3200,
        public_price: 3200,
        partner_price: 3040,
        rooms_available: 18,
        distance_from_tour_km: 1.2,
        nearby_place: "Ram Mandir road",
        amenities: ["AC Room", "Free WiFi", "Parking", "Breakfast"],
        check_in_time: "12:00 PM",
        check_out_time: "11:00 AM",
    },
    {
        display_name: "Hotel Ramlalla Palace",
        category: "4 Star",
        selling_price_per_room: 4800,
        public_price: 4800,
        partner_price: 4560,
        rooms_available: 12,
        distance_from_tour_km: 1.7,
        nearby_place: "Ayodhya city centre",
        amenities: ["AC Room", "WiFi", "Restaurant", "Room Service"],
        check_in_time: "1:00 PM",
        check_out_time: "11:00 AM",
    },
    {
        display_name: "Comfort Budget Stay",
        category: "Budget",
        selling_price_per_room: 1800,
        public_price: 1800,
        partner_price: 1710,
        rooms_available: 22,
        distance_from_tour_km: 2.4,
        nearby_place: "Bus stand area",
        amenities: ["Clean Room", "Hot Water", "Parking"],
        check_in_time: "12:00 PM",
        check_out_time: "10:00 AM",
    },
];

let selectedDestinationName = "";
let currentAuth = null;

function loadAuthSession() {
    try {
        const raw = window.localStorage.getItem("ramnagariAuthSession");
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function saveAuthSession(session) {
    window.localStorage.setItem("ramnagariAuthSession", JSON.stringify(session));
}

function clearAuthSession() {
    window.localStorage.removeItem("ramnagariAuthSession");
}

function getCurrentPrice(option) {
    if (currentAuth?.role === "hotel_partner") {
        return option.partner_price ?? option.selling_price_per_room ?? option.public_price ?? 0;
    }
    return option.public_price ?? option.selling_price_per_room ?? 0;
}

function getCurrentPriceLabel() {
    if (currentAuth?.role === "hotel_partner") {
        return "Partner price";
    }
    return "Public price";
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 3500) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        window.clearTimeout(timeoutId);
    }
}

function formatRupees(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function setHotelStatus(message, type = "") {
    hotelStatus.textContent = message;
    hotelStatus.className = `hotel-status ${type}`.trim();
}

function setAuthStatus(message, type = "") {
    if (!authStatus) {
        return;
    }
    authStatus.textContent = message;
    authStatus.className = `hotel-status ${type}`.trim();
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }[character]));
}

function getDestinationImage(destinationName, index = 0) {
    const slug = String(destinationName || "").trim().toLowerCase();
    const baseImage = DESTINATION_IMAGES[slug] || "../ayodhya.jpg";
    return baseImage;
}

function getStarCount(category) {
    const match = String(category || "").match(/^(\d)\s*Star/i);
    return match ? Number(match[1]) : 0;
}

function renderStars(count) {
    if (!count) {
        return "";
    }
    return `<span class="hotel-listing-stars" aria-label="${count} star hotel">${"★".repeat(count)}</span>`;
}

function getRatingLabel(score) {
    if (score >= 8.5) {
        return "Excellent";
    }
    if (score >= 8) {
        return "Very Good";
    }
    if (score >= 7) {
        return "Good";
    }
    if (score >= 6) {
        return "Pleasant";
    }
    return "Review score";
}

function buildDescription(option, destinationName) {
    const amenitiesText = option.amenities?.length
        ? option.amenities.slice(0, 4).join(", ")
        : "comfortable rooms with essential amenities";
    const nearby = option.nearby_place || "main sightseeing area";
    const distance = option.distance_from_tour_km ?? "1.5";

    return `Situated in ${escapeHtml(destinationName)}, ${escapeHtml(distance)} km from the tour centre near ${escapeHtml(nearby)}. ${escapeHtml(option.category)} stay with ${escapeHtml(amenitiesText)}. Check-in ${escapeHtml(option.check_in_time)}, check-out ${escapeHtml(option.check_out_time)}.`;
}

function getMapLink(destinationName, nearbyPlace) {
    const query = encodeURIComponent(`${nearbyPlace || destinationName}, ${destinationName}, Uttar Pradesh`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function hotelOptionTemplate(option, index) {
    const score = CATEGORY_SCORES[option.category] ?? 7.2;
    const ratingLabel = getRatingLabel(score);
    const reviewCount = Math.max(1, (option.rooms_available || 5) % 12 + 1);
    const starCount = getStarCount(option.category);
    const imageSrc = option.image_url || getDestinationImage(selectedDestinationName, index);
    const mapLink = getMapLink(selectedDestinationName, option.nearby_place);
    const price = getCurrentPrice(option);
    const priceLabel = getCurrentPriceLabel();

    return `
        <article class="hotel-listing-card">
            <div class="hotel-listing-image">
                <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(option.display_name)}" loading="lazy" onerror="this.src='../ayodhya.jpg'">
                <button type="button" class="hotel-fav-btn" aria-label="Save to favourites">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                </button>
            </div>

            <div class="hotel-listing-body">
                <div class="hotel-listing-main">
                    <h2 class="hotel-listing-name">
                        <a href="booking.html">${escapeHtml(option.display_name)}</a>
                        ${renderStars(starCount)}
                    </h2>
                    <div class="hotel-listing-location">
                        <a href="destinations.html" class="hotel-location-link">${escapeHtml(selectedDestinationName)}</a>
                        <span class="hotel-location-dot">·</span>
                        <a href="${mapLink}" class="hotel-location-link" target="_blank" rel="noopener">Show on map</a>
                        <span class="hotel-location-dot">·</span>
                        <span>${escapeHtml(option.distance_from_tour_km)} km from centre</span>
                    </div>
                    <p class="hotel-listing-desc">${buildDescription(option, selectedDestinationName)}</p>
                    <div class="hotel-listing-tags">
                        <span class="hotel-category-pill">${escapeHtml(option.category)}</span>
                        <span class="hotel-tag">${escapeHtml(option.rooms_available)} rooms available</span>
                    </div>
                </div>

                <aside class="hotel-listing-aside">
                    <div class="hotel-listing-rating">
                        <div class="hotel-rating-text">
                            <strong>${ratingLabel}</strong>
                            <span>${reviewCount} review${reviewCount > 1 ? "s" : ""}</span>
                        </div>
                        <div class="hotel-rating-score">${score.toFixed(1)}</div>
                    </div>
                    <div class="hotel-listing-price">
                        <span class="hotel-price-label">From</span>
                        <strong class="hotel-price-value">${formatRupees(price)}</strong>
                        <span class="hotel-price-unit">${escapeHtml(priceLabel)} · per room / night</span>
                    </div>
                    <a href="booking.html" class="hotel-select-dates-btn">Select dates</a>
                </aside>
            </div>
        </article>
    `;
}

function renderHotelOptions(options) {
    if (!options.length) {
        setHotelStatus("No hotel options found for this destination and type.", "error");
        hotelOptionsGrid.innerHTML = "";
        return;
    }

    const pricingContext = currentAuth?.role === "hotel_partner" ? "partner" : "public";
    setHotelStatus(`${options.length} propert${options.length > 1 ? "ies" : "y"} found in ${selectedDestinationName}. Showing ${pricingContext} pricing.`, "success");
    hotelOptionsGrid.innerHTML = options.map((option, index) => hotelOptionTemplate(option, index)).join("");
    bindFavoriteButtons();
}

function renderDemoHotels() {
    selectedDestinationName = selectedDestinationName || "Ayodhya";
    destinationSelect.innerHTML = `<option value="demo">Ayodhya</option>`;
    setHotelStatus("Showing sample hotel layout. Start backend for live prices.", "error");
    renderHotelOptions(DEMO_HOTEL_OPTIONS);
}

function bindFavoriteButtons() {
    hotelOptionsGrid.querySelectorAll(".hotel-fav-btn").forEach((button) => {
        button.addEventListener("click", () => {
            button.classList.toggle("is-active");
        });
    });
}

function updateAuthUi() {
    if (!authEmail || !authPassword || !authRole || !authLogoutBtn || !authStatus) {
        return;
    }

    if (currentAuth) {
        authEmail.value = currentAuth.user?.email || "";
        authPassword.value = "";
        authRole.value = currentAuth.role || "customer";
        authLogoutBtn.style.display = "inline-flex";
        setAuthStatus(`Signed in as ${currentAuth.user?.name || currentAuth.user?.email || currentAuth.role}. ${currentAuth.role === "hotel_partner" ? "Partner" : "Public"} pricing is active.`, "success");
    } else {
        authEmail.value = "";
        authPassword.value = "";
        authRole.value = "customer";
        authLogoutBtn.style.display = "none";
        setAuthStatus("Public pricing is active.");
    }
}

async function loadDestinations() {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/api/catalog/destinations`);
        if (!response.ok) {
            throw new Error("Could not load destinations");
        }
        const destinations = await response.json();
        destinationSelect.innerHTML = destinations
            .map((destination) => `<option value="${destination.id}">${escapeHtml(destination.name)}</option>`)
            .join("");

        if (destinations.length) {
            selectedDestinationName = destinations[0].name;
            await loadHotelOptions();
        } else {
            setHotelStatus("No destinations are available right now.", "error");
        }
    } catch (error) {
        destinationSelect.innerHTML = '<option value="demo">Ayodhya</option>';
        renderDemoHotels();
    }
}

async function loadHotelOptions() {
    const destinationId = destinationSelect.value;
    const category = categorySelect.value;
    const selectedOption = destinationSelect.selectedOptions[0];
    selectedDestinationName = selectedOption?.textContent?.trim() || selectedDestinationName;

    if (!destinationId) {
        setHotelStatus("Select a destination to view hotel options.");
        hotelOptionsGrid.innerHTML = "";
        return;
    }

    setHotelStatus("Loading hotel options...");
    hotelOptionsGrid.innerHTML = "";

    const params = new URLSearchParams({ destination_id: destinationId });
    if (category) {
        params.set("category", category);
    }

    const headers = {};
    if (currentAuth?.token) {
        headers.Authorization = `Bearer ${currentAuth.token}`;
    }

    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/api/catalog/hotel-options?${params.toString()}`, { headers });
        if (!response.ok) {
            throw new Error("Could not load hotel options");
        }
        const options = await response.json();
        renderHotelOptions(options);
    } catch (error) {
        renderDemoHotels();
    }
}

async function handleAuthSubmit(event) {
    event.preventDefault();
    const email = authEmail.value.trim();
    const password = authPassword.value;
    const role = authRole.value;

    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, role }),
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Login failed");
        }

        currentAuth = {
            token: data.access_token,
            role: data.user?.role || role,
            user: data.user,
        };
        saveAuthSession(currentAuth);
        updateAuthUi();
        await loadHotelOptions();
    } catch (error) {
        currentAuth = null;
        clearAuthSession();
        updateAuthUi();
        setAuthStatus(error.message || "Login failed. Please try again.", "error");
    }
}

function handleLogout() {
    currentAuth = null;
    clearAuthSession();
    updateAuthUi();
    loadHotelOptions();
}

if (hotelFilterForm) {
    hotelFilterForm.addEventListener("submit", (event) => {
        event.preventDefault();
        loadHotelOptions();
    });
}

if (destinationSelect) {
    destinationSelect.addEventListener("change", () => {
        selectedDestinationName = destinationSelect.selectedOptions[0]?.textContent?.trim() || "";
    });
}

if (authForm) {
    authForm.addEventListener("submit", handleAuthSubmit);
}

if (authLogoutBtn) {
    authLogoutBtn.addEventListener("click", handleLogout);
}

currentAuth = loadAuthSession();
updateAuthUi();
loadDestinations();


