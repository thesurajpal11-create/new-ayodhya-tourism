const BOOKING_API_BASE_URL = window.RAMNAGARI_API_BASE_URL || "http://127.0.0.1:8000";

const state = {
    token: localStorage.getItem("ramnagari_customer_token") || "",
    user: JSON.parse(localStorage.getItem("ramnagari_customer_user") || "null"),
    estimate: null,
    booking: null,
};

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const bookingForm = document.getElementById("bookingForm");
const estimateButton = document.getElementById("estimateButton");
const bookingSummary = document.getElementById("bookingSummary");
const progressItems = Array.from(document.querySelectorAll(".step-progress-item"));
const googleLoginBtn = document.getElementById("googleLoginBtn");
const guestLoginBtn = document.getElementById("guestLoginBtn");

function field(id) {
    return document.getElementById(id);
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

function formatRupees(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function showMessage(id, message, type = "success") {
    const element = field(id);
    if (!element) {
        return;
    }
    element.textContent = message;
    element.className = `booking-message ${type}`;
}

function setBookingStep(step) {
    progressItems.forEach((item, index) => {
        const isActive = Number(item.dataset.step) === step;
        const isCompleted = Number(item.dataset.step) < step;
        item.classList.toggle("is-active", isActive);
        item.classList.toggle("is-complete", isCompleted);
    });
}

function renderSummarySkeleton() {
    bookingSummary.innerHTML = `
        <div class="summary-placeholder">
            <div class="summary-skeleton">
                <div class="skeleton-line long"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
            </div>
            <p>Preparing your premium estimate and secure payment summary…</p>
        </div>
    `;
}

function renderSummaryError(message) {
    bookingSummary.innerHTML = `
        <div class="summary-placeholder error-state">
            <h3>We are unable to finalize this estimate</h3>
            <p>${escapeHtml(message)}</p>
            <span class="summary-note">Please try again in a moment or contact our support team.</span>
        </div>
    `;
}

function validateBookingForm() {
    const requiredFields = [field("destinationSelect"), field("hotelCategorySelect"), field("cabTypeSelect"), field("touristsInput"), field("stayDaysInput")];
    let isValid = true;

    requiredFields.forEach((input) => {
        const hasValue = Boolean(input?.value && input.value !== "");
        input?.classList.toggle("is-invalid", !hasValue);
        if (!hasValue) {
            isValid = false;
        }
    });

    if (!isValid) {
        showMessage("bookingMessage", "Please complete all trip details before continuing.", "error");
    }

    return isValid;
}

function setActionLoading(button, text) {
    if (!button) {
        return;
    }

    button.disabled = true;
    button.textContent = text;
}

function resetActionLoading(button, text) {
    if (!button) {
        return;
    }

    button.disabled = false;
    button.textContent = text;
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.token}`,
    };
}

async function api(path, options = {}) {
    try {
        const response = await fetch(`${BOOKING_API_BASE_URL}${path}`, {
            ...options,
            headers: {
                ...(options.auth ? authHeaders() : { "Content-Type": "application/json" }),
                ...(options.headers || {}),
            },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.detail || "Request failed. Please try again.");
        }
        return data;
    } catch (error) {
        if (error instanceof Error && error.message.includes("Failed to fetch")) {
            throw new Error("We could not reach the booking service. Please try again in a moment.");
        }
        throw error;
    }
}

function setAuthMode(mode) {
    const isLogin = mode === "login";
    loginTab.classList.toggle("is-active", isLogin);
    signupTab.classList.toggle("is-active", !isLogin);
    loginForm.classList.toggle("is-hidden", !isLogin);
    signupForm.classList.toggle("is-hidden", isLogin);
    showMessage("authMessage", "");
}

function saveSession(result) {
    state.token = result.access_token;
    state.user = result.user;
    localStorage.setItem("ramnagari_customer_token", state.token);
    localStorage.setItem("ramnagari_customer_user", JSON.stringify(state.user));
}

function buildBookingPayload() {
    return {
        destination_id: Number(field("destinationSelect").value),
        hotel_category: field("hotelCategorySelect").value,
        cab_type: field("cabTypeSelect").value,
        tourists: Number(field("touristsInput").value),
        stay_days: Number(field("stayDaysInput").value),
        hotel_option_id: field("hotelOptionSelect").value ? Number(field("hotelOptionSelect").value) : null,
    };
}

function renderEstimate(estimate, paymentOrder = null) {
    const hotelLabel = estimate.display_name ? "Premium stay option" : "Category-based stay";
    const hotelCost = estimate.hotel_total || 0;
    const cabCost = estimate.cab_total || 0;
    const taxes = estimate.service_charge || 0;
    const totalAmount = estimate.total_amount || hotelCost + cabCost + taxes;
    const advanceAmount = estimate.advance_payment_amount || Math.round(totalAmount * 0.4);

    const paymentBlock = paymentOrder
        ? `
            <div class="summary-payment-box">
                <div>
                    <strong>Secure payment ready</strong>
                    <p>Advance amount: ${formatRupees(paymentOrder.amount)}</p>
                </div>
                <button type="button" class="btn btn-primary" id="payNowButton">Pay Now</button>
            </div>
        `
        : `
            <div class="summary-payment-box neutral">
                <div>
                    <strong>Trusted checkout</strong>
                    <p>Complete the booking to unlock the secure payment flow.</p>
                </div>
            </div>
        `;

    bookingSummary.innerHTML = `
        <div class="summary-card-head">
            <div>
                <p class="summary-label">Live estimate</p>
                <h3>${escapeHtml(estimate.tour || "Selected itinerary")}</h3>
            </div>
            <span class="summary-pill">${escapeHtml(estimate.cab || "Cab included")}</span>
        </div>
        <div class="summary-list">
            <div><span>Stay</span><strong>${escapeHtml(hotelLabel)}</strong></div>
            <div><span>Tourists</span><strong>${escapeHtml(estimate.tourists || 2)}</strong></div>
            <div><span>Rooms</span><strong>${escapeHtml(estimate.rooms || 1)}</strong></div>
            <div><span>Days</span><strong>${escapeHtml(estimate.days || 1)}</strong></div>
            <div><span>Hotel Cost</span><strong>${formatRupees(hotelCost)}</strong></div>
            <div><span>Cab Cost</span><strong>${formatRupees(cabCost)}</strong></div>
            <div><span>Taxes & Service</span><strong>${formatRupees(taxes)}</strong></div>
            <div class="summary-total"><span>Total Amount</span><strong>${formatRupees(totalAmount)}</strong></div>
            <div class="summary-total"><span>Advance Payment</span><strong>${formatRupees(advanceAmount)}</strong></div>
        </div>
        ${paymentBlock}
    `;

    const payNowButton = document.getElementById("payNowButton");
    if (payNowButton && paymentOrder) {
        payNowButton.addEventListener("click", () => openRazorpay(paymentOrder));
    }
}

async function loadDestinations() {
    const destinationSelect = field("destinationSelect");
    destinationSelect.innerHTML = "<option value=\"\">Loading destinations...</option>";
    const destinations = await api("/api/catalog/destinations");
    destinationSelect.innerHTML = destinations
        .map((destination) => `<option value="${destination.id}">${escapeHtml(destination.name)}</option>`)
        .join("");
}

async function loadCabs() {
    const cabTypeSelect = field("cabTypeSelect");
    cabTypeSelect.innerHTML = "<option value=\"\">Loading cab options...</option>";
    const cabs = await api("/api/catalog/cab-types");
    cabTypeSelect.innerHTML = cabs
        .map((cab) => `<option value="${escapeHtml(cab.cab_type)}">${escapeHtml(cab.cab_type)} - ${cab.capacity} seats</option>`)
        .join("");
}

async function loadHotelOptions() {
    const destinationId = field("destinationSelect").value;
    const category = field("hotelCategorySelect").value;
    const hotelOptionSelect = field("hotelOptionSelect");

    if (!destinationId || !category) {
        hotelOptionSelect.innerHTML = "<option value=\"\">Best available option</option>";
        return;
    }

    hotelOptionSelect.innerHTML = "<option value=\"\">Loading stay options...</option>";

    const params = new URLSearchParams({ destination_id: destinationId, category });
    const options = await api(`/api/catalog/hotel-options?${params.toString()}`);
    hotelOptionSelect.innerHTML = [
        "<option value=\"\">Best available option</option>",
        ...options.map((option) => (
            `<option value="${option.hotel_option_id}">${escapeHtml(option.display_name)} · ${formatRupees(option.selling_price_per_room)}</option>`
        )),
    ].join("");
}

async function estimateTrip() {
    const estimate = await api("/api/catalog/estimate", {
        method: "POST",
        body: JSON.stringify(buildBookingPayload()),
    });
    state.estimate = estimate;
    state.booking = null;
    renderEstimate(estimate);
    return estimate;
}

async function createBooking() {
    if (!state.token) {
        throw new Error("Please login or sign up before creating a booking.");
    }

    const booking = await api("/api/bookings/", {
        method: "POST",
        auth: true,
        body: JSON.stringify(buildBookingPayload()),
    });
    state.booking = booking;
    state.estimate = booking;
    renderEstimate(booking);
    return booking;
}

async function createPaymentOrder(bookingId) {
    return api(`/api/bookings/${bookingId}/payment/order`, {
        method: "POST",
        auth: true,
    });
}

function openRazorpay(order) {
    if (!window.Razorpay) {
        showMessage("bookingMessage", "Razorpay checkout could not load. Check your internet connection.", "error");
        return;
    }

    const checkout = new window.Razorpay({
        key: order.key_id,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        name: "Ramnagari Tourism",
        description: `Advance payment for booking #${order.booking_id}`,
        order_id: order.razorpay_order_id,
        prefill: {
            name: state.user?.name || "",
            email: state.user?.email || "",
            contact: state.user?.phone || "",
        },
        handler: async (response) => {
            try {
                await api("/api/bookings/payment/verify", {
                    method: "POST",
                    auth: true,
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    }),
                });
                showMessage("bookingMessage", "Payment verified. Your booking is pending admin approval.");
            } catch (error) {
                showMessage("bookingMessage", error.message, "error");
            }
        },
        modal: {
            ondismiss: () => showMessage("bookingMessage", "Payment window closed before completion.", "error"),
        },
    });
    checkout.open();
}

