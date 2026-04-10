import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Facilities() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [filter, setFilter] = useState({ type: '', location: '', status: '' })
  const [form, setForm] = useState({
    name: '', type: '', capacity: '', location: '',
    availabilityWindows: '', status: 'ACTIVE', description: ''
  })

  useEffect(() => { fetchResources() }, [])

  const fetchResources = async () => {
    try {
      const res = await api.get('/api/resources')
      setResources(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingResource) {
        await api.put(`/api/resources/${editingResource.id}`, form)
      } else {
        await api.post('/api/resources', form)
      }
      fetchResources()
      resetForm()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return
    try {
      await api.delete(`/api/resources/${id}`)
      fetchResources()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (resource) => {
    setEditingResource(resource)
    setForm({
      name: resource.name,
      type: resource.type,
      capacity: resource.capacity || '',
      location: resource.location,
      availabilityWindows: resource.availabilityWindows || '',
      status: resource.status,
      description: resource.description || ''
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingResource(null)
    setForm({ name: '', type: '', capacity: '', location: '', availabilityWindows: '', status: 'ACTIVE', description: '' })
  }

  const filtered = resources.filter(r =>
    (!filter.type || r.type.toLowerCase().includes(filter.type.toLowerCase())) &&
    (!filter.location || r.location.toLowerCase().includes(filter.location.toLowerCase())) &&
    (!filter.status || r.status === filter.status)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">← Back</button>
          <h1 className="text-xl font-bold text-gray-800">Facilities & Assets</h1>
        </div>
        {user?.role === 'ADMIN' && (
          <button onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
            + Add Resource
          </button>
        )}
      </nav>

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6 flex gap-4 flex-wrap">
          <input placeholder="Filter by type..." value={filter.type}
            onChange={e => setFilter({ ...filter, type: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-32" />
          <input placeholder="Filter by location..." value={filter.location}
            onChange={e => setFilter({ ...filter, location: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-32" />
          <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
        </div>

        {/* Resource Grid */}
        {loading ? <p className="text-center text-gray-500">Loading...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(r => (
              <div key={r.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-800">{r.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${r.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-1">Type: {r.type}</p>
                <p className="text-sm text-gray-500 mb-1">Location: {r.location}</p>
                {r.capacity && <p className="text-sm text-gray-500 mb-1">Capacity: {r.capacity}</p>}
                {r.description && <p className="text-sm text-gray-400 mt-2">{r.description}</p>}
                {user?.role === 'ADMIN' && (
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleEdit(r)}
                      className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(r.id)}
                      className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-gray-400 col-span-3 text-center py-12">No resources found.</p>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-bold mb-6">{editingResource ? 'Edit Resource' : 'Add Resource'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-4 py-2" />
              <input required placeholder="Type (e.g. Lab, Room, Equipment)" value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full border rounded-lg px-4 py-2" />
              <input placeholder="Capacity" type="number" value={form.capacity}
                onChange={e => setForm({ ...form, capacity: e.target.value })}
                className="w-full border rounded-lg px-4 py-2" />
              <input required placeholder="Location" value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full border rounded-lg px-4 py-2" />
              <input placeholder="Availability (e.g. Mon-Fri 8am-6pm)" value={form.availabilityWindows}
                onChange={e => setForm({ ...form, availabilityWindows: e.target.value })}
                className="w-full border rounded-lg px-4 py-2" />
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-lg px-4 py-2">
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
              </select>
              <textarea placeholder="Description" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border rounded-lg px-4 py-2" rows={3} />
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  {editingResource ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}