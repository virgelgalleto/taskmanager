'use client';

import { useEffect, useMemo, useState } from 'react';

type Status = 'pending' | 'in-progress' | 'completed';
type Task = {
  _id: string;
  title: string;
  description?: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
};

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

function formatPH(dt: string) {
  try {
    return new Intl.DateTimeFormat('en-PH', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Manila',
    }).format(new Date(dt));
  } catch {
    return new Date(dt).toLocaleString();
  }
}

export default function Page() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (statusFilter !== 'all') params.set('status', statusFilter);
    return params.toString();
  }, [search, statusFilter]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/tasks?${queryString}`);
      const data = await res.json();
      setTasks(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [queryString]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error('Failed to create task');
      setTitle('');
      setDescription('');
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: Status) {
    try {
      const res = await fetch(`${API}/tasks/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status } : t)));
      }
    } catch {}
  }

  async function removeTask(id: string) {
    if (!confirm('Delete this task?')) return;
    try {
      const res = await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch {}
  }

  const statusButtons: Array<'all' | Status> = ['all', 'pending', 'in-progress', 'completed'];

  return (
    <div className="min-h-screen bg-pink-50">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-4xl font-extrabold text-pink-900 text-center">Task Manager</h1>
        <h3 className="text-2xl font-extrabold text-pink-900 text-center">Ashley | Aimie | Virgel</h3>

        {/* Controls Row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Add Task */}
          <form onSubmit={addTask} className="bg-white rounded-2xl shadow-md p-5 space-y-4">
            <h2 className="text-lg font-semibold text-pink-800">Add New Task</h2>
            <input
              className="border rounded-xl p-3 w-full text-pink-900 placeholder-pink-400 focus:outline-none focus:border-pink-500"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="border rounded-xl p-3 w-full text-pink-900 placeholder-pink-400 focus:outline-none focus:border-pink-500"
              rows={3}
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700 transition"
              >
                Add Task
              </button>
              {loading && <span className="text-sm text-pink-600">Working…</span>}
              {error && <span className="text-sm text-red-600">{error}</span>}
            </div>
          </form>

          {/* Search + Filter */}
          <div className="bg-white rounded-2xl shadow-md p-5">
            <h2 className="text-lg font-semibold text-pink-800 mb-3">Search & Filter</h2>
            <input
              className="border rounded-xl p-3 w-full text-pink-900 placeholder-pink-400 focus:outline-none focus:border-pink-500 mb-4"
              placeholder="Search by title/description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {statusButtons.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded-xl border capitalize font-semibold transition ${
                    statusFilter === s
                      ? 'bg-pink-600 text-white border-pink-600'
                      : 'bg-white text-pink-800 border-pink-300 hover:bg-pink-100'
                  }`}
                >
                  {s.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="grid gap-6 sm:grid-cols-2">
          {tasks.map((t) => (
            <div key={t._id} className="bg-white rounded-2xl shadow-md p-5 flex flex-col">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full border capitalize font-semibold ${
                        t.status === 'completed'
                          ? 'border-green-500 text-green-700 bg-green-50'
                          : t.status === 'in-progress'
                          ? 'border-pink-700 text-pink-800 bg-pink-100'
                          : 'border-pink-500 text-pink-700 bg-pink-50'
                      }`}
                    >
                      {t.status.replace('-', ' ')}
                    </span>
                    <h2 className="text-lg font-semibold text-pink-900">{t.title}</h2>
                  </div>
                  {t.description && <p className="mt-2 text-pink-700">{t.description}</p>}
                  <p className="mt-1 text-xs text-pink-600">Created: {formatPH(t.createdAt)}</p>
                </div>
                <button
                  onClick={() => removeTask(t._id)}
                  className="ml-3 text-sm px-3 py-2 rounded-xl border text-red-600 border-red-200 hover:bg-red-50 font-semibold transition"
                >
                  Delete
                </button>
              </div>

              {/* Quick status buttons */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-pink-700">Set status:</span>
                {(['pending', 'in-progress', 'completed'] as Status[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(t._id, s)}
                    className={`px-3 py-1 rounded-full border text-sm font-semibold transition ${
                      t.status === s
                        ? s === 'pending'
                          ? 'bg-pink-500 text-white border-pink-500'
                          : s === 'in-progress'
                          ? 'bg-pink-700 text-white border-pink-700'
                          : 'bg-green-500 text-white border-green-500'
                        : 'bg-white text-pink-800 border-pink-300 hover:bg-pink-100'
                    }`}
                  >
                    {s.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {!loading && tasks.length === 0 && (
            <p className="text-center text-pink-700 col-span-full">No tasks found.</p>
          )}
        </div>
      </div>
    </div>
  );
}