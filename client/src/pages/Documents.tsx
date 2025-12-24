import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Plus, FolderOpen, Link2, Trash2 } from 'lucide-react';
import { isDemoMode } from '../lib/session';

type Project = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string };

type Document = {
  id: string;
  title: string;
  kind?: string | null;
  url?: string | null;
  project?: Project | null;
  contact?: Contact | null;
  createdAt: string;
};

const Documents: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: '',
    kind: 'Photo',
    url: '',
    projectId: '',
    contactId: '',
  });

  const token = localStorage.getItem('token');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchData = async () => {
    try {
      if (isDemoMode()) {
        setDocs([
          {
            id: 'demo-doc-1',
            title: 'Inspection photo - footing',
            kind: 'Photo',
            url: 'https://example.com/photo.jpg',
            createdAt: new Date().toISOString(),
          },
        ]);
        return;
      }
      const [d, p, c] = await Promise.all([
        axios.get('/api/documents', { headers }),
        axios.get('/api/projects', { headers }),
        axios.get('/api/contacts', { headers }),
      ]);
      setDocs(d.data);
      setProjects(p.data);
      setContacts(c.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setForm((prev) => ({ ...prev, projectId: projects[0]?.id || '', contactId: contacts[0]?.id || '' }));
    setShowModal(true);
  };

  const createDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode()) {
      setShowModal(false);
      return;
    }
    try {
      let url = form.url;
      if (fileToUpload) {
        const fd = new FormData();
        fd.append('file', fileToUpload);
        const uploaded = await axios.post('/api/uploads', fd, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        });
        url = uploaded.data.url;
      }

      await axios.post(
        '/api/documents',
        {
          title: form.title,
          kind: form.kind,
          url,
          projectId: form.projectId || null,
          contactId: form.contactId || null,
        },
        { headers }
      );
      setShowModal(false);
      setFileToUpload(null);
      await fetchData();
    } catch (error) {
      console.error('Error creating document:', error);
      alert('Error creating document');
    }
  };

  const deleteDoc = async (id: string) => {
    if (!window.confirm('Delete this document?')) return;
    if (isDemoMode()) return;
    try {
      await axios.delete(`/api/documents/${id}`, { headers });
      await fetchData();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500">Store links to photos, permits, invoices, and more.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Document
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm font-medium">
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Linked To</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    Loading documents...
                  </td>
                </tr>
              ) : docs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    No documents found.
                  </td>
                </tr>
              ) : (
                docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <FolderOpen size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{doc.title}</div>
                          <div className="text-xs text-gray-500">{doc.kind || 'Document'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {doc.project ? `Project: ${doc.project.name}` : doc.contact ? `Contact: ${doc.contact.firstName} ${doc.contact.lastName}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(doc.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-2">
                        {doc.url && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Open link"
                          >
                            <Link2 size={18} />
                          </a>
                        )}
                        <button
                          onClick={() => deleteDoc(doc.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete document"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Add Document (Link)</h2>
            <form onSubmit={createDoc} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kind</label>
                  <input
                    type="text"
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.kind}
                    onChange={(e) => setForm({ ...form, kind: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL</label>
                  <input
                    type="url"
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Or Upload File (optional)</label>
                <input
                  type="file"
                  className="mt-1 w-full"
                  onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-gray-400 mt-1">Max 10 MB. Uploaded files are stored locally under `server/uploads/`.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  required
                  type="text"
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact (optional)</label>
                  <select
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.contactId}
                    onChange={(e) => setForm({ ...form, contactId: e.target.value })}
                  >
                    <option value="">None</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName}
                      </option>
                    ))}
                  </select>
                </div>
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
