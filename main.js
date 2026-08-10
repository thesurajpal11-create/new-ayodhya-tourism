const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const topSlider = document.querySelector(".top-slider");
const topSlides = document.querySelectorAll(".top-slide");
const sliderDots = document.querySelectorAll(".slider-dot");
const sliderPrev = document.getElementById("sliderPrev");
const sliderNext = document.getElementById("sliderNext");
const enquiryForms = document.querySelectorAll(".enquiry-form");
const currentYear = document.getElementById("currentYear");
const pickupDate = document.getElementById("pickupDate");
const reviewForm = document.getElementById("reviewForm");
const reviewList = document.getElementById("reviewList");
const reviewSummary = document.getElementById("reviewSummary");
const reviewFeedback = document.getElementById("reviewFeedback");
const scrollTopButton = document.getElementById("scrollTop");
const aiTripPlannerForm = document.getElementById("aiTripPlannerForm");
const aiPlanResult = document.getElementById("aiPlanResult");
const aiPlanText = document.getElementById("aiPlanText");
const aiPlanWhatsApp = document.getElementById("aiPlanWhatsApp");
const weatherSuggestionIcon = document.getElementById("weatherSuggestionIcon");
const weatherSuggestionLabel = document.getElementById("weatherSuggestionLabel");
const weatherSuggestionTitle = document.getElementById("weatherSuggestionTitle");
const weatherSuggestionText = document.getElementById("weatherSuggestionText");
const weatherReading = document.getElementById("weatherReading");
const navbar = document.getElementById("navbar");
const mapPopup = document.getElementById("ayodhyaMapPopup");
const mapPopupTitle = document.getElementById("mapPopupTitle");
const mapPopupDesc = document.getElementById("mapPopupDesc");
const mapPopupIcon = document.getElementById("mapPopupIcon");
const mapPopupBest = document.getElementById("mapPopupBest");
const mapPopupTime = document.getElementById("mapPopupTime");
const mapPopupNote = document.getElementById("mapPopupNote");
const mapPopupClose = document.getElementById("mapPopupClose");
const mapPopupBackdrop = document.getElementById("mapPopupBackdrop");
const mapPins = document.querySelectorAll(".map-pin");
const reviewsStorageKey = "ramnagariTourismReviews";
const reviewsSeededKey = "ramnagariTourismReviewsSeeded";
const minimumReviewRating = 4;
const defaultReviews = [
    {
        id: 1704101400001,
        name: "Amit Sharma",
        rating: 5,
        message: "Ramnagari Tourism planned our Ayodhya trip very well. Cab was clean, driver was polite, and the whole family felt comfortable.",
        createdAt: "2026-04-18T10:30:00.000Z",
    },
    {
        id: 1704101400002,
        name: "Priya Verma",
        rating: 5,
        message: "Very smooth service for darshan and local sightseeing. The team responded quickly and helped us with hotel and cab details.",
        createdAt: "2026-04-21T12:15:00.000Z",
    },
    {
        id: 1704101400003,
        name: "Sandeep Gupta",
        rating: 4,
        message: "Good tour package and transparent pricing. Our Prayagraj route was managed nicely and pickup was on time.",
        createdAt: "2026-04-24T15:20:00.000Z",
    },
    {
        id: 1704101400004,
        name: "Neha Singh",
        rating: 5,
        message: "Best travel support for a family trip. Booking was simple and the driver knew the temple routes very well.",
        createdAt: "2026-04-27T09:10:00.000Z",
    },
];

let currentSlideIndex = 0;
let sliderIntervalId = null;

const ayodhyaMapDetails = {
    "ram-mandir": {
        icon: "⛩",
        title: "Ram Mandir",
        description: "The spiritual centerpiece of Ayodhya, ideal for early morning darshan and a calm temple visit.",
        best: "Temple darshan",
        time: "Morning & evening",
        note: "Best reached by cab for a smooth visit.",
    },
    "hanuman-garhi": {
        icon: "🕉",
        title: "Hanuman Garhi",
        description: "A famous hilltop shrine known for its panoramic city views and devotional atmosphere.",
        best: "Temple visit",
        time: "Morning",
        note: "Great stop for families and pilgrims.",
    },
    "kanak-bhawan": {
        icon: "🏛",
        title: "Kanak Bhawan",
        description: "A grand temple complex that adds a rich cultural and spiritual stop to your city plan.",
        best: "Historic temple",
        time: "Late morning",
        note: "Perfect for a relaxed local sightseeing loop.",
    },
    "saryu-ghat": {
        icon: "🌊",
        title: "Saryu Ghat",
        description: "The riverside ghats offer peaceful evenings, aarti views, and a reflective spiritual experience.",
        best: "Riverfront visit",
        time: "Evening",
        note: "Ideal for sunset and aarti timing.",
    },
    airport: {
        icon: "✈",
        title: "Airport",
        description: "A convenient arrival point for domestic travelers and groups heading to the city.",
        best: "Arrival & pickup",
        time: "Any time",
        note: "Easy cab pickup options are available.",
    },
    railway: {
        icon: "🚆",
        title: "Railway Station",
        description: "A convenient transit hub for visitors arriving by train and planning local sightseeing.",
        best: "Rail access",
        time: "Any time",
        note: "Good base for hotel transfers and city routes.",
    },
    hotels: {
        icon: "🏨",
        title: "Hotels",
        description: "Stay options around the city help you stay close to temple routes and travel pickup points.",
        best: "Stay assistance",
        time: "Flexible",
        note: "We can help with budget and premium choices.",
    },
};

