const deepotsavEnquiryForm = document.getElementById("deepotsavEnquiryForm");

if (deepotsavEnquiryForm) {
    const deepotsavArrivalInput = document.getElementById("deepotsavArrival");
    const deepotsavStartedAtInput = document.getElementById("deepotsavFormStartedAt");
    const deepotsavFeedback = document.getElementById("deepotsavFormFeedback");
    const deepotsavSubmitButton = deepotsavEnquiryForm.querySelector("button[type='submit']");

    function resetDeepotsavFormClock() {
        if (deepotsavStartedAtInput) {
            deepotsavStartedAtInput.value = String(Date.now());
        }
    }

    function setDeepotsavFormFeedback(message, isError = false) {
        if (!deepotsavFeedback) {
            return;
        }

        deepotsavFeedback.textContent = message;
        deepotsavFeedback.classList.toggle("is-error", isError);
    }

    if (deepotsavArrivalInput) {
        const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        deepotsavArrivalInput.min = today.toISOString().slice(0, 10);
    }

    resetDeepotsavFormClock();

    deepotsavEnquiryForm.querySelectorAll("input, select, textarea").forEach((field) => {
        field.addEventListener("input", () => {
            field.removeAttribute("aria-invalid");
        });
        field.addEventListener("change", () => {
            field.removeAttribute("aria-invalid");
        });
    });

    deepotsavEnquiryForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const fields = [...deepotsavEnquiryForm.querySelectorAll("input:not([type='hidden']):not([tabindex='-1']), select, textarea")];
        let firstInvalidField = null;

        fields.forEach((field) => {
            const fieldIsValid = field.checkValidity();
            field.setAttribute("aria-invalid", String(!fieldIsValid));
            if (!fieldIsValid && !firstInvalidField) {
                firstInvalidField = field;
            }
        });

        const mobileField = document.getElementById("deepotsavMobile");
        if (mobileField && mobileField.value.replace(/\D/g, "").length < 10) {
            mobileField.setAttribute("aria-invalid", "true");
            firstInvalidField = firstInvalidField || mobileField;
        }

        if (firstInvalidField) {
            firstInvalidField.focus();
            firstInvalidField.reportValidity();
            setDeepotsavFormFeedback("Please check the highlighted fields and try again.", true);
            return;
        }

        const originalButtonText = deepotsavSubmitButton?.textContent || "Send Enquiry";
        if (deepotsavSubmitButton) {
            deepotsavSubmitButton.disabled = true;
            deepotsavSubmitButton.textContent = "Sending enquiry...";
        }
        setDeepotsavFormFeedback("Sending your enquiry securely...");

        const localHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
        const apiBase = window.RAMNAGARI_API_BASE_URL || (localHost ? "http://127.0.0.1:8000" : window.location.origin);

        try {
            const response = await fetch(`${apiBase}/api/enquiries/deepotsav`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(Object.fromEntries(new FormData(deepotsavEnquiryForm).entries())),
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok || result.success !== true) {
                throw new Error(result.detail || "We could not send your enquiry right now. Please call or WhatsApp us.");
            }

            deepotsavEnquiryForm.reset();
            resetDeepotsavFormClock();
            deepotsavEnquiryForm.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
            setDeepotsavFormFeedback(result.message || "Thank you. Your enquiry has been sent successfully.");
        } catch (error) {
            setDeepotsavFormFeedback(error.message || "We could not send your enquiry. Please call or WhatsApp us.", true);
        } finally {
            if (deepotsavSubmitButton) {
                deepotsavSubmitButton.disabled = false;
                deepotsavSubmitButton.textContent = originalButtonText;
            }
        }
    });
}