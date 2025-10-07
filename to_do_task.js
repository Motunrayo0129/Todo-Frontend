
document.addEventListener("DOMContentLoaded", function () {
  const taskForm = document.getElementById("taskForm");
  const taskList = document.getElementById("taskList");
  const openTaskFormBtn = document.getElementById("openTaskForm");
  const closeTaskFormBtn = document.getElementById("closeTaskForm");
  const taskModal = document.getElementById("taskModal");

  const USER_ID = localStorage.getItem("userId");
  const USERNAME = localStorage.getItem("username");
  const userNameSpan = document.getElementById("username");

  if (USERNAME) {
    userNameSpan.textContent = USERNAME;
  } else {
    userNameSpan.textContent = "Guest";
  }

  // Logout button
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "landing_page.html";
  });

  const API_BASE = "http://localhost:8080/api/tasks";

  if (!USER_ID) {
    alert("No user found. Please login again.");
    window.location.href = "login.html";
    return;
  }

  // Open & Close modal
  openTaskFormBtn.addEventListener("click", () => {
    taskModal.style.display = "block";
  });
  closeTaskFormBtn.addEventListener("click", () => {
    taskModal.style.display = "none";
  });

  // Fetch all tasks
  async function fetchTasks() {
    try {
      const response = await fetch(`${API_BASE}/allTask/${USER_ID}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");

      const tasks = await response.json();
      renderTasks(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      alert("Error fetching tasks. Please try again later.");
    }
  }

  // Render tasks
  function renderTasks(tasks) {
    taskList.innerHTML = "";

    if (!tasks || tasks.length === 0) {
      taskList.innerHTML =
        `<tr><td colspan="7" style="text-align:center;">No tasks yet.</td></tr>`;
      return;
    }

    tasks.forEach((task) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${task.title}</td>
        <td>${task.priority}</td>
        <td>${task.dateAdded || "N/A"}</td>
        <td>${task.dateCompleted || "N/A"}</td>
        <td>
          <td>
              <input type="checkbox" class="complete-checkbox" data-id="${task.taskId}" ${task.isCompleted ? "Completed" : "Pending"}>
            </td>
        <td class="actions">
        </td>
      `;

      // Status checkbox
      const checkbox = row.querySelector(".complete-checkbox");
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          markAsCompleted(task.id);
        }
      });

      // Actions column
      const actionsCell = row.querySelector(".actions");

      // Edit button
const editBtn = document.createElement("button");
editBtn.textContent = "Edit";

editBtn.onclick = () => editTask(task.taskId, task.title, task.priority);
actionsCell.appendChild(editBtn);


      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => deleteTask(task.taskId);
      actionsCell.appendChild(deleteBtn);

      taskList.appendChild(row);
    });
  }

  // Add new task
  taskForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const titleInput = document.getElementById("taskName");
    const priorityInput = document.getElementById("priority");

    const title = titleInput.value.trim();
    const priority = priorityInput.value;

    if (!title || !priority) {
      alert("Please enter a task name and select a priority.");
      return;
    }

    let addTaskRequest = {
      title,
      priority: priority.toUpperCase(),
      dateAdded: Date.now(),
      userId: USER_ID
    };

    try {
      const response = await fetch(`${API_BASE}/addTask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addTaskRequest)
      });

      if (!response.ok) throw new Error("Failed to save task");

      await response.json();
      taskForm.reset();
      taskModal.style.display = "none";
      fetchTasks();
    } catch (error) {
      console.error(error.message);
      alert("Error saving task. Please try again later.");
    }
  });

async function markAsCompleted(taskId) {
  try {
    const response = await fetch(`${API_BASE}/markAsCompleted/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to update task");
    console.log(response)
    fetchTasks(); 
  } catch (error) {
    console.error("Error marking task as completed:", error);
    alert("Error updating task.");
  }
}


async function editTask(taskId, oldTitle, oldPriority) {
  const newTitle = prompt("Edit your task title:", oldTitle);
  const newPriority = prompt("Edit task priority (LOW, MEDIUM, HIGH):", oldPriority);

  if (!newTitle || !newPriority) return;

  const body = { title: newTitle, priority: newPriority.toUpperCase() };
  const url = `${API_BASE}/editTask/${taskId}`;

  console.log("Sending update:", body);
  console.log("PUT URL:", url);

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    await response.json();
    alert("Task updated!");
    fetchTasks();
  } catch (error) {
    console.error("Error updating task:", error);
  }
}


// Delete task
  async function deleteTask(taskId) {
    try {
      const response = await fetch(`${API_BASE}/deleteTask/${taskId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to delete task");
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Error deleting task.");
    }
  }


  fetchTasks();
});