function openAyodhyaMapPopup(placeKey) {
    const details = ayodhyaMapDetails[placeKey];

    if (!mapPopup || !details) {
        return;
    }

    if (mapPopupTitle) {
        mapPopupTitle.textContent = details.title;
    }

    if (mapPopupDesc) {
        mapPopupDesc.textContent = details.description;
    }

    if (mapPopupIcon) {
        mapPopupIcon.textContent = details.icon;
    }

    if (mapPopupBest) {
        mapPopupBest.textContent = details.best;
    }

    if (mapPopupTime) {
        mapPopupTime.textContent = details.time;
    }

    if (mapPopupNote) {
        mapPopupNote.textContent = details.note;
    }

    mapPopup.classList.add("is-open");
    mapPopup.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeAyodhyaMapPopup() {
    if (!mapPopup) {
        return;
    }

    mapPopup.classList.remove("is-open");
    mapPopup.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

function highlightActiveNavLink() {
    const currentPath = window.location.pathname.replace(/\\/g, "/").replace(/\/$/, "") || "/index.html";
    const navLinks = document.querySelectorAll(".nav-menu a:not(.call-button)");

    navLinks.forEach((link) => {
        const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, "") || "/index.html";
        const isHome = (currentPath === "" || currentPath === "/" || currentPath.endsWith("/index.html")) &&
            (linkPath === "" || linkPath === "/" || linkPath.endsWith("/index.html"));
        const isMatch = isHome || (linkPath !== "/index.html" && currentPath.endsWith(linkPath.split("/").pop()));

        link.classList.toggle("is-active", isMatch);
    });
}

highlightActiveNavLink();

if (scrollTopButton) {
    const toggleScrollTop = () => {
        const shouldShow = window.scrollY > 420;
        scrollTopButton.hidden = !shouldShow;
    };

    toggleScrollTop();
    window.addEventListener("scroll", toggleScrollTop, { passive: true });

    scrollTopButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

if (navbar) {
    const handleNavbarScroll = () => {
        navbar.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    handleNavbarScroll();
    window.addEventListener("scroll", handleNavbarScroll, { passive: true });
}

const revealElements = document.querySelectorAll(".reveal-on-scroll");

if (revealElements.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
} else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
}

if (pickupDate) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    pickupDate.min = `${year}-${month}-${day}`;
}

if (navToggle) {
    navToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });
}

document.querySelectorAll(".nav-menu a").forEach((link) => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("is-open");
        navToggle?.setAttribute("aria-expanded", "false");
    });
});

mapPins.forEach((pin) => {
    pin.addEventListener("click", () => {
        mapPins.forEach((item) => item.classList.remove("is-active"));
        pin.classList.add("is-active");
        openAyodhyaMapPopup(pin.dataset.place);
    });
});

if (mapPopupClose) {
    mapPopupClose.addEventListener("click", closeAyodhyaMapPopup);
}

if (mapPopupBackdrop) {
    mapPopupBackdrop.addEventListener("click", closeAyodhyaMapPopup);
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mapPopup?.classList.contains("is-open")) {
        closeAyodhyaMapPopup();
    }
});

function showSlide(index) {
    if (!topSlides.length) {
        return;
    }

    currentSlideIndex = (index + topSlides.length) % topSlides.length;

    topSlides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === currentSlideIndex);
    });

    sliderDots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === currentSlideIndex);
    });
}

function nextSlide() {
    showSlide(currentSlideIndex + 1);
}

function previousSlide() {
    showSlide(currentSlideIndex - 1);
}

function startSlider() {
    if (!topSlides.length) {
        return;
    }

    stopSlider();
    sliderIntervalId = window.setInterval(nextSlide, 3500);
}

function stopSlider() {
    if (sliderIntervalId) {
        window.clearInterval(sliderIntervalId);
        sliderIntervalId = null;
    }
}

if (topSlider && topSlides.length) {
    showSlide(0);
    startSlider();

    sliderPrev?.addEventListener("click", () => {
        previousSlide();
        startSlider();
    });

    sliderNext?.addEventListener("click", () => {
        nextSlide();
        startSlider();
    });

    sliderDots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            showSlide(index);
            startSlider();
        });
    });

    topSlider.addEventListener("mouseenter", stopSlider);
    topSlider.addEventListener("mouseleave", startSlider);
}

function setFeedback(form, message, type) {
    const formFeedback = form.querySelector(".form-feedback");

    if (!formFeedback) {
        return;
    }

    formFeedback.textContent = message;
    formFeedback.className = `form-feedback ${type}`;
}

function validateField(field) {
    const value = field.value.trim();
    field.classList.remove("input-error");

    if (field.hasAttribute("required") && !value) {
        field.classList.add("input-error");
        return false;
    }

    if (field.type === "email" && value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
            field.classList.add("input-error");
            return false;
        }
    }

    if (field.type === "tel" && value) {
        const digits = value.replace(/\D/g, "");
        if (digits.length < 10) {
            field.classList.add("input-error");
            return false;
        }
    }

    return true;
}

