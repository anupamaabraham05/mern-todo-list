
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [filter, setFilter] = useState("all");

  // Fetch tasks from the backend
  async function loadTasks() {
    try {
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load tasks.");
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(
        "Could not connect to the backend. Make sure your server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  // Add a new task
  async function addTask(e) {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a task.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: title.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add task.");
      }

      setTasks((previous) => [data, ...previous]);
      setTitle("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  // Complete or uncomplete a task
  async function toggleTask(task) {
    try {
      const response = await fetch(`${API_URL}/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      const updatedTask = await response.json();

      if (!response.ok) {
        throw new Error(updatedTask.message || "Update failed.");
      }

      setTasks((previous) =>
        previous.map((item) =>
          item._id === updatedTask._id ? updatedTask : item
        )
      );

      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  // Save edited task
  async function saveEdit(id) {
    if (!editTitle.trim()) {
      setError("Task title cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle.trim(),
        }),
      });

      const updatedTask = await response.json();

      if (!response.ok) {
        throw new Error(updatedTask.message || "Edit failed.");
      }

      setTasks((previous) =>
        previous.map((task) =>
          task._id === id ? updatedTask : task
        )
      );

      setEditingId(null);
      setEditTitle("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  // Delete a task
  async function deleteTask(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed.");
      }

      setTasks((previous) =>
        previous.filter((task) => task._id !== id)
      );

      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  // Task counts
  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingCount = tasks.length - completedCount;

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  return (
    <main className="app">
      <section className="todo-card">
        <p className="eyebrow">YOUR PERSONAL PLANNER</p>

        <h1>
          My To-Do List <span>✓</span>
        </h1>

        <p className="subtitle">
          Small steps make big progress.
        </p>

        {/* Add task form */}
        <form className="add-form" onSubmit={addTask}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you need to do?"
            aria-label="New task title"
          />

          <button type="submit">Add Task</button>
        </form>

        {error && <p className="error">{error}</p>}

        {/* Task summary */}
        <div className="task-summary">
          <strong>{tasks.length} tasks</strong>
          <span>{completedCount} completed</span>
          <span>{pendingCount} pending</span>
        </div>

        {/* Filter buttons */}
        <div className="filter-buttons">
          <button
            type="button"
            className={filter === "all" ? "active" : "secondary"}
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            type="button"
            className={filter === "pending" ? "active" : "secondary"}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>

          <button
            type="button"
            className={filter === "completed" ? "active" : "secondary"}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>

        {/* Task list */}
        {loading ? (
          <p className="empty">Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <p className="empty">
            {tasks.length === 0
              ? "No tasks yet. Add your first task above!"
              : "No tasks in this category."}
          </p>
        ) : (
          <ul className="task-list">
            {filteredTasks.map((task) => (
              <li className="task" key={task._id}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task)}
                  aria-label={`Complete ${task.title}`}
                />

                {editingId === task._id ? (
                  <form
                    className="edit-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveEdit(task._id);
                    }}
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) =>
                        setEditTitle(e.target.value)
                      }
                      autoFocus
                    />

                    <button type="submit">Save</button>

                    <button
                      type="button"
                      className="secondary"
                      onClick={() => {
                        setEditingId(null);
                        setEditTitle("");
                        setError("");
                      }}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <span
                      className={
                        task.completed
                          ? "task-title completed"
                          : "task-title"
                      }
                    >
                      {task.title}
                    </span>

                    <button
                      type="button"
                      className="secondary"
                      onClick={() => {
                        setEditingId(task._id);
                        setEditTitle(task.title);
                        setError("");
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete"
                      onClick={() => deleteTask(task._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        <footer>
          Your tasks are saved in MongoDB.
        </footer>
      </section>
    </main>
  );
}

export default App;
