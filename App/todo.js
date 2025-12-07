(function () {
  const STORAGE_KEY = "todoItems";
  const todoListElement = document.getElementById("todo-list");
  const todoForm = document.getElementById("todo-form");
  const todoInput = document.getElementById("todo-input");
  const dueDateInput = document.getElementById("due-date-input");
  const errorMessage = document.getElementById("error-message");
  const statTotal = document.getElementById("stat-total");
  const statCompleted = document.getElementById("stat-completed");
  const statActive = document.getElementById("stat-active");

  const filterActiveBtn = document.getElementById("btn-filter-active");
  const filterCompletedBtn = document.getElementById("btn-filter-completed");
  const sortByDateBtn = document.getElementById("sort-by-due-date");
  const todoSearchInput = document.getElementById("todo-search-input");

  const deleteModal = document.getElementById("delete-modal");
  const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
  const cancelDeleteBtn = document.getElementById("cancel-delete-btn");

  const editModal = document.getElementById("edit-modal");
  const editForm = document.getElementById("edit-form");
  const editTaskInput = document.getElementById("edit-task-input");
  const editDateInput = document.getElementById("edit-date-input");
  const saveEditBtn = document.getElementById("save-edit-btn");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");

  const toastModal = document.getElementById("custom-alert-modal");
  const modalMessage = document.getElementById("modal-message");
  const filterAllBtn = document.getElementById("btn-filter-all");

  let currentDeleteId = null;
  let currentEditId = null;

  let todos = [];
  let filter = "all";
  let sortOrder = "asc";
  let searchQuery = "";

  function showToast(message, duration = 2000) {
    if (!toastModal || !modalMessage) return;
    modalMessage.textContent = message;
    toastModal.classList.add("active");
    setTimeout(() => {
      toastModal.classList.remove("active");
    }, duration);
  }

  function saveTodos(newTodos) {
    todos = newTodos;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
    renderTodos();
    updateStats();
  }

  function loadTodos() {
    const t = localStorage.getItem(STORAGE_KEY);
    todos = t ? JSON.parse(t) : [];
  }

  function getTodos() {
    return todos;
  }

  function getFilteredTodos() {
    let currentTodos = getTodos();

    let filtered = [...currentTodos];

    if (filter === "active") {
      filtered = filtered.filter((todo) => !todo.completed);
    } else if (filter === "completed") {
      filtered = filtered.filter((todo) => todo.completed);
    }

    if (searchQuery.trim() !== "") {
      const lowerSearch = searchQuery.toLowerCase();
      filtered = filtered.filter((todo) => {
        let nameMatch = todo.text.toLowerCase().includes(lowerSearch);

        let dateMatch = todo.dueDate && todo.dueDate.includes(lowerSearch);
        let formattedDateMatch =
          todo.dueDate &&
          todo.dueDate.split("-").reverse().join("-").includes(lowerSearch);

        return nameMatch || dateMatch || formattedDateMatch;
      });
    }

    if (sortOrder === "asc") {
      filtered.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate > b.dueDate ? 1 : -1;
      });
    } else if (sortOrder === "desc") {
      filtered.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate < b.dueDate ? 1 : -1;
      });
    }

    return filtered;
  }

  function addTodo(text, dueDate) {
    if (!text || typeof text !== "string") return;

    const lowerText = text.toLowerCase();
    const isDuplicate = todos.some(
      (todo) => todo.text.toLowerCase() === lowerText
    );

    if (isDuplicate) {
      showToast("A task with that name already exists. ⚠️", 2500);
      return;
    }

    todos.push({
      id: Date.now(),
      text,
      completed: false,
      dueDate: dueDate || "",
    });
    saveTodos(todos);
    showToast("Task added successfully! ✅");
  }

  function deleteTodo(id) {
    todos = todos.filter((todo) => todo.id !== id);
    saveTodos(todos);
    showToast("Task deleted! 🗑️");
  }

  function editTodo(id, newText, newDueDate) {
    const lowerNewText = newText.toLowerCase();
    const isDuplicate = todos.some(
      (todo) => todo.id !== id && todo.text.toLowerCase() === lowerNewText
    );

    if (isDuplicate) {
      showToast("Another task with that name already exists.⚠️", 2500);
      return;
    }

    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, text: newText, dueDate: newDueDate } : todo
    );
    saveTodos(todos);
    showToast("Task updated! 💾");
  }

  function toggleTodo(id) {
    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(todos);
  }

  function renderTodos() {
    if (!todoListElement) return;
    todoListElement.innerHTML = "";

    const filteredTodos = getFilteredTodos();

    if (filteredTodos.length === 0) {
      todoListElement.innerHTML =
        '<li style="opacity:0.6;text-align:center;">No task yet!</li>';
      return;
    }

    filteredTodos.forEach((todo) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (todo.completed ? " completed" : "");

      const infoContainer = document.createElement("div");
      infoContainer.className = "todo-item-info";

      const taskNameSpan = document.createElement("span");
      taskNameSpan.className = "task-name";
      taskNameSpan.textContent = todo.text;
      infoContainer.appendChild(taskNameSpan);

      if (todo.dueDate) {
        const dateSpan = document.createElement("span");
        dateSpan.className = "due-date";
        const formattedDate = todo.dueDate.split("-").reverse().join("-");
        dateSpan.textContent = "Deadline: " + formattedDate;
        infoContainer.appendChild(dateSpan);
      }

      const actionsContainer = document.createElement("div");
      actionsContainer.className = "todo-actions";

      const doneBtn = document.createElement("button");
      doneBtn.className = "complete-btn";
      doneBtn.textContent = todo.completed ? "🔄" : "✅";
      doneBtn.title = todo.completed ? "Mark as not done" : "Mark as done";
      doneBtn.onclick = () => toggleTodo(todo.id);

      const editBtn = document.createElement("button");
      editBtn.className = "edit-btn";
      editBtn.textContent = "✏️";
      editBtn.title = "Edit";
      editBtn.onclick = () => openEditModal(todo);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "🗑️";
      deleteBtn.title = "Delete";
      deleteBtn.onclick = () => openDeleteModal(todo);

      actionsContainer.append(doneBtn, editBtn, deleteBtn);

      li.append(infoContainer, actionsContainer);

      todoListElement.appendChild(li);
    });
  }

  function updateStats() {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    if (statTotal) statTotal.textContent = total;
    if (statCompleted) statCompleted.textContent = completed;
    if (statActive) statActive.textContent = active;
  }

  function openDeleteModal(todo) {
    currentDeleteId = todo.id;
    if (deleteModal) deleteModal.classList.add("active");
  }
  function closeDeleteModal() {
    currentDeleteId = null;
    if (deleteModal) deleteModal.classList.remove("active");
  }
  function openEditModal(todo) {
    currentEditId = todo.id;
    if (editModal && editTaskInput && editDateInput) {
      editTaskInput.value = todo.text;
      editDateInput.value = todo.dueDate || "";
      editModal.classList.add("active");
    }
  }
  function closeEditModal() {
    currentEditId = null;
    if (editModal) editModal.classList.remove("active");
    if (editForm) editForm.reset();
  }

  function setFilter(filterType) {
    let newFilter = filterType;

    if (filter === filterType && filterType !== "all") {
      newFilter = "all";
    }

    filter = newFilter;

    const filterButtons = [
      filterAllBtn,
      filterActiveBtn,
      filterCompletedBtn,
    ].filter((btn) => btn !== null);

    filterButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    if (filter === "active" && filterActiveBtn) {
      filterActiveBtn.classList.add("active");
    } else if (filter === "completed" && filterCompletedBtn) {
      filterCompletedBtn.classList.add("active");
    } else if (filterAllBtn) {
      filterAllBtn.classList.add("active");
    }

    renderTodos();
  }

  if (filterAllBtn)
    filterAllBtn.addEventListener("click", () => setFilter("all"));
  if (filterActiveBtn)
    filterActiveBtn.addEventListener("click", () => setFilter("active"));
  if (filterCompletedBtn)
    filterCompletedBtn.addEventListener("click", () => setFilter("completed"));

  if (sortByDateBtn)
    sortByDateBtn.addEventListener("click", () => {
      sortOrder = sortOrder === "asc" ? "desc" : "asc";
      sortByDateBtn.textContent =
        sortOrder === "asc" ? "Sort By Date ⬇️" : "Sort By Date ⬆️";
      renderTodos();
    });

  if (todoSearchInput)
    todoSearchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderTodos();
    });

  if (todoForm)
    todoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = todoInput.value.trim();
      const dueDate = dueDateInput.value;
      if (!text) {
        if (errorMessage) errorMessage.textContent = "Nama task wajib diisi!";
        return;
      }
      addTodo(text, dueDate);
      todoForm.reset();
      if (errorMessage) errorMessage.textContent = "";
    });

  if (confirmDeleteBtn)
    confirmDeleteBtn.addEventListener("click", () => {
      if (currentDeleteId != null) {
        deleteTodo(currentDeleteId);
        closeDeleteModal();
      }
    });
  if (cancelDeleteBtn)
    cancelDeleteBtn.addEventListener("click", closeDeleteModal);

  if (editForm)
    editForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (currentEditId != null) {
        const newText = editTaskInput.value.trim();
        const newDueDate = editDateInput.value;
        if (!newText) {
          showToast("Task name wajib diisi!", 1800);
          return;
        }
        editTodo(currentEditId, newText, newDueDate);
        closeEditModal();
      }
    });
  if (cancelEditBtn) cancelEditBtn.addEventListener("click", closeEditModal);

  document.addEventListener("DOMContentLoaded", () => {
    loadTodos();
    setFilter(filter);
    updateStats();
    if (sortByDateBtn) {
      sortByDateBtn.textContent =
        sortOrder === "asc" ? "Sort By Date ⬇️" : "Sort By Date ⬆️";
    }
  });
})();