if (aiTripPlannerForm) {
    aiTripPlannerForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(aiTripPlannerForm);
        const budget = formData.get("budget");
        const days = formData.get("days");
        const travellerType = formData.get("traveller_type");
        const stay = formData.get("stay");
        const cab = formData.get("cab");

        if (![budget, days, travellerType, stay, cab].every(Boolean)) {
            Array.from(aiTripPlannerForm.querySelectorAll("select")).find((field) => !field.value)?.focus();
            return;
        }

        const cabSuggestion = cab === "Yes"
            ? "A private cab can keep your darshan and sightseeing comfortable."
            : "We will suggest places that are easy to cover without a cab.";
        const staySuggestion = stay === "Dharamshala"
            ? "A clean dharamshala near the temple route is a good fit."
            : `A ${budget.toLowerCase()} hotel close to the main attractions is a good fit.`;
        const plan = `${days}-day ${travellerType.toLowerCase()} trip with a ${budget.toLowerCase()} budget. ${staySuggestion} ${cabSuggestion}`;

        if (aiPlanText) {
            aiPlanText.textContent = plan;
        }

        if (aiPlanResult) {
            aiPlanResult.hidden = false;
        }

        if (aiPlanWhatsApp) {
            const message = `Hello Ramnagari Tourism, I need help with my trip plan:\n- Budget: ${budget}\n- Days: ${days}\n- Traveller: ${travellerType}\n- Stay: ${stay}\n- Cab required: ${cab}`;
            aiPlanWhatsApp.href = `https://wa.me/917607745628?text=${encodeURIComponent(message)}`;
        }
    });
}

function setWeatherSuggestion({ icon, label, title, text, reading }) {
    if (weatherSuggestionIcon) weatherSuggestionIcon.textContent = icon;
    if (weatherSuggestionLabel) weatherSuggestionLabel.textContent = label;
    if (weatherSuggestionTitle) weatherSuggestionTitle.textContent = title;
    if (weatherSuggestionText) weatherSuggestionText.textContent = text;
    if (weatherReading) weatherReading.textContent = reading;
}

async function loadAyodhyaWeatherSuggestion() {
    if (!weatherSuggestionTitle) return;

    try {
        const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=26.7996&longitude=82.2042&current=temperature_2m,apparent_temperature,precipitation,rain,weather_code&timezone=Asia%2FKolkata");
        if (!response.ok) throw new Error("Weather unavailable");
        const { current } = await response.json();
        const temperature = Math.round(current.temperature_2m);
        const feelsLike = Math.round(current.apparent_temperature);
        const weatherCode = current.weather_code;
        const isRainy = current.rain > 0 || current.precipitation > 0 || [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(weatherCode);

        if (isRainy) {
            setWeatherSuggestion({
                icon: "☔",
                label: "Rain plan for Ayodhya",
                title: "Choose indoor darshan and covered cultural stops today",
                text: "Plan Ram Mandir darshan, Kanak Bhawan and other temple visits first. Keep Saryu Ghat and open sightseeing for a dry break, and use a cab for easier movement.",
                reading: `${temperature}°C · Rainy`,
            });
        } else if (temperature >= 34 || feelsLike >= 38) {
            setWeatherSuggestion({
                icon: "🌤",
                label: "Heat-smart itinerary",
                title: "Start early and keep outdoor visits for the evening",
                text: "Visit Ram Mandir and Hanuman Garhi in the morning, rest indoors from 12–4 PM, then enjoy Saryu Ghat or Ram Ki Paidi near sunset. Carry water and prefer a cab between stops.",
                reading: `${temperature}°C · Feels ${feelsLike}°C`,
            });
        } else {
            setWeatherSuggestion({
                icon: "🌤",
                label: "Comfortable sightseeing weather",
                title: "A balanced morning-to-evening itinerary works well today",
                text: "Begin with morning darshan, take an afternoon meal break, and reserve Saryu Ghat or Ram Ki Paidi for the evening. Check with a local guide for live crowd and parking updates.",
                reading: `${temperature}°C · Feels ${feelsLike}°C`,
            });
        }
    } catch (error) {
        setWeatherSuggestion({
            icon: "🗓",
            label: "Comfort-first itinerary",
            title: "Plan outdoor Ayodhya visits in the morning or evening",
            text: "For a comfortable day, complete temple darshan early, take an indoor rest during peak afternoon hours, and visit Saryu Ghat near sunset. Ask a local guide for rain, crowd and parking updates.",
            reading: "Weather update unavailable",
        });
    }
}

loadAyodhyaWeatherSuggestion();

enquiryForms.forEach((enquiryForm) => {
    enquiryForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const fields = enquiryForm.querySelectorAll("input, select, textarea");
        const submitButton = enquiryForm.querySelector("button[type='submit']");
        let isValid = true;

        fields.forEach((field) => {
            const fieldIsValid = validateField(field);
            if (!fieldIsValid) {
                isValid = false;
            }
        });

        if (!isValid) {
            setFeedback(enquiryForm, "Please fill all required fields with valid details.", "error");
            return;
        }

        setFeedback(enquiryForm, "Submitting your enquiry...", "success");

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            const emailSent = await sendFormSubmitEmail(enquiryForm);

            if (!emailSent) {
                throw new Error("FormSubmit did not confirm delivery.");
            }

            enquiryForm.reset();
            setFeedback(enquiryForm, "Thank you. Your enquiry has been sent successfully.", "success");
        } catch (error) {
            setFeedback(enquiryForm, "Sorry, your enquiry could not be sent. Please call or WhatsApp us.", "error");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
});

function getSavedReviews() {
    try {
        const savedReviews = JSON.parse(localStorage.getItem(reviewsStorageKey) || "[]");
        const validReviews = Array.isArray(savedReviews) ? savedReviews : [];
        const approvedReviews = validReviews.filter((review) => Number(review.rating) >= minimumReviewRating);

        if (approvedReviews.length !== validReviews.length) {
            localStorage.setItem(reviewsStorageKey, JSON.stringify(approvedReviews));
        }

        return approvedReviews;
    } catch (error) {
        return [];
    }
}

function saveReviews(reviews) {
    localStorage.setItem(reviewsStorageKey, JSON.stringify(reviews));
}

async function sendFormSubmitEmail(form) {
    const action = form.getAttribute("action");

    if (!action) {
        return false;
    }

    const response = await fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: {
            Accept: "application/json",
        },
    });

    return response.ok;
}

