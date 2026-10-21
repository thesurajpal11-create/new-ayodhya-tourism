const API_BASE_URL = "http://127.0.0.1:8000";
const PARTNER_HOTEL_STORAGE_KEY = "ramnagariActivePartnerHotel";

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
    ayodhya: "../images/ayodhya.jpg",
    varanasi: "../images/varanasi.jpg",
    chitrakoot: "../images/chitrakoot.jpg",
    mathura: "../images/mathura.jpg",
    gaya: "../images/gaya.jpg",
    prayagraj: "../images/prayagraj.jpg",
    vindhyachal: "../images/vindhyachal.jpg",
    vrindavan: "../images/mathura.jpg",
    kashi: "../images/varanasi.jpg",
};

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
    return option.selling_price_per_room ?? option.public_price ?? 0;
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

function updateFloatingContactVisibility() {
    const floatingContact = document.querySelector(".hotel-page .floating-contact");
    if (!floatingContact) {
        return;
    }

    floatingContact.classList.remove("is-hidden");
    const contactRect = floatingContact.getBoundingClientRect();
    const targets = document.querySelectorAll([
        ".hotel-banner h1",
        ".hotel-banner p",
        ".hotel-partner-card h2",
        ".hotel-partner-card p",
        ".hotel-partner-benefits li",
        ".hotel-auth-card h2",
        ".hotel-auth-card p",
        ".hotel-auth-card label",
        ".hotel-auth-card input",
        ".hotel-auth-card select",
        ".hotel-auth-card button",
        ".hotel-search-form label",
        ".hotel-search-form input",
        ".hotel-search-form select",
        ".hotel-search-form button",
        ".hotel-empty-copy h2",
        ".hotel-empty-copy p",
        ".hotel-empty-copy a",
        ".hotel-listing-card",
        ".hotel-info-card h2",
        ".hotel-info-card p",
        ".hotel-info-card li",
        ".hotel-info-card a",
        ".footer-brand p",
        ".footer-contact a",
        ".footer-contact span",
        ".footer-bottom p",
    ].join(", "));
    const overlapsContact = Array.from(targets).some((target) => {
        const range = document.createRange();
        range.selectNodeContents(target);
        const textRects = Array.from(range.getClientRects());
        const rects = textRects.length ? textRects : [target.getBoundingClientRect()];

        return rects.some((rect) => (
            rect.width > 0
            && rect.height > 0
            && rect.right > contactRect.left
            && rect.left < contactRect.right
            && rect.bottom > contactRect.top
            && rect.top < contactRect.bottom
        ));
    });

    floatingContact.classList.toggle("is-hidden", overlapsContact);
}

