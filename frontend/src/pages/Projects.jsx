import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  Plus,
  Search,
  Users,
  Trash2,
  Pencil,
  UserPlus,
  FolderKanban,
} from "lucide-react";

const StatusBadge = ({ status }) => {
  const map = {
    todo: "bg-gray-500/10 text-gray-300",
    in_progress: "bg-yellow-500/10 text-yellow-300",
    completed: "bg-green-500/10 text-green-300",
  };
  const label = {
    todo: "To Do",
    in_progress: "In Progress",
    completed: "Completed",
  };

  return (
    <span className={`px-2.5 py-1 text-xs rounded-lg ${map[status]}`}>
      {label[status]}
    </span>
  );
};

/* ---------------- PROJECT MODAL ---------------- */
function ProjectModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({
    project_name: project?.project_name || "",
    description: project?.description || "",
    deadline: project?.deadline || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (project) await api.put(`/projects/${project.id}`, form);
      else await api.post("/projects/", form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
        <h2 className="text-white text-lg font-semibold mb-5">
          {project ? "Edit Project" : "New Project"}
        </h2>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
            placeholder="Project name"
            required
            value={form.project_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, project_name: e.target.value }))
            }
            className="w-full bg-white/[0.05] border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />

          <textarea
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            className="w-full bg-white/[0.05] border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none resize-none focus:border-indigo-500"
          />

          <input
            type="date"
            value={form.deadline}
            onChange={(e) =>
              setForm((p) => ({ ...p, deadline: e.target.value }))
            }
            className="w-full bg-white/[0.05] border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-white/50 hover:text-white text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------- MEMBER MODAL ---------------- */
function MemberModal({ project, onClose, onSaved }) {
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/auth/users").then((r) => setUsers(r.data.users));
  }, []);

  const handleAdd = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      await api.post(`/projects/${project.id}/members`, {
        user_id: parseInt(selectedId),
      });
      onSaved();
    } catch (e) {
      alert(e.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const memberIds = new Set(project.members?.map((m) => m.id) || []);
  const available = users.filter((u) => !memberIds.has(u.id));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-sm bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Add Member</h2>

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm mb-5"
        >
          <option value="">Select user</option>
          {available.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white text-sm"
          >
            Cancel
          </button>

          <button
            disabled={!selectedId || loading}
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2"
          >
            <UserPlus size={14} />
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- MAIN PAGE ---------------- */
export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [memberProject, setMemberProject] = useState(null);
  const [search, setSearch] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/projects/");
      setProjects(r.data.projects);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete project?")) return;
    await api.delete(`/projects/${id}`);
    fetch();
  };

  const filtered = projects.filter((p) =>
    p.project_name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderKanban size={20} /> Projects
          </h1>
          <p className="text-white/40 text-sm">{projects.length} projects</p>
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/[0.05] border border-white/10 text-white pl-9 pr-4 py-2 rounded-xl text-sm"
            />
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setEditProject(null);
                setShowModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm flex items-center gap-2"
            >
              <Plus size={14} /> New
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-white/40">
            <tr>
              <th className="text-left p-4">Name</th>
              <th>Description</th>
              <th>Members</th>
              <th>Tasks</th>
              <th>Deadline</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-white/30">
                  Loading...
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-white/5 hover:bg-white/[0.03]"
                >
                  <td className="p-4">
                    <Link
                      to={`/projects/${p.id}`}
                      className="text-indigo-400 hover:underline"
                    >
                      {p.project_name}
                    </Link>
                  </td>

                  <td className="text-white/50">{p.description || "—"}</td>
                  <td className="text-white/50">{p.member_count}</td>
                  <td className="text-white/50">{p.task_count}</td>
                  <td className="text-white/30">{p.deadline || "—"}</td>

                  {isAdmin && (
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditProject(p);
                            setShowModal(true);
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          onClick={() => setMemberProject(p)}
                          className="p-2 hover:bg-white/10 rounded-lg"
                        >
                          <Users size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showModal && (
        <ProjectModal
          project={editProject}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            fetch();
          }}
        />
      )}

      {memberProject && (
        <MemberModal
          project={memberProject}
          onClose={() => setMemberProject(null)}
          onSaved={() => {
            setMemberProject(null);
            fetch();
          }}
        />
      )}
    </div>
  );
}
