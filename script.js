const clockElement = document.getElementById("clock");
const greetingElement = document.getElementById("greeting");
const searchInput = document.getElementById("search-input");
const themeToggleButton = document.getElementById("theme-toggle");
const linkList = document.querySelector(".link-list");
const addLinkButton = document.getElementById("add-link-btn");

const modalOverlay = document.getElementById("modal-overlay");
const addLinkForm = document.getElementById("add-link-form");
const linkNameInput = document.getElementById("link-name-input");
const linkUrlInput = document.getElementById("link-url-input");
const cancelLinkButton = document.getElementById("cancel-link-btn");
const modalTitle = document.querySelector(".link-modal h3");
const saveLinkButton = document.getElementById("save-link-btn");
const launchAppButton = document.getElementById("launch-app-btn");

let isEditMode = false;
let currentEditId = null;

const EXTENSION_ID_DATA_KEUANGAN = "gchdndkbbogfdppngekmaemgalmcibkb";

function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");

  clockElement.textContent = `${String(hours).padStart(2, "0")}:${minutes}`;

  let greetingText;
  if (hours >= 5 && hours < 11) {
    greetingText = "Selamat Pagi! ☀️";
  } else if (hours >= 11 && hours < 15) {
    greetingText = "Selamat Siang! 😎";
  } else if (hours >= 15 && hours < 18) {
    greetingText = "Selamat Sore! ☕";
  } else {
    greetingText = "Selamat Malam! 🌙";
  }
  greetingElement.textContent = greetingText;
}

setInterval(updateClock, 1000);

function performSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  let url;
  if (query.startsWith("http") || query.startsWith("www.")) {
    url = query.startsWith("http") ? query : `https://${query}`;
  } else {
    url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }

  window.location.href = url;
}

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    performSearch();
  }
});

const themes = ["night", "pink"];
let currentThemeIndex = 0;

function saveTheme(theme) {
  localStorage.setItem("newTabTheme", theme);
  document.body.className = theme;
  updateThemeToggleEmoji(theme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem("newTabTheme") || "night";
  const index = themes.indexOf(savedTheme);
  currentThemeIndex = index !== -1 ? index : 0;
  saveTheme(themes[currentThemeIndex]);
}

function updateThemeToggleEmoji(currentTheme) {
  let nextTheme = themes[(currentThemeIndex + 1) % themes.length];
  let emoji;

  if (nextTheme === "pink") {
    emoji = "🌙";
  } else {
    emoji = "🌸";
  }
  themeToggleButton.textContent = emoji;
  themeToggleButton.title = `Ganti ke ${
    nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1)
  } Theme`;
}

function toggleTheme() {
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  const nextTheme = themes[currentThemeIndex];
  saveTheme(nextTheme);
}

themeToggleButton.addEventListener("click", toggleTheme);

let quickLinks = JSON.parse(localStorage.getItem("quickLinks")) || [
  { id: 1, name: "Google", url: "https://www.google.com" },
  { id: 2, name: "YouTube", url: "https://www.youtube.com" },
];

function saveLinks() {
  localStorage.setItem("quickLinks", JSON.stringify(quickLinks));
}

function createLinkElement(link) {
  const li = document.createElement("li");
  li.className = "link-item";
  li.dataset.id = link.id;

  try {
    const url = new URL(link.url);
    const domain = url.hostname;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

    li.innerHTML = `
        <img class="link-favicon" src="${faviconUrl}" alt="${link.name} Logo">
        <a href="${link.url}" target="_blank">${link.name}</a>
        <button class="edit-link-btn" data-id="${link.id}">✏️</button>
        <button class="delete-link-btn" data-id="${link.id}">❌</button>
    `;
  } catch (e) {
    li.innerHTML = `
        <a href="${link.url}" target="_blank">🌐 ${link.name} (URL error)</a>
        <button class="edit-link-btn" data-id="${link.id}">✏️</button>
        <button class="delete-link-btn" data-id="${link.id}">❌</button>
    `;
  }

  li.querySelector(".delete-link-btn").addEventListener("click", (e) => {
    deleteLink(link.id);
  });

  li.querySelector(".edit-link-btn").addEventListener("click", () => {
    startEditLink(link.id);
  });

  return li;
}

function renderLinks() {
  linkList.innerHTML = "";

  if (quickLinks.length === 0) {
    linkList.innerHTML =
      '<li style="text-align: center; opacity: 0.7; padding: 10px;">Belum ada Link Cepat.</li>';
    return;
  }

  quickLinks.forEach((link) => {
    linkList.appendChild(createLinkElement(link));
  });
}

function showModal() {
  modalOverlay.style.display = "flex";
  linkNameInput.focus();
}

function hideModal() {
  modalOverlay.style.display = "none";
  addLinkForm.reset();

  isEditMode = false;
  currentEditId = null;
  modalTitle.textContent = "Tambah Link Cepat";
  saveLinkButton.textContent = "Simpan";
}

function startEditLink(id) {
  isEditMode = true;
  currentEditId = id;

  const linkToEdit = quickLinks.find((link) => link.id === id);
  if (!linkToEdit) return;

  modalTitle.textContent = "Edit Link Cepat";
  saveLinkButton.textContent = "Perbarui";

  linkNameInput.value = linkToEdit.name;
  linkUrlInput.value = linkToEdit.url;

  showModal();
}

function handleSaveLink(e) {
  e.preventDefault();

  const name = linkNameInput.value.trim();
  let url = linkUrlInput.value.trim();

  if (!name || !url) return;

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  if (isEditMode) {
    quickLinks = quickLinks.map((link) => {
      if (link.id === currentEditId) {
        return { id: currentEditId, name, url };
      }
      return link;
    });
  } else {
    const newLink = {
      id: Date.now(),
      name: name,
      url: url,
    };
    quickLinks.push(newLink);
  }

  saveLinks();
  renderLinks();
  hideModal();
}

function deleteLink(id) {
  if (confirm("Yakin ingin menghapus link ini?")) {
    quickLinks = quickLinks.filter((link) => link.id != id);
    saveLinks();
    renderLinks();
  }
}

addLinkButton.addEventListener("click", () => {
  hideModal();
  showModal();
});

cancelLinkButton.addEventListener("click", hideModal);
addLinkForm.addEventListener("submit", handleSaveLink);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    hideModal();
  }
});

launchAppButton.addEventListener("click", () => {
  if (
    EXTENSION_ID_DATA_KEUANGAN === "PASTE_ID_EKSTENSI_DATA_KEUANGAN_DI_SINI"
  ) {
    alert(
      "PERINGATAN: Harap ganti EXTENSION_ID_DATA_KEUANGAN di script.js dengan ID Ekstensi Data Keuangan yang valid."
    );
    return;
  }
  const targetUrl = `chrome-extension://${EXTENSION_ID_DATA_KEUANGAN}/html/index.html`;
  chrome.tabs.create({ url: targetUrl });
});

document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  renderLinks();
  updateClock();
});
