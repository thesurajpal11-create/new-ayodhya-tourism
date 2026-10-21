(() => {
    const storageKey = "ramnagariTheme";
    const root = document.documentElement;

    const applyTheme = (theme) => {
        root.dataset.theme = theme;
    };

    let savedTheme = "light";
    try {
        const storedTheme = localStorage.getItem(storageKey);
        if (storedTheme === "dark" || storedTheme === "light") {
            savedTheme = storedTheme;
        }
    } catch (error) {
        console.error("Unable to read the saved theme preference.", error);
    }
    applyTheme(savedTheme);

    const initializeThemeToggle = () => {
        const navMenu = document.querySelector(".nav-menu");
        const toggleHost = navMenu || document.querySelector(".chat-header-actions");
        if (!toggleHost || toggleHost.querySelector(".theme-toggle")) {
            return;
        }

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = navMenu ? "theme-toggle" : "theme-toggle chat-theme-toggle";
        toggle.setAttribute("aria-pressed", String(savedTheme === "dark"));
        toggle.innerHTML = `
            <svg class="theme-toggle-icon icon-moon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.9 13.1A8.5 8.5 0 0 1 10.9 3.1a8.5 8.5 0 1 0 10 10Z"></path>
            </svg>
            <svg class="theme-toggle-icon icon-sun" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"></path>
            </svg>
        `;

        const updateToggle = (theme) => {
            const isDark = theme === "dark";
            toggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
            toggle.setAttribute("aria-pressed", String(isDark));
        };

        updateToggle(savedTheme);
        toggle.addEventListener("click", () => {
            savedTheme = root.dataset.theme === "dark" ? "light" : "dark";
            applyTheme(savedTheme);
            updateToggle(savedTheme);

            try {
                localStorage.setItem(storageKey, savedTheme);
            } catch (error) {
                console.error("Unable to save the theme preference.", error);
            }
        });

        toggleHost.append(toggle);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeThemeToggle, { once: true });
    } else {
        initializeThemeToggle();
    }
})();
