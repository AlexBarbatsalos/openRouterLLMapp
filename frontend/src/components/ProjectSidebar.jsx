import { useEffect, useState } from 'react';

export default function ProjectSidebar({ onSelect }) {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');

  const fetchProjects = () => {
    fetch('http://localhost:8000/projects')
      .then(res => res.json())
      .then(setProjects)
      .catch(err => console.error("Failed to fetch projects", err));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = () => {
    if (!newProjectName.trim()) return;
    fetch(`http://localhost:8000/projects/${newProjectName}`, { method: 'POST' })
      .then(() => {
        setNewProjectName('');
        fetchProjects();
      })
      .catch(err => alert("Failed to create project: " + err.message));
  };

  return (
    <div className="w-64 min-h-screen p-4 bg-gray-100 border-r">
      <h2 className="text-lg font-bold mb-4">📁 Projects</h2>

      <ul className="space-y-1 mb-4">
        {projects.map((project) => (
          <li key={project}>
            <button
              onClick={() => onSelect(project)}
              className="text-left w-full px-2 py-1 rounded hover:bg-blue-100"
            >
              {project}
            </button>
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="New project name"
          className="w-full p-1 border rounded text-sm"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
        <button
          onClick={createProject}
          className="w-full bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600"
        >
          + Create Project
        </button>
      </div>
    </div>
  );
}