function seedDefaultReviews() {
    if (localStorage.getItem(reviewsSeededKey) === "true") {
        return;
    }

    const savedReviews = getSavedReviews();
    const savedReviewIds = new Set(savedReviews.map((review) => review.id));
    const missingDefaultReviews = defaultReviews.filter((review) => !savedReviewIds.has(review.id));
    saveReviews([...missingDefaultReviews, ...savedReviews]);

    localStorage.setItem(reviewsSeededKey, "true");
}

function escapeReviewText(value) {
    return value.replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#039;",
        };
        return entities[character];
    });
}

function renderReviews() {
    if (!reviewList || !reviewSummary) {
        return;
    }

    const reviews = getSavedReviews();

    if (!reviews.length) {
        reviewSummary.textContent = "No reviews yet.";
        reviewList.innerHTML = "";
        return;
    }

    const averageRating = reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
    reviewSummary.textContent = `${averageRating.toFixed(1)} out of 5 from ${reviews.length} review${reviews.length === 1 ? "" : "s"}`;
    reviewList.innerHTML = reviews
        .map((review) => {
            const reviewDate = new Date(review.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });

            return `
                <article class="review-card">
                    <div class="review-card-header">
                        <h3>${escapeReviewText(review.name)}</h3>
                        <span class="review-stars" aria-label="${review.rating} out of 5 stars">${review.rating}/5</span>
                    </div>
                    <p>${escapeReviewText(review.message)}</p>
                    <span class="review-date">${reviewDate}</span>
                </article>
            `;
        })
        .join("");
}