loginTab.addEventListener("click", () => setAuthMode("login"));
signupTab.addEventListener("click", () => setAuthMode("signup"));

googleLoginBtn?.addEventListener("click", () => {
    showMessage("authMessage", "Google sign-in will be enabled soon. Email login remains fully available.", "success");
});

guestLoginBtn?.addEventListener("click", () => {
    state.user = { name: "Guest Traveler", email: "guest@ramnagari.com", phone: "" };
    state.token = "";
    localStorage.removeItem("ramnagari_customer_token");
    localStorage.removeItem("ramnagari_customer_user");
    showMessage("authMessage", "Guest checkout enabled. You can continue without creating an account.", "success");
});

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showMessage("authMessage", "Logging in...");
    try {
        const result = await api("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: field("loginEmail").value.trim(),
                password: field("loginPassword").value,
            }),
        });
        saveSession(result);
        showMessage("authMessage", `Logged in as ${result.user.name}.`);
    } catch (error) {
        showMessage("authMessage", error.message, "error");
    }
});

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showMessage("authMessage", "Creating account...");
    try {
        await api("/api/auth/signup", {
            method: "POST",
            body: JSON.stringify({
                name: field("signupName").value.trim(),
                email: field("signupEmail").value.trim(),
                phone: field("signupPhone").value.trim() || null,
                password: field("signupPassword").value,
            }),
        });
        const result = await api("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: field("signupEmail").value.trim(),
                password: field("signupPassword").value,
            }),
        });
        saveSession(result);
        setAuthMode("login");
        showMessage("authMessage", `Account created. Logged in as ${result.user.name}.`);
    } catch (error) {
        showMessage("authMessage", error.message, "error");
    }
});

