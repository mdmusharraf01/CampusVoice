
console.log("Campus Voice JavaScript loaded!");

// ---------- ELEMENTS ----------
const openFormBtn = document.getElementById("openFormBtn");
const cancelFormBtn = document.getElementById("cancelFormBtn");
const formSection = document.getElementById("announcementFormSection");
const announcementForm = document.getElementById("announcementForm");

const titleField = document.getElementById("announcementTitle");
const categoryField = document.getElementById("announcementCategory");
const descriptionField = document.getElementById("announcementDescription");

const announcementList = document.getElementById("announcementList");
const emptyMessage = document.getElementById("emptyMessage");
const searchInput = document.getElementById("searchInput");
const categoryButtons = document.querySelectorAll(".category-btn");

const totalCount = document.getElementById("totalCount");
const academicCount = document.getElementById("academicCount");
const eventCount = document.getElementById("eventCount");
const resultCount = document.getElementById("resultCount");

// ---------- DEFAULT ANNOUNCEMENT ----------
const defaultAnnouncements = [
    {
        id: "demo-1",
        title: "Internal Assessment Schedule",
        category: "Academic",
        description:
            "Internal assessments begin next Monday. Check your department timetable.",
        createdAt: "2026-09-28T10:30:00"
    }
];

// ---------- LOCAL STORAGE ----------
function loadAnnouncements() {
    try {
        const saved = localStorage.getItem("aitAnnouncements");

        if (saved === null) {
            return defaultAnnouncements;
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return defaultAnnouncements;
        }

        return parsed.filter(item =>
            item &&
            typeof item.id === "string" &&
            typeof item.title === "string" &&
            typeof item.description === "string" &&
            ["Academic", "Events", "Placement"].includes(item.category) &&
            typeof item.createdAt === "string"
        );
    } catch (error) {
        console.error("Could not load announcements:", error);
        return defaultAnnouncements;
    }
}

let announcements = loadAnnouncements();
let selectedCategory = "All";

function saveAnnouncements() {
    try {
        localStorage.setItem("aitAnnouncements", JSON.stringify(announcements));
    } catch (error) {
        alert("Could not save data in this browser.");
        console.error(error);
    }
}

// ---------- FORM OPEN / CLOSE ----------
openFormBtn.addEventListener("click", () => {
    formSection.classList.toggle("hidden");

    if (!formSection.classList.contains("hidden")) {
        titleField.focus();
        formSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
});

cancelFormBtn.addEventListener("click", () => {
    announcementForm.reset();
    formSection.classList.add("hidden");
});

// ---------- ADD ANNOUNCEMENT ----------
announcementForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleField.value.trim();
    const category = categoryField.value;
    const description = descriptionField.value.trim();

    if (!title || !description) {
        alert("Please enter both a title and description.");
        return;
    }

    const newAnnouncement = {
        id: crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
        title,
        category,
        description,
        createdAt: new Date().toISOString()
    };

    announcements.unshift(newAnnouncement);
    saveAnnouncements();

    selectedCategory = "All";
    searchInput.value = "";

    categoryButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.category === "All"
        );
    });

    renderAnnouncements();

    announcementForm.reset();
    formSection.classList.add("hidden");

    alert("Announcement published successfully!");
});

// ---------- FILTER CATEGORIES ----------
categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectedCategory = button.dataset.category;

        categoryButtons.forEach(btn => {
            btn.classList.toggle("active", btn === button);
        });

        renderAnnouncements();
    });
});

// ---------- SEARCH ----------
searchInput.addEventListener("input", renderAnnouncements);

// ---------- FORMAT DATE AND TIME ----------
function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// ---------- CREATE ELEMENT SAFELY ----------
function createTextElement(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
}

