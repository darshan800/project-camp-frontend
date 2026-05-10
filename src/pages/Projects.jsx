import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; 
function Projects() {
   const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");
      console.log(response.data);
      setProjects(response.data.data);
    } catch (err) {
      setError("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;
    setCreating(true);
    try {
      await api.post("/projects", newProject);
      setShowModal(false);
      setNewProject({ name: "", description: "" });
      fetchProjects(); // refresh the list
    } catch (err) {
      setError("Failed to create project");
    } finally {
      setCreating(false);
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
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 text-3xl font-bold">Projects</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.username}!</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-500 hover:bg-green-700 text-gray-900 text-1xl font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + New Project
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No projects yet</p>
          <p className="text-gray-600 text-sm mt-1">
            Create your first project to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {projects.map((item) => (
  <div
    key={item.projects._id}
    onClick={() => navigate(`/projects/${item.projects._id}`)}
    className="bg-white rounded-lg p-6 cursor-pointer border border-gray-200 hover:border-blue-500 transition-all"
  >
    <h2 className="text-gray-900 font-semibold text-lg mb-2">
      {item.projects.name}
    </h2>
    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
      {item.projects.description}
    </p>
    <div className="flex items-center justify-between">
      <span className="text-gray-500 text-xs">
        {item.projects.memberCount} members
      </span>
      <span className="text-gray-500 text-xs font-semibold uppercase">
        {item.role}
      </span>
    </div>
  </div>
))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-gray-900 text-xl font-bold mb-4">
              Create New Project
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-500 text-sm mb-1 block">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  placeholder="Enter project name"
                  className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-gray-500 text-sm mb-1 block">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter project description"
                  rows={3}
                  className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-600 text-gray-900 font-semibold py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={creating}
                  className="flex-1 bg-yellow-300 hover:bg-yellow-500 text-gray-900 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;