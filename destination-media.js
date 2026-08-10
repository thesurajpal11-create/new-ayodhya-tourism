const MEDIA_API_BASE_URL = window.RAMNAGARI_API_BASE_URL || "http://127.0.0.1:8000";

function getDestinationSlug() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const destinationIndex = parts.indexOf("destinations");
    return parts[destinationIndex + 1] || document.body.dataset.destinationSlug || "destination";
}

function mediaUrl(url) {
    if (!url) {
        return "";
    }
    return url.startsWith("/") ? `${MEDIA_API_BASE_URL}${url}` : url;
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

function getYouTubeEmbedUrl(url) {
    if (!url) {
        return "";
    }

    const trimmed = url.trim();
    const patterns = [
        /youtube\.com\/watch\?v=([^&]+)/i,
        /youtu\.be\/([^?&]+)/i,
        /youtube\.com\/embed\/([^?&]+)/i
    ];

    for (const pattern of patterns) {
        const match = trimmed.match(pattern);
        if (match?.[1]) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }
    }

    return "";
}

function createButton(text, className = "btn btn-secondary") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = text;
    return button;
}

async function mediaRequest(path, options = {}) {
    const response = await fetch(`${MEDIA_API_BASE_URL}${path}`, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || "Media request failed");
    }
    return data;
}

function setStatus(element, message, type = "") {
    if (!element) {
        return;
    }
    element.textContent = message;
    element.className = `media-status ${type}`.trim();
}

const destinationSlug = getDestinationSlug();
let savedMedia = [];

async function loadSavedMedia() {
    savedMedia = await mediaRequest(`/api/media/destinations/${destinationSlug}`);
    renderSavedImages();
    renderSavedVideos();
}

async function deleteMedia(mediaId) {
    await mediaRequest(`/api/media/destinations/${destinationSlug}/${mediaId}`, {
        method: "DELETE",
    });
    await loadSavedMedia();
}

function imageCard(item) {
    const wrapper = document.createElement("div");
    wrapper.className = "gallery-photo saved-media-item";
    wrapper.dataset.mediaId = item.id;

    const image = document.createElement("img");
    image.src = mediaUrl(item.url);
    image.alt = item.name || "Saved destination photo";

    const deleteButton = createButton("Delete", "media-delete-button");
    deleteButton.addEventListener("click", async () => {
        deleteButton.disabled = true;
        await deleteMedia(item.id);
    });

    wrapper.append(image, deleteButton);
    return wrapper;
}

function renderSavedImages() {
    const gallery = document.querySelector(".destination-gallery-grid");
    if (!gallery) {
        return;
    }

    gallery.querySelectorAll(".saved-media-item").forEach((item) => item.remove());
    savedMedia
        .filter((item) => item.type === "image")
        .forEach((item) => gallery.appendChild(imageCard(item)));
}

function videoCard(item) {
    const wrapper = document.createElement("div");
    wrapper.className = "saved-video-item";

    if (item.source === "youtube") {
        const iframe = document.createElement("iframe");
        iframe.src = getYouTubeEmbedUrl(item.url);
        iframe.title = "Saved YouTube destination video";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        wrapper.appendChild(iframe);
    } else {
        const video = document.createElement("video");
        video.controls = true;
        video.src = mediaUrl(item.url);
        wrapper.appendChild(video);
    }

    const deleteButton = createButton("Delete", "media-delete-button");
    deleteButton.addEventListener("click", async () => {
        deleteButton.disabled = true;
        await deleteMedia(item.id);
    });
    wrapper.appendChild(deleteButton);
    return wrapper;
}

function renderVideoList(container, items, placeholder) {
    if (!container) {
        return;
    }

    container.innerHTML = "";
    if (!items.length) {
        container.innerHTML = `<div class="video-preview-placeholder">${placeholder}</div>`;
        return;
    }

    items.forEach((item) => container.appendChild(videoCard(item)));
}

function renderSavedVideos() {
    document.querySelectorAll(".video-section-grid").forEach((videoBlock) => {
        const filePreview = videoBlock.querySelector("[data-video-file-preview]");
        const youtubePreview = videoBlock.querySelector("[data-youtube-preview]");
        renderVideoList(
            filePreview,
            savedMedia.filter((item) => item.type === "video" && item.source === "upload"),
            "Uploaded video preview will appear here."
        );
        renderVideoList(
            youtubePreview,
            savedMedia.filter((item) => item.type === "video" && item.source === "youtube"),
            "Paste a YouTube link to preview it here."
        );
    });
}

