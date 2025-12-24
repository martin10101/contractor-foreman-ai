import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Calendar, MapPin, Building, User, 
  Plus, Trash2, Edit2, ExternalLink, Briefcase 
} from 'lucide-react';

interface JobSite {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  client: {
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    company: string | null;
  } | null;
  jobSites: JobSite[];
}

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJobSiteModal, setShowJobSiteModal] = useState(false);
  const [jobSiteFormData, setJobSiteFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJobSite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/job-sites', {
        ...jobSiteFormData,
        projectId: id
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowJobSiteModal(false);
      setJobSiteFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
      });
      fetchProject();
    } catch (error) {
      console.error('Error adding job site:', error);
      alert('Error adding job site');
    }
  };

  const handleDeleteJobSite = async (siteId: string) => {
    if (!window.confirm('Are you sure you want to delete this job site?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/job-sites/${siteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProject();
    } catch (error) {
      console.error('Error deleting job site:', error);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading project details...</div>;
  if (!project) return <div className="p-8 text-center text-red-500">Project not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/projects" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              project.status === 'Completed' ? 'bg-green-100 text-green-800' :
              project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Project Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-600" />
              Project Overview
            </h2>
            <p className="text-gray-600 whitespace-pre-wrap">{project.description || 'No description provided.'}</p>
            
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="flex items-start gap-3">
                <Calendar className="text-gray-400 mt-1" size={18} />
                <div>
                  <div className="text-sm font-medium text-gray-900">Start Date</div>
                  <div className="text-sm text-gray-500">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="text-gray-400 mt-1" size={18} />
                <div>
                  <div className="text-sm font-medium text-gray-900">End Date</div>
                  <div className="text-sm text-gray-500">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MapPin size={20} className="text-red-600" />
                Job Sites
              </h2>
              <button 
                onClick={() => setShowJobSiteModal(true)}
                className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
              >
                <Plus size={16} />
                Add Site
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {project.jobSites.length === 0 ? (
                <div className="p-8 text-center text-gray-500 italic">No job sites assigned to this project yet.</div>
              ) : project.jobSites.map((site) => (
                <div key={site.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{site.name}</div>
                      <div className="text-sm text-gray-500">{site.address}</div>
                      <div className="text-sm text-gray-500">{site.city}, {site.state} {site.zipCode}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg"><Edit2 size={18} /></button>
                    <button 
                      onClick={() => handleDeleteJobSite(site.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Client Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User size={20} className="text-purple-600" />
              Client Information
            </h2>
            {project.client ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Name</div>
                  <div className="text-gray-900 font-medium">{project.client.firstName} {project.client.lastName}</div>
                </div>
                {project.client.company && (
                  <div>
                    <div className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Company</div>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Building size={16} className="text-gray-400" />
                      {project.client.company}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Contact Info</div>
                  <div className="space-y-2">
                    {project.client.email && (
                      <div className="text-sm text-blue-600 flex items-center gap-2">
                        <ExternalLink size={14} />
                        {project.client.email}
                      </div>
                    )}
                    {project.client.phone && <div className="text-sm text-gray-700">{project.client.phone}</div>}
                  </div>
                </div>
                <Link 
                  to="/contacts" 
                  className="block text-center w-full py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors mt-4"
                >
                  View All Contacts
                </Link>
              </div>
            ) : (
              <div className="text-gray-500 italic">No client associated with this project.</div>
            )}
          </div>

          <div className="bg-blue-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="font-bold mb-2">Project Statistics</h3>
            <div className="space-y-3 opacity-90 text-sm">
              <div className="flex justify-between">
                <span>Total Job Sites</span>
                <span className="font-mono">{project.jobSites.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Timeline Status</span>
                <span>On Track</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Job Site Modal */}
      {showJobSiteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Add Job Site</h2>
            <form onSubmit={handleAddJobSite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Site Name</label>
                <input 
                  required
                  type="text" 
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={jobSiteFormData.name}
                  onChange={(e) => setJobSiteFormData({...jobSiteFormData, name: e.target.value})}
                  placeholder="e.g. Main Street Office"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input 
                  required
                  type="text" 
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={jobSiteFormData.address}
                  onChange={(e) => setJobSiteFormData({...jobSiteFormData, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input 
                    required
                    type="text" 
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={jobSiteFormData.city}
                    onChange={(e) => setJobSiteFormData({...jobSiteFormData, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input 
                    required
                    type="text" 
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={jobSiteFormData.state}
                    onChange={(e) => setJobSiteFormData({...jobSiteFormData, state: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                <input 
                  required
                  type="text" 
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={jobSiteFormData.zipCode}
                  onChange={(e) => setJobSiteFormData({...jobSiteFormData, zipCode: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button 
                  type="button"
                  onClick={() => setShowJobSiteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