function bindFloatingContactVisibility() {
    let updatePending = false;
    const scheduleUpdate = () => {
        if (updatePending) {
            return;
        }
        updatePending = true;
        window.requestAnimationFrame(() => {
            updatePending = false;
            updateFloatingContactVisibility();
        });
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    updateFloatingContactVisibility();
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
    const baseImage = DESTINATION_IMAGES[slug] || "../images/ayodhya.jpg";
    return baseImage;
}

function getActivePartnerHotel() {
    try {
        const rawHotel = window.localStorage.getItem(PARTNER_HOTEL_STORAGE_KEY);
        return rawHotel ? JSON.parse(rawHotel) : null;
    } catch (error) {
        return null;
    }
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
    const details = [`Located in ${escapeHtml(destinationName)}`];
    if (option.description) {
        details.push(escapeHtml(option.description));
    }
    if (option.distance_from_tour_km !== undefined && option.distance_from_tour_km !== null) {
        details.push(`${escapeHtml(option.distance_from_tour_km)} km from the tour centre`);
    }
    if (option.nearby_place) {
        details.push(`near ${escapeHtml(option.nearby_place)}`);
    }
    if (option.category) {
        details.push(`${escapeHtml(option.category)} stay`);
    }
    if (option.amenities?.length) {
        details.push(`Amenities include ${escapeHtml(option.amenities.slice(0, 4).join(", "))}`);
    }
    if (option.check_in_time) {
        details.push(`Check-in ${escapeHtml(option.check_in_time)}`);
    }
    if (option.check_out_time) {
        details.push(`check-out ${escapeHtml(option.check_out_time)}`);
    }

    return details.length > 1
        ? `${details.join(". ")}.`
        : "Contact us for verified details about this stay.";
}

function getMapLink(destinationName, nearbyPlace) {
    const query = encodeURIComponent(`${nearbyPlace || destinationName}, ${destinationName}, Uttar Pradesh`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function hotelOptionTemplate(option, index) {
    const imageSrc = option.image_url || "hotel.jpg";
    const mapLink = getMapLink(selectedDestinationName, option.nearby_place);
    const price = getCurrentPrice(option);
    const priceLabel = getCurrentPriceLabel();
    const distanceLabel = option.distance_from_tour_km !== undefined && option.distance_from_tour_km !== null
        ? `<span>${escapeHtml(option.distance_from_tour_km)} km from centre</span>`
        : "";
    const categoryTag = option.category
        ? `<span class="hotel-category-pill">${escapeHtml(option.category)}</span>`
        : "";
    const roomsTag = option.rooms_available !== undefined && option.rooms_available !== null
        ? `<span class="hotel-tag">${escapeHtml(option.rooms_available)} rooms available</span>`
        : "";

    return `
        <article class="hotel-listing-card">
            <div class="hotel-listing-image">
                <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(option.image_url ? option.display_name : "Illustrative hotel image")}" loading="lazy" onerror="this.onerror=null;this.src='hotel.jpg'">
                <button type="button" class="hotel-fav-btn" aria-label="Save to favourites">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                </button>
            </div>

            <div class="hotel-listing-body">
                <div class="hotel-listing-main">
                    <h2 class="hotel-listing-name">
                        <a href="booking1.html">${escapeHtml(option.display_name)}</a>
                    </h2>
                    <div class="hotel-listing-location">
                        <a href="destinations.html" class="hotel-location-link">${escapeHtml(selectedDestinationName)}</a>
                        <span class="hotel-location-dot">·</span>
                        <a href="${mapLink}" class="hotel-location-link" target="_blank" rel="noopener">${option.nearby_place ? "Show on map" : "View destination map"}</a>
                        ${distanceLabel ? `<span class="hotel-location-dot">·</span>${distanceLabel}` : ""}
                    </div>
                    <p class="hotel-listing-desc">${buildDescription(option, selectedDestinationName)}</p>
                    <div class="hotel-listing-tags">
                        ${categoryTag}
                        ${roomsTag}
                    </div>
                </div>

                <aside class="hotel-listing-aside">
                    <div class="hotel-listing-price">
                        <span class="hotel-price-label">From</span>
                        <strong class="hotel-price-value">${price ? formatRupees(price) : "Contact for price"}</strong>
                        <span class="hotel-price-unit">${escapeHtml(priceLabel)} · per room / night</span>
                    </div>
                    <a href="booking1.html" class="hotel-select-dates-btn">Select dates</a>
                </aside>
            </div>
        </article>
    `;
}

function renderHotelOptions(options) {
    if (!options.length) {
        renderDemoHotels();
        return;
    }

    const pricingContext = currentAuth?.role === "hotel_partner" ? "partner" : "public";
    setHotelStatus(`${options.length} propert${options.length > 1 ? "ies" : "y"} found in ${selectedDestinationName}. Showing ${pricingContext} pricing.`, "success");
    hotelOptionsGrid.innerHTML = options.map((option, index) => hotelOptionTemplate(option, index)).join("");
    bindFavoriteButtons();
    updateFloatingContactVisibility();
}

function renderDemoHotels() {
    setHotelStatus("Hotel listings are not available yet.");
    hotelOptionsGrid.innerHTML = `
        <article class="hotel-empty-state">
            <div class="hotel-empty-image">
                <img src="hotel.jpg" alt="A welcoming hotel in Ayodhya" loading="lazy">
            </div>
            <div class="hotel-empty-copy">
                <span class="hotel-eyebrow">A place to stay is on the way</span>
                <h2>Hotel Listings Coming Soon</h2>
                <p>We are welcoming hotel partners to our platform. Check back soon for accommodation options in Ayodhya.</p>
                <a href="become-partner.html" class="btn btn-primary">Become a Hotel Partner</a>
            </div>
        </article>
    `;
    updateFloatingContactVisibility();
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
            hotelOptionsGrid.innerHTML = "";
            updateFloatingContactVisibility();
        }
    } catch (error) {
        destinationSelect.innerHTML = '<option value="">Destinations unavailable</option>';
        setHotelStatus("Could not load destinations. Please try again in a moment.", "error");
        hotelOptionsGrid.innerHTML = "";
        updateFloatingContactVisibility();
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
        updateFloatingContactVisibility();
        return;
    }

    setHotelStatus("Loading hotel options...");
    hotelOptionsGrid.innerHTML = "";
    updateFloatingContactVisibility();

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
        setHotelStatus("Could not load hotel options. Please try again in a moment.", "error");
        hotelOptionsGrid.innerHTML = "";
        updateFloatingContactVisibility();
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
bindFloatingContactVisibility();
loadDestinations();
