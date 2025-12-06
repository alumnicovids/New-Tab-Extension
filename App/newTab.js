const DOMElements = {
  navLinks: document.querySelectorAll(".navigation-bar a"),
  views: document.querySelectorAll(".home-site, .todo-site, .calendar-site"),

  clock: document.getElementById("clock"),
  greeting: document.getElementById("greeting"),
  homeSearchInput: document.getElementById("home-search-input"),

  linkList: document.querySelector(".link-list"),
  addLinkBtn: document.getElementById("add-link-btn"),
  modalOverlay: document.getElementById("modal-overlay"),
  linkModal: document.querySelector(".link-modal"),
  addLinkForm: document.getElementById("add-link-form"),
  linkNameInput: document.getElementById("link-name-input"),
  linkUrlInput: document.getElementById("link-url-input"),
  saveLinkBtn: document.getElementById("save-link-btn"),
  cancelLinkBtn: document.getElementById("cancel-link-btn"),

  themesToggleBtn: document.getElementById("themes-toggle-btn"),
  settingsPanel: document.querySelector(".settings-panel"),
  colorDominant: document.getElementById("color-dominant"),
  colorSecondary: document.getElementById("color-secondary"),
  colorAccent: document.getElementById("color-accent"),
  saveColorsBtn: document.getElementById("save-colors-btn"),

  todoForm: document.getElementById("todo-form"),
  todoInput: document.getElementById("todo-input"),
  dueDateInput: document.getElementById("due-date-input"),
  todoList: document.getElementById("todo-list"),
  statTotal: document.getElementById("stat-total"),
  statCompleted: document.getElementById("stat-completed"),
  statActive: document.getElementById("stat-active"),
  taskSearchInput: document.getElementById("task-search-input"),
  filterButtons: document.querySelectorAll("#todo-filters button"),
  sortButton: document.getElementById("sort-by-due-date"),
  errorMessage: document.getElementById("error-message"),

  editModal: document.getElementById("edit-modal"),
  editForm: document.getElementById("edit-form"),
  editTaskInput: document.getElementById("edit-task-input"),
  editDateInput: document.getElementById("edit-date-input"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),

  deleteModal: document.getElementById("delete-modal"),
  confirmDeleteBtn: document.getElementById("confirm-delete-btn"),
  cancelDeleteBtn: document.getElementById("cancel-delete-btn"),

  customAlertModal: document.getElementById("custom-alert-modal"),
  modalMessage: document.getElementById("modal-message"),
};

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let links = JSON.parse(localStorage.getItem("links")) || [];
let currentFilter = "all";
let editTaskId = null;

const showToast = (message) => {
  DOMElements.modalMessage.textContent = message;
  DOMElements.customAlertModal.classList.add("active");
  setTimeout(() => {
    DOMElements.customAlertModal.classList.remove("active");
  }, 3000);
};

const switchView = (e) => {
  e.preventDefault();
  const targetId = e.currentTarget.getAttribute("href").substring(1);

  DOMElements.views.forEach((view) => {
    view.classList.remove("active");
  });

  DOMElements.navLinks.forEach((link) => {
    link.classList.remove("active");
  });

  const targetView = document.getElementById(targetId);

  if (targetView) {
    targetView.classList.add("active");
  }

  e.currentTarget.classList.add("active");
};

DOMElements.navLinks.forEach((link) => {
  link.addEventListener("click", switchView);
});

const updateClockAndGreeting = () => {
  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  DOMElements.clock.textContent = timeString;

  const hour = now.getHours();
  let greetingText = "";
  let emoji = "";

  if (hour < 10) {
    greetingText = "Good Morning!";
    emoji = "🌅";
  } else if (hour < 17) {
    greetingText = "Good Afternoon!";
    emoji = "☀️";
  } else if (hour < 20) {
    greetingText = "Good Evening!";
    emoji = "🌇";
  } else {
    greetingText = "Good Night!";
    emoji = "🦉";
  }

  DOMElements.greeting.textContent = `${greetingText} ${emoji}`;
};

