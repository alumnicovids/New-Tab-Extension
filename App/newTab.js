document.addEventListener("DOMContentLoaded", () => {
  const THEME_KEY = "userTheme";
  const QUICK_LINKS_KEY = "quickLinks";

  // ===================================
  // LOGIKA PERPINDAHAN SITUS
  // ===================================
  const navLinks = document.querySelectorAll("#nav-list a");
  const sites = document.querySelectorAll(".website-container > div");

  const switchSite = (targetSiteId, currentLink) => {
    sites.forEach((site) => {
      site.classList.remove("active-site");
    });

    navLinks.forEach((link) => {
      link.classList.remove("active-nav-link");
    });

    const targetSite = document.getElementById(targetSiteId);
    if (targetSite) {
      targetSite.classList.add("active-site");
    }

    if (currentLink) {
      currentLink.classList.add("active-nav-link");
    }
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const targetId = link.getAttribute("href").substring(1);
      switchSite(targetId, e.currentTarget);
    });
  });

  const initialActiveSite = document.querySelector(
    ".website-container > .active-site"
  );
  if (initialActiveSite) {
    const initialTargetId = initialActiveSite.id;
    const initialLink = document.querySelector(
      `#nav-list a[href="#${initialTargetId}"]`
    );
    if (initialLink) {
      initialLink.classList.add("active-nav-link");
    }
  }

  // ===================================
  // LOGIKA HOME SITE
  // ===================================

  const homeSiteLogic = () => {
    const clockElement = document.getElementById("clock");
    const greetingElement = document.getElementById("gretting");
    const searchInput = document.getElementById("home-search-input");
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const settingsPanel = document.querySelector(".settings-panel");
    const saveColorsBtn = document.getElementById("save-colors-btn");

    const colorDominant = document.getElementById("color-dominant");
    const colorSecondary = document.getElementById("color-secondary");
    const colorAccent = document.getElementById("color-accent");

    const addLinkBtn = document.getElementById("add-link-btn");
    const clearAllLinkBtn = document.getElementById("clear-all-link-btn");
    const addLinkModal = document.getElementById("modal-overlay");
    const cancelLinkBtn = document.getElementById("cancel-link-btn");
    const addLinkForm = document.getElementById("add-link-form");
    const linkList = document.querySelector(".link-list");

    const deleteModal = document.getElementById("delete-modal");
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
    const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
    let linkIdToDelete = null;

    const editModal = document.getElementById("edit-modal");
    const editForm = document.getElementById("edit-form");
    const editNameInput = document.getElementById("edit-task-input");
    const editUrlInput = document.getElementById("edit-date-input");
    let linkIdToEdit = null;

    const confirmEditBtn = document.getElementById("confirm-edit-btn");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");

    const customAlertModal = document.getElementById("custom-alert-modal");
    const modalMessage = document.getElementById("modal-message");

    const showToast = (message, duration = 2000) => {
      if (!customAlertModal || !modalMessage) return;

      modalMessage.textContent = message;
      customAlertModal.classList.add("active");

      setTimeout(() => {
        customAlertModal.classList.remove("active");
      }, duration);
    };

    // -----------------------------------
    // 1. CLOCK & GREETING (Kode tetap sama)
    // -----------------------------------
    const updateClockAndGreeting = () => {
      const now = new Date();
      const hours = now.getHours();

      const timeString = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      if (clockElement) clockElement.textContent = timeString;

      let greeting;
      if (hours >= 5 && hours < 11) {
        greeting = "Good Morning! 🌅";
      } else if (hours >= 11 && hours < 15) {
        greeting = "Good afternoon! ☀️";
      } else if (hours >= 15 && hours < 18) {
        greeting = "Good afternoon! 🌇";
      } else {
        greeting = "Good night! 🌙";
      }
      if (greetingElement) greetingElement.textContent = greeting;
    };

    updateClockAndGreeting();
    setInterval(updateClockAndGreeting, 1000);

    // -----------------------------------
    // 2. SEARCH FUNCTIONALITY (Kode tetap sama)
    // -----------------------------------
    const handleSearch = (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (!query) return;

        const isURL = query.includes(".") && !query.includes(" ");
        let url;

        if (isURL && !query.startsWith("http")) {
          url = "https://" + query;
        } else if (isURL) {
          url = query;
        } else {
          url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }

        window.location.href = url;
        searchInput.value = "";
      }
    };

    if (searchInput) {
      searchInput.addEventListener("keypress", handleSearch);
    }

    // -----------------------------------
    // 3. SETTINGS PANEL & THEME (Kode tetap sama)
    // -----------------------------------
    const toggleSettingsPanel = () => {
      if (settingsPanel) {
        settingsPanel.classList.toggle("open");
      }
    };

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", toggleSettingsPanel);
    }

    const applyTheme = (colors) => {
      const root = document.documentElement;
      root.style.setProperty("--dominant-color", colors.dominant);
      root.style.setProperty("--secondary-color", colors.secondary);
      root.style.setProperty("--accent-color", colors.accent);
      root.style.setProperty("--main-info-color", colors.accent);
      root.style.setProperty("--button-bg", colors.accent);
    };

    const loadTheme = () => {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) {
        const colors = JSON.parse(savedTheme);
        applyTheme(colors);

        if (colorDominant) colorDominant.value = colors.dominant;
        if (colorSecondary) colorSecondary.value = colors.secondary;
        if (colorAccent) colorAccent.value = colors.accent;
      }
    };

    const handleSaveTheme = () => {
      if (!colorDominant || !colorSecondary || !colorAccent) return;

      const colors = {
        dominant: colorDominant.value,
        secondary: colorSecondary.value,
        accent: colorAccent.value,
      };

      localStorage.setItem(THEME_KEY, JSON.stringify(colors));
      applyTheme(colors);

      if (settingsPanel && settingsPanel.classList.contains("open")) {
        toggleSettingsPanel();
      }
    };

    if (saveColorsBtn) {
      saveColorsBtn.addEventListener("click", handleSaveTheme);
    }

    [colorDominant, colorSecondary, colorAccent].forEach((input) => {
      if (input) {
        input.addEventListener("input", (e) => {
          const root = document.documentElement;
          const cssVar = "--" + e.target.id.replace("color-", "") + "-color";
          root.style.setProperty(cssVar, e.target.value);

          if (e.target.id === "color-accent") {
            root.style.setProperty("--main-info-color", e.target.value);
            root.style.setProperty("--button-bg", e.target.value);
          }
        });
      }
    });

    loadTheme();

    // -----------------------------------
    // 4. QUICK LINKS (CRUD)
    // -----------------------------------

    const getLinks = () => {
      const linksJson = localStorage.getItem(QUICK_LINKS_KEY);
      return linksJson ? JSON.parse(linksJson) : [];
    };

    const saveLinks = (links) => {
      localStorage.setItem(QUICK_LINKS_KEY, JSON.stringify(links));
      renderLinks();
    };

    const deleteLink = (id) => {
      let links = getLinks();
      links = links.filter((link) => link.id !== id);
      saveLinks(links);
    };

    const clearAllLinks = () => {
      if (confirm("Are you sure you want to delete all quick links?")) {
        saveLinks([]);
      }
    };

    const openEditModal = (id) => {
      const links = getLinks();
      const link = links.find((l) => l.id === id);

      if (link && editModal && editNameInput && editUrlInput) {
        linkIdToEdit = id;

        editUrlInput.setAttribute("type", "text");

        editNameInput.value = link.name;
        editUrlInput.value = link.url;

        editModal.classList.add("active");

        const modalTitle = editModal.querySelector("h2");
        if (modalTitle) modalTitle.textContent = "✏️ Edit Quick Link";
      }
    };

    const getFaviconUrl = (url) => {
      try {
        const domain = new URL(url).hostname;
        return `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=32`;
      } catch (e) {
        return "";
      }
    };

    const renderLinks = () => {
      if (!linkList) return;

      const links = getLinks();
      linkList.innerHTML = "";

      if (links.length === 0) {
        linkList.innerHTML =
          '<p style="text-align:center; opacity:0.7;">No quick links have been added yet.</p>';
        return;
      }

      links.forEach((link) => {
        const listItem = document.createElement("li");
        listItem.classList.add("link-list-item");

        const faviconUrl = getFaviconUrl(link.url);

        listItem.innerHTML = `
      <a href="${link.url}" class="link-item" target="_blank" title="${
          link.url
        }">
        ${
          faviconUrl
            ? `<img src="${faviconUrl}" alt="${link.name} icon" class="link-favicon">`
            : "🔗"
        }
        ${link.name}
      </a>
      <button data-id="${
        link.id
      }" class="edit-link-btn" title="Edit Link">✏️</button>
      <button data-id="${
        link.id
      }" class="delete-link-btn" title="Delete Link">❌</button>
    `;

        linkList.appendChild(listItem);
      });

      document.querySelectorAll(".edit-link-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          const idToEdit = parseInt(e.currentTarget.dataset.id);
          openEditModal(idToEdit);
        });
      });

      document.querySelectorAll(".delete-link-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          linkIdToDelete = parseInt(e.currentTarget.dataset.id);
          if (deleteModal) {
            deleteModal.classList.add("active");
          }
        });
      });
    };

    if (addLinkBtn && addLinkModal) {
      addLinkBtn.addEventListener("click", () => {
        addLinkModal.classList.add("active");
      });
    }

    if (clearAllLinkBtn) {
      clearAllLinkBtn.addEventListener("click", clearAllLinks);
    }

    if (cancelLinkBtn && addLinkModal) {
      cancelLinkBtn.addEventListener("click", () => {
        addLinkModal.classList.remove("active");
        if (addLinkForm) addLinkForm.reset();
      });
    }

    if (addLinkForm && addLinkModal) {
      addLinkForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const nameInput = document.getElementById("link-name-input");
        const urlInput = document.getElementById("link-url-input");

        if (nameInput && urlInput) {
          const name = nameInput.value.trim();
          let url = urlInput.value.trim();

          if (!name || !url) {
            showToast("Name and URL are required!", 3000);
            return;
          }

          if (!url.match(/^(f|ht)tps?:\/\//i)) {
            url = "https://" + url;
          }

          const links = getLinks();
          const newId = Date.now();

          links.push({ id: newId, name, url });
          saveLinks(links);

          showToast(`"${name}" link added successfully!`);

          addLinkModal.classList.remove("active");
          addLinkForm.reset();
        }
      });
    }

    if (confirmDeleteBtn && deleteModal) {
      confirmDeleteBtn.addEventListener("click", () => {
        if (linkIdToDelete !== null) {
          deleteLink(linkIdToDelete);
          showToast("Link successfully removed!", 2000);
          linkIdToDelete = null;
        }
        deleteModal.classList.remove("active");
      });
    }

    if (cancelDeleteBtn && deleteModal) {
      cancelDeleteBtn.addEventListener("click", () => {
        linkIdToDelete = null;
        deleteModal.classList.remove("active");
      });
    }

    // ===================================
    // LOGIKA BARU: SUBMIT EDIT LINK
    // ===================================
    if (editForm && editModal && editNameInput && editUrlInput) {
      editForm.addEventListener("submit", (e) => {
        e.preventDefault();

        if (linkIdToEdit !== null) {
          const newName = editNameInput.value.trim();
          let newUrl = editUrlInput.value.trim();

          if (!newName || !newUrl) {
            showToast("Name and URL are required!", 3000);
            return;
          }

          if (!newUrl.match(/^(f|ht)tps?:\/\//i)) {
            newUrl = "https://" + newUrl;
          }

          let links = getLinks();
          links = links.map((link) => {
            if (link.id === linkIdToEdit) {
              return { ...link, name: newName, url: newUrl };
            }
            return link;
          });

          saveLinks(links);
          showToast(`"${newName}" link updated successfully!`);

          linkIdToEdit = null;
          editModal.classList.remove("active");
          editForm.reset();
          editUrlInput.setAttribute("type", "date");
        }
      });
    }

    if (cancelEditBtn && editModal) {
      cancelEditBtn.addEventListener("click", () => {
        linkIdToEdit = null;
        editModal.classList.remove("active");
        editForm.reset();
        editUrlInput.setAttribute("type", "date");
      });
    }

    renderLinks();
  };

  homeSiteLogic();
});