estimateButton.addEventListener("click", async () => {
    if (!validateBookingForm()) {
        return;
    }

    setBookingStep(2);
    setActionLoading(estimateButton, "Calculating...");
    renderSummarySkeleton();
    showMessage("bookingMessage", "Preparing your premium estimate...");
    try {
        await estimateTrip();
        showMessage("bookingMessage", "Estimate ready. Review your summary and proceed securely.");
        setBookingStep(3);
    } catch (error) {
        renderSummaryError(error.message);
        showMessage("bookingMessage", error.message, "error");
    } finally {
        resetActionLoading(estimateButton, "Get Estimate");
    }
});

bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateBookingForm()) {
        return;
    }

    setBookingStep(3);
    setActionLoading(field("bookButton"), "Creating...");
    renderSummarySkeleton();
    showMessage("bookingMessage", "Creating booking...");
    try {
        const booking = await createBooking();
        showMessage("bookingMessage", "Booking created. Preparing payment...");
        const paymentOrder = await createPaymentOrder(booking.id);
        renderEstimate(booking, paymentOrder);
        showMessage("bookingMessage", "Payment order ready. Click Pay Now.");
    } catch (error) {
        renderSummaryError(error.message);
        showMessage("bookingMessage", error.message, "error");
    } finally {
        resetActionLoading(field("bookButton"), "Create Booking");
    }
});

field("destinationSelect").addEventListener("change", () => {
    loadHotelOptions().catch((error) => {
        renderSummaryError(error.message);
        showMessage("bookingMessage", error.message, "error");
    });
});
field("hotelCategorySelect").addEventListener("change", () => {
    loadHotelOptions().catch((error) => {
        renderSummaryError(error.message);
        showMessage("bookingMessage", error.message, "error");
    });
});

[field("touristsInput"), field("stayDaysInput")].forEach((input) => {
    input?.addEventListener("input", () => {
        validateBookingForm();
    });
});

Promise.all([loadDestinations(), loadCabs()])
    .then(loadHotelOptions)
    .then(() => {
        if (state.user) {
            showMessage("authMessage", `Logged in as ${state.user.name}.`);
        }
    })
    .catch((error) => {
        renderSummaryError(error.message);
        showMessage("bookingMessage", error.message, "error");
    });

setBookingStep(1);
