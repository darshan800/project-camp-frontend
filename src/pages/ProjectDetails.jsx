import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "../components/ConfirmModal";

function ProjectDetails() {
  const { user, isDark } = useAuth();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", assignedTo: "" });
  const [creating, setCreating] = useState(false);
  const [members, setMembers] = useState([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [memberRole, setMemberRole] = useState("member");
  const [notes, setNotes] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState({ content: "" });
  const [creatingNote, setCreatingNote] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, message: "", onConfirm: null });

  useEffect(() => {
    fetchProjectDetails();
    fetchTasks();
    fetchMembers();
    fetchNotes();
  }, []);

  const fetchProjectDetails = async () => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      setProject(response.data.data);
    } catch (err) {
      console.error("Failed to fetch project details", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/${projectId}`);
      setTasks(response.data.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/projects/${projectId}/members`);
      setMembers(response.data.data);
    } catch (err) {
      console.error("Failed to fetch members", err);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await api.get(`/notes/${projectId}`);
      setNotes(response.data.data);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    }
  };

  const currentUserRole = members.find(
    (m) => m.user._id === user?._id
  )?.role;

  const handleCreateTask = async () => {
  if (!newTask.title.trim()) return;
  if (!newTask.assignedTo) return;

  console.log("assignedTo being sent:", newTask.assignedTo);

  setCreating(true);

  try {
    await api.post(`/tasks/${projectId}`, {
      ...newTask,
    });

    setShowTaskModal(false);

    setNewTask({
      title: "",
      description: "",
      assignedTo: "",
    });

    fetchTasks();
  } catch (err) {
    console.error("Failed to create task", err);
  } finally {
    setCreating(false);
  }
};

  const handleAddMember = async () => {
    if (!memberEmail.trim()) return;
    setAddingMember(true);
    try {
      await api.post(`/projects/${projectId}/members`, {
        email: memberEmail,
        role: memberRole,
      });
      setShowMemberModal(false);
      setMemberEmail("");
      fetchMembers();
    } catch (err) {
      console.error("Failed to add member", err);
    } finally {
      setAddingMember(false);
    }
  };

  const handleCreateNote = async () => {
    if (!newNote.content.trim()) return;
    setCreatingNote(true);
    try {
      await api.post(`/notes/${projectId}`, newNote);
      setShowNoteModal(false);
      setNewNote({ content: "" });
      fetchNotes();
    } catch (err) {
      console.error("Failed to create note", err);
    } finally {
      setCreatingNote(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${projectId}/t/${taskId}`, { status });
      fetchTasks();
    } catch (err) {
      console.error("Failed to update task status", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setConfirmModal({
      show: true,
      message: "This will permanently delete the task.",
      onConfirm: async () => {
        try {
          await api.delete(`/tasks/${projectId}/t/${taskId}`);
          fetchTasks();
        } catch (err) {
          console.error("Failed to delete task", err);
        } finally {
          setConfirmModal({ show: false, message: "", onConfirm: null });
        }
      },
    });
  };

  const handleDeleteNote = async (noteId) => {
    setConfirmModal({
      show: true,
      message: "This will permanently delete the note.",
      onConfirm: async () => {
        try {
          await api.delete(`/notes/${projectId}/n/${noteId}`);
          fetchNotes();
        } catch (err) {
          console.error("Failed to delete note", err);
        } finally {
          setConfirmModal({ show: false, message: "", onConfirm: null });
        }
      },
    });
  };

 const handleDeleteMember = async (userId) => {
  setConfirmModal({
    show: true,
    message: "Are you sure you want to remove this member?",
    onConfirm: async () => {
      try {
        console.log(`Deleting: /projects/${projectId}/members/${userId}`); // add this
        await api.delete(`/projects/${projectId}/members/${userId}`);
        fetchMembers();
      } catch (err) {
        console.error("Failed to remove member", err);
      } finally {
        setConfirmModal({ show: false, message: "", onConfirm: null });
      }
    },
  });
};
  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <p className={isDark ? "text-white" : "text-gray-900"}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-8 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Back button */}
      <button
        onClick={() => navigate("/projects")}
        className={`mb-6 flex items-center gap-2 transition-colors ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
      >
        ← Back to Projects
      </button>

      {/* Project Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          {project?.name}
        </h1>
        <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {project?.description}
        </p>
      </div>

      {/* Tabs */}
      <div className={`flex gap-4 border-b mb-6 ${isDark ? "border-gray-700" : "border-gray-200"}`}>
        {["tasks", "members", "notes"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 text-sm font-semibold capitalize transition-colors ${
              activeTab === tab
                ? `${isDark ? "text-white border-white" : "text-gray-900 border-gray-900"} border-b-2`
                : `${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>Tasks</h2>
            {(currentUserRole === "admin" || currentUserRole === "project_admin") && (
              <button
                onClick={() => setShowTaskModal(true)}
                className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                + Add Task
              </button>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-20">
              <p className={isDark ? "text-gray-400" : "text-gray-500"}>No tasks yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className={`rounded-lg p-4 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                        className={`text-xs border rounded-lg px-2 py-1 outline-none ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200 text-gray-900"}`}
                      >
                        <option value="todo">Todo</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                      {(currentUserRole === "admin" || currentUserRole === "project_admin") && (
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {task.description}
                  </p>
                  <span className={`text-xs mt-2 inline-block px-2 py-1 rounded-full ${
                    task.status === "done"
                      ? "bg-green-500/20 text-green-600"
                      : task.status === "in_progress"
                      ? "bg-yellow-500/20 text-yellow-600"
                      : "bg-gray-500/20 text-gray-500"
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>Members</h2>
            {currentUserRole === "admin" && (
              <button
                onClick={() => setShowMemberModal(true)}
                className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                + Add Member
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
                  {members.map((member) => (
        <div
          key={member.user._id}
          className={`rounded-lg p-4 border flex items-center justify-between ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
        >
          <div>
            <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {member.user.username}
            </p>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {member.user.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold uppercase px-3 py-1 rounded-full ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
              {member.role}
            </span>
            {currentUserRole === "admin" && member.user._id !== user?._id && (
              <button
                onClick={() => handleDeleteMember(member.user._id)}
                className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
          </div>
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === "notes" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>Notes</h2>
            {currentUserRole === "admin" && (
              <button
                onClick={() => setShowNoteModal(true)}
                className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                + Add Note
              </button>
            )}
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-20">
              <p className={isDark ? "text-gray-400" : "text-gray-500"}>No notes yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {notes.map((note) => (
                <div
                  key={note._id}
                  className={`rounded-lg p-4 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                >
                  <div className="flex items-start justify-between">
                    <p className={isDark ? "text-gray-200" : "text-gray-900"}>{note.content}</p>
                    {currentUserRole === "admin" && (
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors ml-4 shrink-0"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    By {note.createdBy?.username} • {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-full max-w-md shadow-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Create New Task
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={`text-sm font-medium mb-1 block ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                  className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-gray-900 text-sm ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-200 text-gray-900"}`}
                />
              </div>
              <div>
                <label className={`text-sm font-medium mb-1 block ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                  className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-gray-900 text-sm resize-none ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-200 text-gray-900"}`}
                />
              </div>
              <div>
  <label className={`text-sm font-medium mb-1 block ${isDark ? "text-gray-300" : "text-gray-700"}`}>
    Assign To
  </label>
  <select
    value={newTask.assignedTo}
    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
    className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-gray-900 text-sm ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200 text-gray-900"}`}
  >
    <option value="">Select a member</option>
    {members.map((member) => (
      <option key={member.user._id} value={member.user._id}>
        {member.user.username}
      </option>
    ))}
  </select>
</div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className={`flex-1 font-semibold py-2.5 rounded-lg transition-colors text-sm ${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={creating}
                  className="flex-1 bg-gray-900 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-full max-w-md shadow-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Add Member
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={`text-sm font-medium mb-1 block ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="Enter member email"
                  className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-gray-900 text-sm ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-200 text-gray-900"}`}
                />
              </div>
              <div>
                <label className={`text-sm font-medium mb-1 block ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Role
                </label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-gray-900 text-sm ${isDark ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200 text-gray-900"}`}
                >
                  <option value="member">Member</option>
                  <option value="project_admin">Project Admin</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMemberModal(false)}
                  className={`flex-1 font-semibold py-2.5 rounded-lg transition-colors text-sm ${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={addingMember}
                  className="flex-1 bg-gray-900 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  {addingMember ? "Adding..." : "Add Member"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 w-full max-w-md shadow-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Create Note
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={`text-sm font-medium mb-1 block ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Content
                </label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Write your note here..."
                  rows={4}
                  className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-gray-900 text-sm resize-none ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-200 text-gray-900"}`}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNoteModal(false)}
                  className={`flex-1 font-semibold py-2.5 rounded-lg transition-colors text-sm ${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNote}
                  disabled={creatingNote}
                  className="flex-1 bg-gray-900 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  {creatingNote ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.show && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal({ show: false, message: "", onConfirm: null })}
        />
      )}
    </div>
  );
}

export default ProjectDetails;