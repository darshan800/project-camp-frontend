import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function ProjectDetails() {
   const { user } = useAuth();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");
  



  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [creating, setCreating] = useState(false);
  

  const [members, setMembers] = useState([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  const [memberRole, setMemberRole] = useState("member");

  useEffect(() => {
    fetchProjectDetails();
    fetchTasks();
    fetchMembers();
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
    console.log(response.data.data);
    setMembers(response.data.data);
  } catch (err) {
    console.error("Failed to fetch members", err);
  }
};

    // get current user's role in this project
  const currentUserRole = members.find(
    (m) => m.user._id === user?._id
  )?.role;

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    setCreating(true);
    try {
      await api.post(`/tasks/${projectId}`, {
        ...newTask,
        assignedTo: user._id,  // assign to current logged in user
      });
      setShowTaskModal(false);
      setNewTask({ title: "", description: "" });
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
      role: memberRole  // add default role
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-900">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Back button */}
      <button
        onClick={() => navigate("/projects")}
        className="text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-2 transition-colors"
      >
        ← Back to Projects
      </button>

      {/* Project Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 text-3xl font-bold">{project?.name}</h1>
        <p className="text-gray-500 mt-2">{project?.description}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        {["tasks", "members", "notes"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 text-sm font-semibold capitalize transition-colors ${
              activeTab === tab
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-900"
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
            <h2 className="text-gray-900 font-semibold text-lg">Tasks</h2>
                      {currentUserRole === "admin" || currentUserRole === "project_admin" ? (
            <button
              onClick={() => setShowTaskModal(true)}
              className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              + Add Task
            </button>
          ) : null}
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">No tasks yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-white rounded-lg p-4 border border-gray-200"
                >
                  <h3 className="text-gray-900 font-semibold">{task.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{task.description}</p>
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
            <h2 className="text-gray-900 font-semibold text-lg">Members</h2>
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
                className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between"
              >
                <div>
                  <p className="text-gray-900 font-semibold">{member.user.username}</p>
                  <p className="text-gray-500 text-sm">{member.user.email}</p>
                </div>
                <span className="text-xs font-semibold uppercase text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === "notes" && (
        <div className="text-center py-20">
          <p className="text-gray-500">Notes coming soon</p>
        </div>
      )}
      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg border border-gray-200">
            <h2 className="text-gray-900 text-xl font-bold mb-4">Create New Task</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-700 text-sm font-medium mb-1 block">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                  className="w-full border border-gray-200 text-gray-900 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                />
              </div>

              <div>
                <label className="text-gray-700 text-sm font-medium mb-1 block">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                  className="w-full border border-gray-200 text-gray-900 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-gray-900 text-sm resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2.5 rounded-lg transition-colors text-sm"
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg border border-gray-200">
            <h2 className="text-gray-900 text-xl font-bold mb-4">Add Member</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-700 text-sm font-medium mb-1 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="Enter member email"
                  className="w-full border border-gray-200 text-gray-900 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                />
              </div>

              {/* ADD THIS BELOW */}
              <div>
                <label className="text-gray-700 text-sm font-medium mb-1 block">
                  Role
                </label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full border border-gray-200 text-gray-900 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                >
                  <option value="member">Member</option>
                  <option value="project_admin">Project Admin</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowMemberModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2.5 rounded-lg transition-colors text-sm"
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
    </div>
  );
}

export default ProjectDetails;