if (reviewForm) {
    seedDefaultReviews();
    renderReviews();

    reviewForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nameInput = reviewForm.querySelector("#reviewName");
        const ratingInput = reviewForm.querySelector("#reviewRating");
        const messageInput = reviewForm.querySelector("#reviewMessage");
        const submitButton = reviewForm.querySelector("button[type='submit']");
        const fields = [nameInput, ratingInput, messageInput];
        let isValid = true;

        fields.forEach((field) => {
            if (field && !validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            if (reviewFeedback) {
                reviewFeedback.textContent = "Please write your name, rating, and review.";
                reviewFeedback.className = "form-feedback error";
            }
            return;
        }

        const rating = Number(ratingInput.value);

        if (rating < minimumReviewRating) {
            if (reviewFeedback) {
                reviewFeedback.textContent = "Please choose a rating of 4 stars or higher.";
                reviewFeedback.className = "form-feedback error";
            }
            return;
        }

        const reviews = getSavedReviews();
        reviews.unshift({
            id: Date.now(),
            name: nameInput.value.trim(),
            rating,
            message: messageInput.value.trim(),
            createdAt: new Date().toISOString(),
        });
        saveReviews(reviews);
        renderReviews();

        if (reviewFeedback) {
            reviewFeedback.textContent = "Review saved. Sending to Ramnagari Tourism...";
            reviewFeedback.className = "form-feedback success";
        }

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            const emailSent = await sendFormSubmitEmail(reviewForm);

            if (reviewFeedback) {
                reviewFeedback.textContent = emailSent
                    ? "Review saved and sent to Ramnagari Tourism."
                    : "Review saved on this device.";
                reviewFeedback.className = "form-feedback success";
            }
        } catch (error) {
            if (reviewFeedback) {
                reviewFeedback.textContent = "Review saved on this device. Email sending could not be confirmed.";
                reviewFeedback.className = "form-feedback success";
            }
        } finally {
            reviewForm.reset();

            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
}

const smartMapContainer = document.getElementById("smartTouristMap");
const smartMapSkeleton = document.getElementById("smartMapSkeleton");
const smartMapSearchInput = document.getElementById("smartMapSearch");
const smartMapLocateButton = document.getElementById("smartMapLocateBtn");
const smartMapFilters = document.querySelectorAll(".filter-chip");
const mapRipple = document.getElementById("mapRipple");
const insightTitle = document.getElementById("insightTitle");
const insightBadge = document.getElementById("insightBadge");
const nearestParking = document.getElementById("nearestParking");
const nearestHotel = document.getElementById("nearestHotel");
const nearestRestaurant = document.getElementById("nearestRestaurant");
const nearestEmergency = document.getElementById("nearestEmergency");
const crowdLevel = document.getElementById("crowdLevel");
const bestTime = document.getElementById("bestTime");

const ayodhyaSmartLocations = [
    {
        id: "ram-mandir",
        title: "Shri Ram Janmabhoomi",
        type: "temples",
        lat: 26.7922,
        lng: 82.1998,
        image: "images/ayodhya.jpg",
        description: "The spiritual epicenter of Ayodhya, known for divine aura, sacred architecture, and premium pilgrimage experiences.",
        hours: "Open 24 hours",
        tips: "Visit early morning for calmer darshan and better photography light.",
        tag: "Temple",
        keywords: "ram mandir temple ayodhya janmabhoomi",
    },
    {
        id: "hanuman-garhi",
        title: "Hanuman Garhi",
        type: "temples",
        lat: 26.7946,
        lng: 82.1976,
        image: "images/ayodhya.jpg",
        description: "A revered hilltop shrine offering expansive views and a peaceful devotional setting.",
        hours: "5:30 AM – 10:30 PM",
        tips: "Best for sunrise visits and a quieter spiritual moment.",
        tag: "Temple",
        keywords: "hanuman garhi temple ayodhya",
    },
    {
        id: "kanak-bhawan",
        title: "Kanak Bhawan",
        type: "temples",
        lat: 26.7907,
        lng: 82.2007,
        image: "images/ayodhya.jpg",
        description: "A grand temple complex with elegant architecture and serene ambience for visitors.",
        hours: "6:00 AM – 9:00 PM",
        tips: "Ideal for a relaxed half-day visit between morning and evening darshan.",
        tag: "Temple",
        keywords: "kanak bhawan temple ayodhya",
    },
    {
        id: "nageshwarnath",
        title: "Nageshwarnath Temple",
        type: "temples",
        lat: 26.7861,
        lng: 82.2052,
        image: "images/varanasi.jpg",
        description: "A sacred temple visit linked to rich local heritage and spiritual narratives.",
        hours: "6:00 AM – 8:00 PM",
        tips: "Pair it with a nearby food stop or a calm riverside walk.",
        tag: "Temple",
        keywords: "nageshwarnath temple ayodhya",
    },
    {
        id: "ram-ki-paidi",
        title: "Ram Ki Paidi",
        type: "ghats",
        lat: 26.7887,
        lng: 82.1992,
        image: "images/chitrakoot.jpg",
        description: "A majestic riverfront destination known for evening lights, rituals, and timeless views.",
        hours: "Open 24 hours",
        tips: "The evening glow is especially beautiful for photography and reflection.",
        tag: "Ghat",
        keywords: "ram ki paidi ghat ayodhya",
    },
    {
        id: "saryu-ghat",
        title: "Saryu Ghat",
        type: "ghats",
        lat: 26.7869,
        lng: 82.1927,
        image: "images/chitrakoot.jpg",
        description: "A riverside experience perfect for aarti, sunset views, and spiritual calm.",
        hours: "Open 24 hours",
        tips: "Visit just before sunset for the best ambience and crowd balance.",
        tag: "Ghat",
        keywords: "saryu ghat ayodhya",
    },
    {
        id: "railway-station",
        title: "Ayodhya Dham Railway Station",
        type: "transport",
        lat: 26.7985,
        lng: 82.1918,
        image: "images/ayodhya.jpg",
        description: "Easy rail access for visitors arriving from across India.",
        hours: "Open 24 hours",
        tips: "Ideal for smooth city pickups and onward transfers.",
        tag: "Transport",
        keywords: "railway station transport ayodhya",
    },
    {
        id: "airport",
        title: "Maharishi Valmiki International Airport",
        type: "transport",
        lat: 26.7606,
        lng: 82.1963,
        image: "images/varanasi.jpg",
        description: "Convenient air access for domestic arrivals and premium travel planning.",
        hours: "Open 24 hours",
        tips: "Best for guests arriving by air and needing a quick transfer.",
        tag: "Transport",
        keywords: "airport transport ayodhya",
    },
    {
        id: "bus-stand",
        title: "Bus Stand",
        type: "transport",
        lat: 26.7954,
        lng: 82.2025,
        image: "images/ayodhya.jpg",
        description: "A practical intercity transport hub for pilgrims and families.",
        hours: "5:00 AM – 10:00 PM",
        tips: "Useful for regional routes and shortest onward travel connections.",
        tag: "Transport",
        keywords: "bus stand transport ayodhya",
    },
    {
        id: "hotel-generic",
        title: "Hotel",
        type: "hotels",
        lat: 26.7918,
        lng: 82.2038,
        image: "images/ayodhya.jpg",
        description: "Comfort-first stay points with premium amenities and easy temple access.",
        hours: "Open 24 hours",
        tips: "Great for full-day temple visits and nearby pickup convenience.",
        tag: "Hotel",
        keywords: "hotel stay ayodhya",
    },
    {
        id: "hotel-generic-2",
        title: "Hotel",
        type: "hotels",
        lat: 26.7892,
        lng: 82.1951,
        image: "images/ayodhya.jpg",
        description: "Elegant stay options close to major routes and local transport.",
        hours: "Open 24 hours",
        tips: "Choose this for quieter surroundings and convenient city access.",
        tag: "Hotel",
        keywords: "hotel stay ayodhya",
    },
    {
        id: "restaurant-generic",
        title: "Restaurant",
        type: "restaurants",
        lat: 26.7906,
        lng: 82.2014,
        image: "images/chitrakoot.jpg",
        description: "A convenient dining stop for wholesome meals and quick refreshment breaks.",
        hours: "7:00 AM – 11:00 PM",
        tips: "Perfect for a relaxed pause between temple visits.",
        tag: "Restaurant",
        keywords: "restaurant food ayodhya",
    },
    {
        id: "parking-1",
        title: "Parking",
        type: "parking",
        lat: 26.7928,
        lng: 82.1972,
        image: "images/ayodhya.jpg",
        description: "Secure parking availability near major visitor routes.",
        hours: "Open 24 hours",
        tips: "Useful for family vehicles and longer sightseeing trips.",
        tag: "Parking",
        keywords: "parking vehicle ayodhya",
    },
    {
        id: "hospital-1",
        title: "Hospital",
        type: "hospitals",
        lat: 26.7951,
        lng: 82.2058,
        image: "images/ayodhya.jpg",
        description: "Accessible medical support for travelers and pilgrims.",
        hours: "24/7",
        tips: "Useful for urgent needs while exploring the city.",
        tag: "Hospital",
        keywords: "hospital medical ayodhya",
    },
    {
        id: "atm-1",
        title: "ATM",
        type: "shopping",
        lat: 26.7941,
        lng: 82.2011,
        image: "images/varanasi.jpg",
        description: "Quick cash access near major travel corridors.",
        hours: "Open 24 hours",
        tips: "Helpful before moving between sightseeing spots.",
        tag: "ATM",
        keywords: "atm shopping cash ayodhya",
    },
    {
        id: "police-1",
        title: "Police",
        type: "emergency",
        lat: 26.7898,
        lng: 82.2033,
        image: "images/ayodhya.jpg",
        description: "Emergency support point for visitor assistance and safety guidance.",
        hours: "24/7",
        tips: "A reliable contact point for assistance during busy travel days.",
        tag: "Emergency",
        keywords: "police emergency ayodhya",
    },
    {
        id: "taxi-1",
        title: "Taxi Pickup",
        type: "transport",
        lat: 26.7883,
        lng: 82.2035,
        image: "images/chitrakoot.jpg",
        description: "Convenient pickup area for local transfers and temple hops.",
        hours: "Open 24 hours",
        tips: "Use when you want a direct ride without waiting for public transport.",
        tag: "Transport",
        keywords: "taxi pickup transport ayodhya",
    },
];

let smartMapActiveFilter = "all";
let smartMapMarkers = [];
let smartMapInfoWindow = null;
let smartMapInstance = null;
let smartMapUserLocation = null;
let smartMapFallbackMarkers = [];

function getDistanceKm(fromLat, fromLng, toLat, toLng) {
    const radius = 6371;
    const toRad = (value) => (value * Math.PI) / 180;
    const deltaLat = toRad(toLat - fromLat);
    const deltaLng = toRad(toLng - fromLng);
    const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(deltaLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return radius * c;
}

function getTravelTimeKm(distanceKm) {
    return Math.max(8, Math.round(distanceKm * 2));
}

function getDisplayDistance(value) {
    return `${value.toFixed(1)} km`;
}

function showMapRipple() {
    if (!mapRipple) {
        return;
    }

    mapRipple.classList.remove("is-active");
    void mapRipple.offsetWidth;
    mapRipple.classList.add("is-active");
    window.setTimeout(() => mapRipple.classList.remove("is-active"), 600);
}

function updateInsightCard(location) {
    if (!location) {
        return;
    }

    if (insightTitle) {
        insightTitle.textContent = location.title;
    }

    if (insightBadge) {
        insightBadge.textContent = location.tag;
    }

    const referencePoint = smartMapUserLocation || { lat: 26.7922, lng: 82.1998 };
    const distance = getDistanceKm(referencePoint.lat, referencePoint.lng, location.lat, location.lng);

    if (nearestParking) {
        const parkingLocation = ayodhyaSmartLocations.find((item) => item.type === "parking");
        nearestParking.textContent = parkingLocation ? `${parkingLocation.title} • ${getDisplayDistance(getDistanceKm(referencePoint.lat, referencePoint.lng, parkingLocation.lat, parkingLocation.lng))}` : "—";
    }

    if (nearestHotel) {
        const hotelLocation = ayodhyaSmartLocations.find((item) => item.type === "hotels");
        nearestHotel.textContent = hotelLocation ? `${hotelLocation.title} • ${getDisplayDistance(getDistanceKm(referencePoint.lat, referencePoint.lng, hotelLocation.lat, hotelLocation.lng))}` : "—";
    }

    if (nearestRestaurant) {
        const restaurantLocation = ayodhyaSmartLocations.find((item) => item.type === "restaurants");
        nearestRestaurant.textContent = restaurantLocation ? `${restaurantLocation.title} • ${getDisplayDistance(getDistanceKm(referencePoint.lat, referencePoint.lng, restaurantLocation.lat, restaurantLocation.lng))}` : "—";
    }

    if (nearestEmergency) {
        const emergencyLocation = ayodhyaSmartLocations.find((item) => item.type === "emergency");
        nearestEmergency.textContent = emergencyLocation ? `${emergencyLocation.title} • ${getDisplayDistance(getDistanceKm(referencePoint.lat, referencePoint.lng, emergencyLocation.lat, emergencyLocation.lng))}` : "—";
    }

    if (crowdLevel) {
        crowdLevel.textContent = location.type === "ghats" ? "High" : location.type === "temples" ? "Moderate" : "Low";
    }

    if (bestTime) {
        bestTime.textContent = location.type === "ghats" ? "Sunset" : location.type === "temples" ? "Early morning" : "Flexible";
    }
}

function buildInfoWindowContent(location, distance, travelTime) {
    const directionUrl = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${location.lat},${location.lng}`;
    const walkingUrl = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${location.lat},${location.lng}&travelmode=walking`;
    const drivingUrl = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${location.lat},${location.lng}&travelmode=driving`;
    const hotelCta = location.type === "hotels"
        ? `<a class="map-action-btn" href="pages/booking.html">Book Now</a>`
        : `<a class="map-action-btn" href="pages/hotels.html">Book Nearby Hotel</a>`;

    return `
        <div style="max-width: 330px; font-family: 'Manrope', sans-serif;">
            <img src="${location.image}" alt="${location.title}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 16px; margin-bottom: 10px;">
            <h4 style="margin: 0 0 8px; color: #10253d; font-size: 1rem;">${location.title}</h4>
            <p style="margin: 0 0 10px; color: #5c6b7a; line-height: 1.55; font-size: 0.92rem;">${location.description}</p>
            <div style="display: grid; gap: 6px; margin-bottom: 10px; font-size: 0.9rem; color: #1c3048;">
                <div><strong>Hours:</strong> ${location.hours}</div>
                <div><strong>Tips:</strong> ${location.tips}</div>
                <div><strong>Distance from Ram Mandir:</strong> ${getDisplayDistance(distance)}</div>
                <div><strong>Travel time:</strong> ${travelTime} min</div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <a class="map-action-btn" href="${directionUrl}" target="_blank" rel="noopener">Get Directions</a>
                ${hotelCta}
                <a class="map-action-btn" href="${walkingUrl}" target="_blank" rel="noopener">Walking</a>
                <a class="map-action-btn" href="${drivingUrl}" target="_blank" rel="noopener">Driving</a>
            </div>
        </div>
    `;
}

function applyMapFilter() {
    const query = (smartMapSearchInput?.value || "").trim().toLowerCase();

    smartMapFallbackMarkers.forEach((marker) => {
        const matchesFilter = smartMapActiveFilter === "all" || marker.dataset.type === smartMapActiveFilter;
        const matchesQuery = !query || marker.dataset.search.includes(query);
        marker.style.display = matchesFilter && matchesQuery ? "flex" : "none";
    });

    if (smartMapMarkers.length) {
        const visibleIds = new Set(
            ayodhyaSmartLocations
                .filter((location) => {
                    const matchesFilter = smartMapActiveFilter === "all" || location.type === smartMapActiveFilter;
                    const searchText = `${location.title} ${location.description} ${location.tag} ${location.keywords}`.toLowerCase();
                    const matchesQuery = !query || searchText.includes(query);
                    return matchesFilter && matchesQuery;
                })
                .map((location) => location.id)
        );

        smartMapMarkers.forEach((marker) => {
            if (marker.__locationId) {
                marker.setVisible(visibleIds.has(marker.__locationId));
            }
        });
    }
}

function createFallbackMap() {
    if (!smartMapContainer) {
        return;
    }

    smartMapContainer.innerHTML = "";
    smartMapContainer.classList.add("smart-map-fallback-shell");

    const mapCanvas = document.createElement("div");
    mapCanvas.className = "smart-map-fallback-canvas";

    const labels = [
        { title: "Ram Mandir", top: "38%", left: "56%", type: "temples", search: "ram mandir temple ayodhya janmabhoomi" },
        { title: "Hanuman Garhi", top: "30%", left: "43%", type: "temples", search: "hanuman garhi temple ayodhya" },
        { title: "Kanak Bhawan", top: "48%", left: "68%", type: "temples", search: "kanak bhawan temple ayodhya" },
        { title: "Saryu Ghat", top: "70%", left: "74%", type: "ghats", search: "saryu ghat ayodhya" },
        { title: "Railway", top: "78%", left: "34%", type: "transport", search: "railway station transport ayodhya" },
        { title: "Hotel", top: "24%", left: "24%", type: "hotels", search: "hotel stay ayodhya" },
        { title: "Parking", top: "64%", left: "18%", type: "parking", search: "parking vehicle ayodhya" },
    ];

    smartMapFallbackMarkers = [];

    labels.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "smart-map-fallback-pin";
        button.style.top = item.top;
        button.style.left = item.left;
        button.textContent = item.title;
        button.dataset.type = item.type;
        button.dataset.search = item.search;
        button.addEventListener("click", () => {
            const location = ayodhyaSmartLocations.find((entry) => entry.title.toLowerCase().includes(item.title.toLowerCase().split(" ")[0]) || entry.title.toLowerCase() === item.title.toLowerCase());
            if (location) {
                const referencePoint = smartMapUserLocation || { lat: 26.7922, lng: 82.1998 };
                const distance = getDistanceKm(referencePoint.lat, referencePoint.lng, location.lat, location.lng);
                const travelTime = getTravelTimeKm(distance);
                updateInsightCard(location);
                showMapRipple();
            }
        });
        mapCanvas.appendChild(button);
        smartMapFallbackMarkers.push(button);
    });

    const overlay = document.createElement("div");
    overlay.className = "smart-map-fallback-overlay";
    mapCanvas.appendChild(overlay);

    smartMapContainer.appendChild(mapCanvas);
    updateInsightCard(ayodhyaSmartLocations[0]);
    applyMapFilter();
}

function createGoogleMap() {
    if (!smartMapContainer || !window.google?.maps) {
        createFallbackMap();
        return;
    }

    smartMapMarkers = [];
    const center = { lat: 26.7922, lng: 82.1998 };
    smartMapContainer.innerHTML = "";
    smartMapInstance = new window.google.maps.Map(smartMapContainer, {
        center,
        zoom: 14,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true,
        zoomControl: true,
        gestureHandling: "greedy",
        styles: [
            { elementType: "geometry", stylers: [{ color: "#f5f6fb" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#10253d" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
            { featureType: "road", stylers: [{ color: "#dce7f2" }] },
            { featureType: "water", stylers: [{ color: "#cfe0f2" }] },
            { featureType: "poi", stylers: [{ visibility: "off" }] },
        ],
    });

    const bounds = new window.google.maps.LatLngBounds();
    const markerIcons = {
        temples: { color: "#d4af37", label: "⛩" },
        ghats: { color: "#2f7bd6", label: "🌊" },
        hotels: { color: "#8b5cf6", label: "🏨" },
        restaurants: { color: "#f97316", label: "🍽" },
        transport: { color: "#0f766e", label: "🚗" },
        parking: { color: "#64748b", label: "🅿" },
        hospitals: { color: "#ef4444", label: "⛑" },
        shopping: { color: "#2563eb", label: "🛍" },
        emergency: { color: "#dc2626", label: "🚨" },
    };

    ayodhyaSmartLocations.forEach((location) => {
        const iconConfig = markerIcons[location.type] || markerIcons.temples;
        const marker = new window.google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: smartMapInstance,
            title: location.title,
            animation: window.google.maps.Animation.DROP,
            icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 15,
                fillColor: iconConfig.color,
                fillOpacity: 1,
                strokeWeight: 3,
                strokeColor: "#ffffff",
            },
            label: {
                text: iconConfig.label,
                color: "#ffffff",
                fontSize: "14px",
            },
        });

        marker.__locationId = location.id;
        marker.addListener("click", () => {
            showMapRipple();
            const referencePoint = smartMapUserLocation || { lat: 26.7922, lng: 82.1998 };
            const distance = getDistanceKm(referencePoint.lat, referencePoint.lng, location.lat, location.lng);
            const travelTime = getTravelTimeKm(distance);
            updateInsightCard(location);
            if (smartMapInfoWindow) {
                smartMapInfoWindow.close();
            }
            smartMapInfoWindow = new window.google.maps.InfoWindow({ content: buildInfoWindowContent(location, distance, travelTime) });
            smartMapInfoWindow.open({ map: smartMapInstance, anchor: marker });
        });

        smartMapMarkers.push(marker);
        bounds.extend(marker.getPosition());
    });

    if (smartMapMarkers.length) {
        smartMapInstance.fitBounds(bounds);
        smartMapInstance.setZoom(Math.min(smartMapInstance.getZoom(), 14));
    }

    applyMapFilter();
}

function initializeSmartMap() {
    if (!smartMapContainer) {
        return;
    }

    if (smartMapSkeleton) {
        smartMapSkeleton.classList.remove("is-hidden");
    }

    window.setTimeout(() => {
        createGoogleMap();
        if (smartMapSkeleton) {
            smartMapSkeleton.classList.add("is-hidden");
        }
    }, 450);

    smartMapFilters.forEach((filterButton) => {
        filterButton.addEventListener("click", () => {
            smartMapActiveFilter = filterButton.dataset.filter || "all";
            smartMapFilters.forEach((button) => button.classList.toggle("is-active", button === filterButton));
            applyMapFilter();
        });
    });

    if (smartMapSearchInput) {
        smartMapSearchInput.addEventListener("input", applyMapFilter);
    }

    if (smartMapLocateButton) {
        smartMapLocateButton.addEventListener("click", () => {
            if (!navigator.geolocation) {
                smartMapLocateButton.textContent = "Location unavailable";
                return;
            }

            smartMapLocateButton.textContent = "Locating…";
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    smartMapUserLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
                    smartMapLocateButton.textContent = "Location found";
                    if (smartMapInstance) {
                        smartMapInstance.setCenter(smartMapUserLocation);
                        smartMapInstance.setZoom(14);
                    }
                    const nearestLocation = ayodhyaSmartLocations.reduce((best, current) => {
                        const bestDistance = getDistanceKm(smartMapUserLocation.lat, smartMapUserLocation.lng, best.lat, best.lng);
                        const currentDistance = getDistanceKm(smartMapUserLocation.lat, smartMapUserLocation.lng, current.lat, current.lng);
                        return currentDistance < bestDistance ? current : best;
                    }, ayodhyaSmartLocations[0]);
                    updateInsightCard(nearestLocation);
                    showMapRipple();
                },
                () => {
                    smartMapLocateButton.textContent = "Locate Me";
                }
            );
        });
    }

    updateInsightCard(ayodhyaSmartLocations[0]);
}

if (smartMapContainer) {
    if (window.SMART_MAP_API_KEY) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${window.SMART_MAP_API_KEY}&callback=initAyodhyaSmartMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    } else {
        initializeSmartMap();
    }
}

window.initAyodhyaSmartMap = initializeSmartMap;
