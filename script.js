const clockElement = document.getElementById("clock");
const greetingElement = document.getElementById("greeting");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-btn");
const themeToggleButton = document.getElementById("theme-toggle");

function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");

  clockElement.textContent = `${String(hours).padStart(2, "0")}:${minutes}`;

  let greetingText;
  if (hours >= 5 && hours < 12) {
    greetingText = "Selamat Pagi! 🌅";
  } else if (hours >= 12 && hours < 18) {
    greetingText = "Selamat Siang/Sore! 😎";
  } else {
    greetingText = "Selamat Malam! 🌙";
  }
  greetingElement.textContent = greetingText;
}

setInterval(updateClock, 1000);
updateClock();

function performSearch() {
  const query = searchInput.value.trim();
  if (query) {
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(
      query
    )}`;
  }
}

searchButton.addEventListener("click", performSearch);
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
  let emoji;

  if (currentTheme === "night") {
    emoji = "🌙";
  } else {
    emoji = "🌸";
  }
  themeToggleButton.textContent = emoji;
}

function toggleTheme() {
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  const nextTheme = themes[currentThemeIndex];
  saveTheme(nextTheme);
}

themeToggleButton.addEventListener("click", toggleTheme);
loadTheme();
