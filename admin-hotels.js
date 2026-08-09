const ADMIN_API_BASE_URL = window.RAMNAGARI_API_BASE_URL || "http://127.0.0.1:8000";

const state = {
    token: localStorage.getItem("ramnagari_admin_token") || "",
};

const loginForm = document.getElementById("adminLoginForm");
const addHotelForm = document.getElementById("addHotelForm");
const addHotelButton = document.getElementById("addHotelButton");

function field(id) {
    return document.getElementById(id);
}

function showMessage(id, text, type = "success") {
    const element = field(id);
    element.textContent = text;
    element.className = `admin-message ${type}`;
}

function setSubmitting(isSubmitting) {
    addHotelButton.disabled = isSubmitting;
    addHotelButton.textContent = isSubmitting ? "Adding..." : "Add Hotel";
}

function showAdminTools() {
    addHotelForm.classList.remove("is-hidden");
}

function hideAdminTools() {
    addHotelForm.classList.add("is-hidden");
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.token}`,
    };
}

async function api(path, options = {}) {
    const response = await fetch(`${ADMIN_API_BASE_URL}${path}`, {
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
}

function amenitiesFromInput(value) {
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function numberFromField(id) {
    return Number(field(id).value);
}

function validateHotelForm() {
    const basePrice = numberFromField("basePrice");
    const sellingPrice = numberFromField("sellingPrice");

    if (sellingPrice < basePrice) {
        throw new Error("Selling price should be greater than or equal to base price.");
    }
}

async function loadDestinations() {
    const destinationSelect = field("hotelDestination");
    destinationSelect.innerHTML = "<option value=\"\">Loading destinations...</option>";

    const destinations = await api("/api/catalog/destinations");
    destinationSelect.innerHTML = destinations
        .map((destination) => `<option value="${destination.id}">${destination.name}</option>`)
        .join("");

    if (!destinations.length) {
        destinationSelect.innerHTML = "<option value=\"\">No destinations found</option>";
    }
}

async function createOwner() {
    return api("/api/admin/hotel-owners", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
            owner_name: field("ownerName").value.trim(),
            email: field("ownerEmail").value.trim(),
            phone: field("ownerPhone").value.trim() || null,
            is_active: true,
        }),
    });
}

async function createHotel(ownerId) {
    return api("/api/admin/hidden-hotels", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
            destination_id: numberFromField("hotelDestination"),
            owner_id: ownerId,
            real_hotel_name: field("realHotelName").value.trim(),
            address: field("hotelAddress").value.trim() || null,
            nearby_place: field("nearbyPlace").value.trim() || null,
            distance_from_destination_km: numberFromField("hotelDistance"),
            amenities: amenitiesFromInput(field("hotelAmenities").value),
            check_in_time: field("checkInTime").value.trim() || "12:00 PM",
            check_out_time: field("checkOutTime").value.trim() || "11:00 AM",
            is_active: true,
        }),
    });
}

async function createRoomRate(hotelId) {
    return api("/api/admin/hotel-room-rates", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
            hotel_id: hotelId,
            category: field("hotelCategory").value,
            base_price_per_room: numberFromField("basePrice"),
            selling_price_per_room: numberFromField("sellingPrice"),
            rooms_available: numberFromField("roomsAvailable"),
            is_active: true,
        }),
    });
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showMessage("adminLoginMessage", "Logging in...");

    try {
        const result = await api("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: field("adminEmail").value.trim(),
                password: field("adminPassword").value,
            }),
        });

        state.token = result.access_token;
        localStorage.setItem("ramnagari_admin_token", state.token);
        document.dispatchEvent(new CustomEvent("admin:login"));
        showMessage("adminLoginMessage", "Login successful. You can add hotels now.");
        showAdminTools();
        await loadDestinations();
    } catch (error) {
        hideAdminTools();
        showMessage("adminLoginMessage", error.message, "error");
    }
});

addHotelForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!state.token) {
        showMessage("addHotelMessage", "Please login as admin before adding a hotel.", "error");
        return;
    }

    try {
        validateHotelForm();

        setSubmitting(true);
        showMessage("addHotelMessage", "Creating owner...");

        const owner = await createOwner();
        showMessage("addHotelMessage", "Owner saved. Creating hotel...");

        const hotel = await createHotel(owner.id);
        showMessage("addHotelMessage", "Hotel saved. Creating price...");

        const rate = await createRoomRate(hotel.id);
        addHotelForm.reset();
        field("hotelDistance").value = "1.5";
        field("hotelAmenities").value = "AC Room, WiFi, Parking, Breakfast";
        field("checkInTime").value = "12:00 PM";
        field("checkOutTime").value = "11:00 AM";
        field("roomsAvailable").value = "15";
        field("basePrice").value = "2200";
        field("sellingPrice").value = "3000";

        showMessage(
            "addHotelMessage",
            `Hotel added successfully. Hotel id: ${hotel.id}, price id: ${rate.id}.`
        );
    } catch (error) {
        showMessage("addHotelMessage", error.message, "error");
    } finally {
        setSubmitting(false);
    }
});

hideAdminTools();


