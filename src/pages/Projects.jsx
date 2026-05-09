import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/projects");
        setProjects(response.data.data);
      } catch (err) {
        setError("Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-3xl font-bold">Projects</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.username}!</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
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
          <p className="text-gray-400 text-lg">No projects yet</p>
          <p className="text-gray-600 text-sm mt-1">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 cursor-pointer border border-gray-700 hover:border-blue-500 transition-all"
            >
              <h2 className="text-white font-semibold text-lg mb-2">
                {project.name}
              </h2>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">
                  {project.memberCount} members
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;