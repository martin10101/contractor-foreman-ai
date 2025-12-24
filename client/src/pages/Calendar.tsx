import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { isDemoMode } from '../lib/session';

type Project = { id: string; name: string };
type Event = {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  projectId?: string | null;
  project?: Project | null;
};

const Calendar: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    projectId: '',
  });

  const token = localStorage.getItem('token');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchData = async () => {
    try {
      if (isDemoMode()) {
        setProjects([{ id: 'demo-project-1', name: 'Demo Renovation' }]);
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0, 0);
        setEvents([
          {
            id: 'demo-event-1',
            title: 'Concrete delivery',
            description: 'Confirm pump truck and crew.',
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            projectId: 'demo-project-1',
            project: { id: 'demo-project-1', name: 'Demo Renovation' },
          },
        ]);
        return;
      }

      const [p, e] = await Promise.all([
        axios.get('/api/projects', { headers }),
        axios.get('/api/events', { headers }),
      ]);
      setProjects(p.data);
      setEvents(e.data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
    setForm({
      title: '',
      description: '',
      startTime: start.toISOString().slice(0, 16),
      endTime: end.toISOString().slice(0, 16),
      projectId: projects[0]?.id || '',
    });
    setShowModal(true);
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode()) {
      setShowModal(false);
      return;
    }
    try {
      await axios.post(
        '/api/events',
        {
          title: form.title,
          description: form.description || null,
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
          projectId: form.projectId || null,
        },
        { headers }
      );
      setShowModal(false);
      await fetchData();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event');
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const ev of events) {
      const day = new Date(ev.startTime).toDateString();
      const arr = map.get(day) || [];
      arr.push(ev);
      map.set(day, arr);
    }
    return Array.from(map.entries()).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
  }, [events]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500">Schedule key events, deliveries, and inspections.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Event
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-500">
          Loading calendar...
        </div>
      ) : grouped.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-500">
          No events yet.
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([day, dayEvents]) => (
            <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 flex items-center gap-2 text-gray-700 font-semibold">
                <CalendarIcon size={18} />
                {day}
              </div>
              <div className="divide-y divide-gray-100">
                {dayEvents
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .map((ev) => (
                    <div key={ev.id} className="px-6 py-4">
                      <div className="flex justify-between gap-4">
                        <div>
                          <div className="font-semibold text-gray-900">{ev.title}</div>
                          {ev.description && <div className="text-sm text-gray-500">{ev.description}</div>}
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(ev.startTime).toLocaleTimeString()} - {new Date(ev.endTime).toLocaleTimeString()}
                            {ev.project?.name ? ` • ${ev.project.name}` : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">New Event</h2>
            <form onSubmit={createEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  required
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start</label>
                  <input
                    type="datetime-local"
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End</label>
                  <input
                    type="datetime-local"
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Project (optional)</label>
                <select
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                >
                  <option value="">None</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;

