import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Search, CheckSquare, Calendar, User, 
  Trash2, Edit2, ChevronRight, AlertCircle, Clock,
  CheckCircle2, Circle, AlertTriangle
} from 'lucide-react';
import { isDemoMode } from '../lib/session';

interface Project {
  id: string;
  name: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  projectId: string;
  project: Project;
  assigneeId: string | null;
  assignee: User | null;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '',
    projectId: '',
    assigneeId: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      if (isDemoMode()) {
        setTasks([
          {
            id: 'demo-task-1',
            title: 'Pour concrete footing',
            description: 'Schedule crew and confirm materials.',
            status: 'In Progress',
            priority: 'High',
            dueDate: null,
            projectId: 'demo-project-1',
            project: { id: 'demo-project-1', name: 'Demo Renovation' },
            assigneeId: null,
            assignee: null,
          },
        ]);
        return;
      }
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      if (isDemoMode()) {
        setProjects([{ id: 'demo-project-1', name: 'Demo Renovation' }]);
        return;
      }
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      if (isDemoMode()) {
        setUsers([{ id: 'demo-user-1', firstName: 'Demo', lastName: 'User' }]);
        return;
      }
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'To Do',
      priority: 'Medium',
      dueDate: '',
      projectId: projects[0]?.id || '',
      assigneeId: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      projectId: task.projectId,
      assigneeId: task.assigneeId || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        assigneeId: formData.assigneeId || null,
      };

      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('/api/tasks', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowModal(false);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="text-green-500" size={18} />;
      case 'In Progress': return <Clock className="text-blue-500" size={18} />;
      case 'Blocked': return <AlertTriangle className="text-red-500" size={18} />;
      default: return <Circle className="text-gray-400" size={18} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-700 bg-red-100';
      case 'High': return 'text-orange-700 bg-orange-100';
      case 'Medium': return 'text-blue-700 bg-blue-100';
      case 'Low': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500">Track and manage project tasks and assignments.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Task
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm font-medium">
                <th className="px-6 py-4">Task</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Priority & Due Date</th>
                <th className="px-6 py-4">Assignee</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Loading tasks...</td></tr>
              ) : filteredTasks.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">No tasks found.</td></tr>
              ) : filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(task.status)}
                      <div>
                        <div className={`font-medium ${task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </div>
                        {task.description && <div className="text-xs text-gray-500 truncate max-w-xs">{task.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 font-medium">{task.project.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                          {task.assignee.firstName[0]}{task.assignee.lastName[0]}
                        </div>
                        <span className="text-sm text-gray-700">{task.assignee.firstName} {task.assignee.lastName}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenEdit(task)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(task.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{editingTask ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Task Title</label>
                <input 
                  required
                  type="text" 
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none h-20"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project</label>
                  <select 
                    required
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.projectId}
                    onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                  >
                    <option value="" disabled>Select a Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select 
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Blocked</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select 
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assignee</label>
                  <select 
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.assigneeId}
                    onChange={(e) => setFormData({...formData, assigneeId: e.target.value})}
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input 
                  type="date" 
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
