import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [title, setTitle] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!title.trim()) return;

    const newTask = {
      id: Date.now(),
      title: title.trim(),
      status: "todo",
    };

    setTasks([...tasks, newTask]);
    setTitle("");
  };

  const moveTask = (id, status) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );
  };

  const confirmDelete = () => {
    setTasks(
      tasks.filter(
        (task) => task.id !== taskToDelete.id
      )
    );

    setShowConfirm(false);
    setTaskToDelete(null);
  };

  const renderTasks = (status) => {
    return tasks
      .filter((task) => task.status === status)
      .map((task) => (
        <div className="card" key={task.id}>
          <p>{task.title}</p>

          <div className="actions">
            {status === "todo" && (
              <button
                className="move-btn"
                onClick={() =>
                  moveTask(task.id, "inprogress")
                }
              >
                Move →
              </button>
            )}

            {status === "inprogress" && (
              <button
                className="move-btn"
                onClick={() =>
                  moveTask(task.id, "completed")
                }
              >
                Complete ✓
              </button>
            )}

            {status === "completed" && (
              <button
                className="move-btn"
                onClick={() =>
                  moveTask(task.id, "todo")
                }
              >
                Restart ↺
              </button>
            )}

            <button
              className="delete-btn"
              onClick={() => {
                setTaskToDelete(task);
                setShowConfirm(true);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ));
  };

  return (
    <div className="container">
      <h1>Task Kanban Tracker</h1>

      <div className="task-form">
        <input
          type="text"
          placeholder="Enter a new task..."
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          onKeyDown={(e) =>
            e.key === "Enter" && addTask()
          }
        />

        <button onClick={addTask}>
          Add Task
        </button>
      </div>

      <div className="board">
        <div className="column todo">
          <h2>📝 Todo</h2>
          <div className="task-count">
            {
              tasks.filter(
                (task) => task.status === "todo"
              ).length
            }{" "}
            Tasks
          </div>
          {renderTasks("todo")}
        </div>

        <div className="column progress">
          <h2>🚀 In Progress</h2>
          <div className="task-count">
            {
              tasks.filter(
                (task) =>
                  task.status === "inprogress"
              ).length
            }{" "}
            Tasks
          </div>
          {renderTasks("inprogress")}
        </div>

        <div className="column completed">
          <h2>✅ Completed</h2>
          <div className="task-count">
            {
              tasks.filter(
                (task) =>
                  task.status === "completed"
              ).length
            }{" "}
            Tasks
          </div>
          {renderTasks("completed")}
        </div>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Task</h3>

            <p>
              Are you sure you want to delete
              <strong>
                {" "}
                "{taskToDelete?.title}"
              </strong>
              ?
            </p>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowConfirm(false);
                  setTaskToDelete(null);
                }}
              >
                Cancel
              </button>

              <button
                className="confirm-btn"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;