// ---------- RENDER ANNOUNCEMENTS ----------
function renderAnnouncements() {
    const query = searchInput.value.trim().toLowerCase();

    const filtered = announcements.filter(item => {
        const matchesCategory =
            selectedCategory === "All" ||
            item.category === selectedCategory;

        const matchesSearch =
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
    });

    announcementList.replaceChildren();

    filtered.forEach(item => {
        const article = document.createElement("article");
        article.className =
            "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";

        const topRow = document.createElement("div");
        topRow.className =
            "flex flex-wrap items-center justify-between gap-3";

        const categoryColors = {
            Academic: "bg-blue-50 text-blue-700",
            Events: "bg-purple-50 text-purple-700",
            Placement: "bg-emerald-50 text-emerald-700"
        };

        const badge = createTextElement(
            "span",
            `inline-flex rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                categoryColors[item.category]
            }`,
            item.category
        );

        const deleteButton = createTextElement(
            "button",
            "rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50",
            "Delete"
        );

        deleteButton.type = "button";
        deleteButton.setAttribute(
            "aria-label",
            `Delete announcement: ${item.title}`
        );

        deleteButton.addEventListener("click", () => {
            const confirmed = confirm(
                `Delete "${item.title}"? This cannot be undone.`
            );

            if (!confirmed) return;

            announcements = announcements.filter(
                announcement => announcement.id !== item.id
            );

            saveAnnouncements();
            renderAnnouncements();
        });

        topRow.append(badge, deleteButton);

        const title = createTextElement(
            "h3",
            "mt-4 text-xl font-bold text-slate-900",
            item.title
        );

        const description = createTextElement(
            "p",
            "mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600",
            item.description
        );

        const footer = document.createElement("div");
        footer.className = "mt-5 border-t border-slate-100 pt-4";

        const date = createTextElement(
            "p",
            "text-sm text-slate-500",
            formatDate(item.createdAt)
        );

        footer.appendChild(date);
        article.append(topRow, title, description, footer);
        announcementList.appendChild(article);
    });

    emptyMessage.classList.toggle("hidden", filtered.length !== 0);
    resultCount.textContent = `${filtered.length} result(s)`;

    // Dashboard counts
    totalCount.textContent = announcements.length;
    academicCount.textContent = announcements.filter(
        item => item.category === "Academic"
    ).length;
    eventCount.textContent = announcements.filter(
        item => item.category === "Events"
    ).length;
}

// ---------- HEADER CUSTOMIZATION ----------
const headerTitle = document.getElementById("headerTitle");
const headerSubtitle = document.getElementById("headerSubtitle");
const titleInput = document.getElementById("titleInput");
const subtitleInput = document.getElementById("subtitleInput");
const resetHeaderBtn = document.getElementById("resetHeaderBtn");

const defaultTitle = "Campus Voice";
const defaultSubtitle = "One campus. One voice.";

function loadHeaderSettings() {
    try {
        const title = localStorage.getItem("aitHeaderTitle");
        const subtitle = localStorage.getItem("aitHeaderSubtitle");

        if (title !== null) headerTitle.textContent = title;
        if (subtitle !== null) headerSubtitle.textContent = subtitle;

        titleInput.value = title || "";
        subtitleInput.value = subtitle || "";
    } catch (error) {
        console.error("Could not load header settings:", error);
    }
}

titleInput.addEventListener("input", () => {
    const value = titleInput.value.trim();

    headerTitle.textContent = value || defaultTitle;

    try {
        localStorage.setItem("aitHeaderTitle", value);
    } catch (error) {
        console.error(error);
    }
});

subtitleInput.addEventListener("input", () => {
    const value = subtitleInput.value.trim();

    headerSubtitle.textContent = value || defaultSubtitle;

    try {
        localStorage.setItem("aitHeaderSubtitle", value);
    } catch (error) {
        console.error(error);
    }
});

resetHeaderBtn.addEventListener("click", () => {
    titleInput.value = "";
    subtitleInput.value = "";

    headerTitle.textContent = defaultTitle;
    headerSubtitle.textContent = defaultSubtitle;

    try {
        localStorage.removeItem("aitHeaderTitle");
        localStorage.removeItem("aitHeaderSubtitle");
    } catch (error) {
        console.error(error);
    }
});

// ---------- INITIALIZE ----------
loadHeaderSettings();
renderAnnouncements();
