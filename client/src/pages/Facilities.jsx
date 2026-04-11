import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Facilities() {
  const { user } = useAuth()
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
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Facilities & Assets</h1>
            <p className="text-gray-500 text-sm mt-1">Manage bookable resources on campus</p>
          </div>
          {user?.role === 'ADMIN' && (
            <button onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 text-sm font-medium shadow-sm">
              + Add Resource
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex gap-4 flex-wrap border border-gray-100">
          <input placeholder="Filter by type..." value={filter.type}
            onChange={e => setFilter({ ...filter, type: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm flex-1 min-w-32 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          <input placeholder="Filter by location..." value={filter.location}
            onChange={e => setFilter({ ...filter, location: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm flex-1 min-w-32 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
        </div>

        {/* Resource Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading resources...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(r => (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-gray-800 text-lg">{r.name}</h3>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${r.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {r.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>📁</span><span>{r.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>📍</span><span>{r.location}</span>
                  </div>
                  {r.capacity && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>👥</span><span>Capacity: {r.capacity}</span>
                    </div>
                  )}
                  {r.availabilityWindows && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>🕐</span><span>{r.availabilityWindows}</span>
                    </div>
                  )}
                </div>
                {r.description && (
                  <p className="text-sm text-gray-400 mb-4 border-t border-gray-50 pt-3">{r.description}</p>
                )}
                {user?.role === 'ADMIN' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(r)}
                      className="flex-1 text-sm bg-blue-50 text-blue-600 px-3 py-2 rounded-xl hover:bg-blue-100 font-medium">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(r.id)}
                      className="flex-1 text-sm bg-red-50 text-red-500 px-3 py-2 rounded-xl hover:bg-red-100 font-medium">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-20 text-gray-400">
                <p className="text-lg">No resources found</p>
                <p className="text-sm mt-1">Try adjusting your filters or add a new resource</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-gray-800">{editingResource ? 'Edit Resource' : 'Add New Resource'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Resource Name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              <input required placeholder="Type (e.g. Lab, Room, Equipment)" value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Capacity" type="number" value={form.capacity}
                  onChange={e => setForm({ ...form, capacity: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100">
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>
              <input required placeholder="Location" value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              <input placeholder="Availability (e.g. Mon-Fri 8am-6pm)" value={form.availabilityWindows}
                onChange={e => setForm({ ...form, availabilityWindows: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              <textarea placeholder="Description" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100" rows={3} />
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-medium">
                  {editingResource ? 'Update Resource' : 'Create Resource'}
                </button>
                <button type="button" onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 font-medium">
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