setInterval(updateClockAndGreeting, 1000);
updateClockAndGreeting();

const getDragAfterElement = (container, y) => {
  const draggableElements = [
    ...container.querySelectorAll(".link-item:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
};

DOMElements.homeSearchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = DOMElements.homeSearchInput.value.trim();
    if (!query) return;

    let url;
    if (query.startsWith("http://") || query.startsWith("https://://")) {
      url = query;
    } else {
      url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }

    window.location.href = url;
  }
});

const saveLinks = () => {
  localStorage.setItem("links", JSON.stringify(links));
};

const renderLinks = () => {
  DOMElements.linkList.innerHTML = "";

  links.forEach((link, index) => {
    const li = document.createElement("li");
    li.className = "link-item";
    li.draggable = true;
    li.dataset.index = index;

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${link.url}&sz=32`;

    li.innerHTML = `
      <img src="${faviconUrl}" alt="favicon" class="link-favicon" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><text y=\\'.9em\\' font-size=\\'90\\'>🔗</text></svg>'">
      <a href="${link.url}" target="_blank" title="${link.name}">${link.name}</a>
      <div class="link-actions">
        <button class="edit-link-btn" data-index="${index}">✏️</button>
        <button class="delete-link-btn" data-index="${index}">❌</button>
      </div>
    `;

    DOMElements.linkList.appendChild(li);
  });
};

const openLinkModal = () => {
  DOMElements.modalOverlay.classList.add("active");
};

const closeLinkModal = () => {
  DOMElements.modalOverlay.classList.remove("active");
  DOMElements.addLinkForm.reset();
};

DOMElements.addLinkBtn.addEventListener("click", openLinkModal);
DOMElements.cancelLinkBtn.addEventListener("click", closeLinkModal);

DOMElements.addLinkForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = DOMElements.linkNameInput.value.trim();
  const url = DOMElements.linkUrlInput.value.trim();

  if (name && url) {
    links.push({ name, url });
    saveLinks();
    renderLinks();
    closeLinkModal();
    showToast(`Link "${name}" added!`);
  }
});

DOMElements.linkList.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-link-btn")) {
    const index = parseInt(e.target.dataset.index);
    const linkName = links[index].name;

    links.splice(index, 1);
    saveLinks();
    renderLinks();
    showToast(`Link "${linkName}" deleted!`);
  }
});

renderLinks();

let draggedItem = null;

DOMElements.linkList.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("link-item")) {
    draggedItem = e.target;
    e.target.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  }
});

DOMElements.linkList.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (!draggedItem) return;

  const afterElement = getDragAfterElement(DOMElements.linkList, e.clientY);
  const currentItem = e.target.closest(".link-item");

  DOMElements.linkList.querySelectorAll(".link-item").forEach((item) => {
    item.classList.remove("before", "after");
  });

  if (afterElement == null) {
    if (currentItem && currentItem !== draggedItem) {
      currentItem.classList.add("after");
    }
  } else {
    if (currentItem && currentItem !== draggedItem) {
      currentItem.classList.add("before");
    }
  }
});

DOMElements.linkList.addEventListener("drop", (e) => {
  e.preventDefault();
  if (!draggedItem) return;

  const afterElement = getDragAfterElement(DOMElements.linkList, e.clientY);

  if (draggedItem !== afterElement) {
    let fromIndex = parseInt(draggedItem.dataset.index);

    const [movedLink] = links.splice(fromIndex, 1);

    if (afterElement == null) {
      links.push(movedLink);
    } else {
      let afterIndex = parseInt(afterElement.dataset.index);
      let toIndex;

      if (afterElement.classList.contains("after")) {
        toIndex =
          links.findIndex(
            (link) => link.name === afterElement.querySelector("a").title
          ) + 1;
      } else {
        toIndex = links.findIndex(
          (link) => link.name === afterElement.querySelector("a").title
        );
      }

      if (toIndex === -1) {
        toIndex = afterElement.classList.contains("after") ? links.length : 0;
      }

      links.splice(toIndex, 0, movedLink);
    }

    saveLinks();
    renderLinks();
    showToast("Link reordered!");
  }

  DOMElements.linkList.querySelectorAll(".link-item").forEach((item) => {
    item.classList.remove("dragging", "before", "after");
  });
  draggedItem = null;
});

DOMElements.linkList.addEventListener("dragend", (e) => {
  e.target.classList.remove("dragging");
  DOMElements.linkList.querySelectorAll(".link-item").forEach((item) => {
    item.classList.remove("before", "after");
  });
});

const saveTodos = () => {
  localStorage.setItem("todos", JSON.stringify(todos));
  updateStats();
};

const updateStats = () => {
  const total = todos.length;
  const completed = todos.filter((todo) => todo.completed).length;
  const active = total - completed;

  DOMElements.statTotal.textContent = total;
  DOMElements.statCompleted.textContent = completed;
  DOMElements.statActive.textContent = active;
};

const renderTodos = () => {
  DOMElements.todoList.innerHTML = "";

  let filteredAndSortedTodos = todos.filter((todo) => {
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  });

  const search = DOMElements.taskSearchInput.value.toLowerCase();
  if (search) {
    filteredAndSortedTodos = filteredAndSortedTodos.filter(
      (todo) =>
        todo.text.toLowerCase().includes(search) ||
        (todo.dueDate && todo.dueDate.includes(search))
    );
  }

  const sortOrder = DOMElements.sortButton.dataset.sortOrder;
  if (sortOrder === "asc") {
    filteredAndSortedTodos.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  } else if (sortOrder === "desc") {
    filteredAndSortedTodos.sort((a, b) => {
      if (!a.dueDate) return -1;
      if (!b.dueDate) return 1;
      return new Date(b.dueDate) - new Date(a.dueDate);
    });
  }

  filteredAndSortedTodos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;
    li.dataset.id = todo.id;

    let dateText = "-";
    if (todo.dueDate) {
      try {
        dateText = new Date(todo.dueDate).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      } catch (error) {
        dateText = todo.dueDate;
      }
    }

    li.innerHTML = `
      <div class="task-info">
        <input type="checkbox" data-id="${todo.id}" ${
      todo.completed ? "checked" : ""
    } />
        <span class="task-name">${todo.text}</span>
      </div>
      <span class="task-date">${dateText}</span>
      <div class="todo-actions">
        <button class="edit-todo-btn" data-id="${todo.id}">✏️</button>
        <button class="delete-todo-btn" data-id="${todo.id}">🗑️</button>
      </div>
    `;

    DOMElements.todoList.appendChild(li);
  });

  updateStats();
};

DOMElements.todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = DOMElements.todoInput.value.trim();
  const dueDate = DOMElements.dueDateInput.value;

  if (!text) {
    DOMElements.errorMessage.textContent = "Task name cannot be empty.";
    return;
  }

  DOMElements.errorMessage.textContent = "";

  const newTodo = {
    id: Date.now(),
    text,
    dueDate,
    completed: false,
  };

  todos.push(newTodo);
  saveTodos();
  renderTodos();
  DOMElements.todoForm.reset();
  showToast("Task added successfully!");
});

DOMElements.todoList.addEventListener("click", (e) => {
  const id = parseInt(e.target.dataset.id);

  if (e.target.type === "checkbox") {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = e.target.checked;
      saveTodos();
      renderTodos();
    }
  }

  if (e.target.classList.contains("edit-todo-btn")) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      editTaskId = id;
      DOMElements.editTaskInput.value = todo.text;
      DOMElements.editDateInput.value = todo.dueDate;
      DOMElements.editModal.classList.add("active");
    }
  }

  if (e.target.classList.contains("delete-todo-btn")) {
    editTaskId = id;
    DOMElements.deleteModal.classList.add("active");
  }
});

DOMElements.cancelEditBtn.addEventListener("click", () => {
  DOMElements.editModal.classList.remove("active");
});

DOMElements.editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newText = DOMElements.editTaskInput.value.trim();
  const newDate = DOMElements.editDateInput.value;

  if (!newText) {
    alert("Task name cannot be empty.");
    return;
  }

  const todoIndex = todos.findIndex((t) => t.id === editTaskId);
  if (todoIndex > -1) {
    todos[todoIndex].text = newText;
    todos[todoIndex].dueDate = newDate;
    saveTodos();
    renderTodos();
    DOMElements.editModal.classList.remove("active");
    showToast("Task updated!");
  }
  editTaskId = null;
});

DOMElements.cancelDeleteBtn.addEventListener("click", () => {
  DOMElements.deleteModal.classList.remove("active");
  editTaskId = null;
});

DOMElements.confirmDeleteBtn.addEventListener("click", () => {
  if (editTaskId !== null) {
    todos = todos.filter((t) => t.id !== editTaskId);
    saveTodos();
    renderTodos();
    DOMElements.deleteModal.classList.remove("active");
    showToast("Task deleted permanently.");
  }
  editTaskId = null;
});

DOMElements.filterButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    currentFilter = e.target.dataset.filters;

    DOMElements.filterButtons.forEach((btn) =>
      btn.classList.remove("active-filter")
    );
    e.target.classList.add("active-filter");

    renderTodos();
  });
});

DOMElements.sortButton.addEventListener("click", (e) => {
  const currentOrder = e.target.dataset.sortOrder;
  const newOrder = currentOrder === "asc" ? "desc" : "asc";

  e.target.dataset.sortOrder = newOrder;
  e.target.textContent = `Sort Deadline ${newOrder === "asc" ? "⬆️" : "⬇️"}`;

  renderTodos();
});

DOMElements.taskSearchInput.addEventListener("input", renderTodos);

renderTodos();
if (DOMElements.filterButtons.length > 0) {
  DOMElements.filterButtons[0].classList.add("active-filter");
}

const defaultColors = {
  dominant: "#eee7ce",
  secondary: "#40826d",
  accent: "#40826d",
};

const loadTheme = () => {
  const savedColors = JSON.parse(localStorage.getItem("themeColors"));
  const colors = savedColors || defaultColors;

  document.documentElement.style.setProperty(
    "--dominant-color",
    colors.dominant
  );
  document.documentElement.style.setProperty(
    "--secondary-color",
    colors.secondary
  );
  document.documentElement.style.setProperty("--accent-color", colors.accent);

  if (DOMElements.colorDominant)
    DOMElements.colorDominant.value = colors.dominant;
  if (DOMElements.colorSecondary)
    DOMElements.colorSecondary.value = colors.secondary;
  if (DOMElements.colorAccent) DOMElements.colorAccent.value = colors.accent;
};

const openSettings = () => {
  document.body.classList.toggle("settings-active");
  DOMElements.settingsPanel.classList.toggle("open");
};

const saveTheme = () => {
  const newColors = {
    dominant: DOMElements.colorDominant.value,
    secondary: DOMElements.colorSecondary.value,
    accent: DOMElements.colorAccent.value,
  };

  localStorage.setItem("themeColors", JSON.stringify(newColors));
  loadTheme();
  showToast("Theme colors saved!");
};

if (DOMElements.themesToggleBtn)
  DOMElements.themesToggleBtn.addEventListener("click", openSettings);
if (DOMElements.saveColorsBtn)
  DOMElements.saveColorsBtn.addEventListener("click", saveTheme);

[
  DOMElements.colorDominant,
  DOMElements.colorSecondary,
  DOMElements.colorAccent,
].forEach((input) => {
  if (input) {
    input.addEventListener("input", (e) => {
      const cssVar = `--${e.target.id.replace("color-", "")}-color`;
      document.documentElement.style.setProperty(cssVar, e.target.value);
    });
  }
});

loadTheme();

const initialLink = document.querySelector(
  '.navigation-bar a[href="#home-site"]'
);
if (initialLink) {
  initialLink.classList.add("active");
}
const initialView = document.getElementById("home-site");
if (initialView) {
  initialView.classList.add("active");
}