document.querySelectorAll("[data-gallery-upload]").forEach((galleryBlock) => {
    const input = galleryBlock.querySelector("[data-gallery-input]");
    const preview = galleryBlock.querySelector("[data-gallery-preview]");

    if (!input || !preview) {
        return;
    }

    const actions = document.createElement("div");
    actions.className = "media-actions";
    const saveButton = createButton("Save Photos", "btn btn-primary");
    const clearButton = createButton("Clear Selection");
    const status = document.createElement("p");
    status.className = "media-status";
    actions.append(saveButton, clearButton);
    galleryBlock.append(actions, status);

    input.addEventListener("change", () => {
        preview.innerHTML = "";

        const files = Array.from(input.files || []);
        files.forEach((file) => {
            if (!file.type.startsWith("image/")) {
                return;
            }

            const item = document.createElement("div");
            item.className = "upload-preview-item";
            item.innerHTML = `<img src="${escapeHtml(URL.createObjectURL(file))}" alt="${escapeHtml(file.name || "Selected photo")}">`;
            preview.appendChild(item);
        });
    });

    clearButton.addEventListener("click", () => {
        input.value = "";
        preview.innerHTML = "";
        setStatus(status, "");
    });

    saveButton.addEventListener("click", async () => {
        const files = Array.from(input.files || []).filter((file) => file.type.startsWith("image/"));
        if (!files.length) {
            setStatus(status, "Choose photo first.", "error");
            return;
        }

        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        saveButton.disabled = true;
        setStatus(status, "Saving photos...");
        try {
            await mediaRequest(`/api/media/destinations/${destinationSlug}/images`, {
                method: "POST",
                body: formData,
            });
            input.value = "";
            preview.innerHTML = "";
            setStatus(status, "Photos saved permanently.", "success");
            await loadSavedMedia();
        } catch (error) {
            setStatus(status, error.message, "error");
        } finally {
            saveButton.disabled = false;
        }
    });
});

document.querySelectorAll(".video-section-grid").forEach((videoBlock) => {
    const fileInput = videoBlock.querySelector("[data-video-file-input]");
    const linkInput = videoBlock.querySelector("[data-video-link-input]");
    const filePreview = videoBlock.querySelector("[data-video-file-preview]");
    const youtubePreview = videoBlock.querySelector("[data-youtube-preview]");
    const adminCard = videoBlock.querySelector(".media-admin-card");

    if (!adminCard) {
        return;
    }

    const actions = document.createElement("div");
    actions.className = "media-actions";
    const saveVideoButton = createButton("Save Video", "btn btn-primary");
    const saveYoutubeButton = createButton("Save YouTube", "btn btn-primary");
    const clearButton = createButton("Clear Selection");
    const status = document.createElement("p");
    status.className = "media-status";
    actions.append(saveVideoButton, saveYoutubeButton, clearButton);
    adminCard.append(actions, status);

    if (fileInput && filePreview) {
        fileInput.addEventListener("change", () => {
            const file = fileInput.files?.[0];
            if (!file || !file.type.startsWith("video/")) {
                return;
            }

            filePreview.innerHTML = "";
            const video = document.createElement("video");
            video.controls = true;
            video.src = URL.createObjectURL(file);
            filePreview.appendChild(video);
        });
    }

    if (linkInput && youtubePreview) {
        linkInput.addEventListener("input", () => {
            const embedUrl = getYouTubeEmbedUrl(linkInput.value);
            if (!embedUrl) {
                renderSavedVideos();
                return;
            }

            youtubePreview.innerHTML = "";
            const iframe = document.createElement("iframe");
            iframe.src = embedUrl;
            iframe.title = "Destination YouTube preview";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            iframe.allowFullscreen = true;
            youtubePreview.appendChild(iframe);
        });
    }

    clearButton.addEventListener("click", () => {
        if (fileInput) {
            fileInput.value = "";
        }
        if (linkInput) {
            linkInput.value = "";
        }
        setStatus(status, "");
        renderSavedVideos();
    });

    saveVideoButton.addEventListener("click", async () => {
        const file = fileInput?.files?.[0];
        if (!file || !file.type.startsWith("video/")) {
            setStatus(status, "Choose video first.", "error");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        saveVideoButton.disabled = true;
        setStatus(status, "Saving video...");
        try {
            await mediaRequest(`/api/media/destinations/${destinationSlug}/video-file`, {
                method: "POST",
                body: formData,
            });
            fileInput.value = "";
            setStatus(status, "Video saved permanently.", "success");
            await loadSavedMedia();
        } catch (error) {
            setStatus(status, error.message, "error");
        } finally {
            saveVideoButton.disabled = false;
        }
    });

    saveYoutubeButton.addEventListener("click", async () => {
        if (!getYouTubeEmbedUrl(linkInput?.value || "")) {
            setStatus(status, "Paste a valid YouTube link first.", "error");
            return;
        }

        const formData = new FormData();
        formData.append("url", linkInput.value.trim());

        saveYoutubeButton.disabled = true;
        setStatus(status, "Saving YouTube link...");
        try {
            await mediaRequest(`/api/media/destinations/${destinationSlug}/youtube`, {
                method: "POST",
                body: formData,
            });
            linkInput.value = "";
            setStatus(status, "YouTube link saved permanently.", "success");
            await loadSavedMedia();
        } catch (error) {
            setStatus(status, error.message, "error");
        } finally {
            saveYoutubeButton.disabled = false;
        }
    });
});

loadSavedMedia().catch(() => {
    document.querySelectorAll(".media-admin-card").forEach((card) => {
        const status = document.createElement("p");
        status.className = "media-status error";
        status.textContent = "Start backend at http://127.0.0.1:8000 to save media permanently.";
        card.appendChild(status);
    });
});
