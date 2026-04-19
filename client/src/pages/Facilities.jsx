import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { getAllResourceTypes, saveCustomResourceType } from '../constants/resourceTypes'
import {
  getAllResourceLocations,
  saveCustomResourceLocation
} from '../constants/resourceLocations'

export default function Facilities() {
  const { user } = useAuth()

  // Page state for resources, filters, and modal/form behavior.
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [resourceTypes, setResourceTypes] = useState([])
  const [resourceLocations, setResourceLocations] = useState([])
  const [selectedType, setSelectedType] = useState('')
  const [otherType, setOtherType] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [otherLocation, setOtherLocation] = useState('')
  const [filter, setFilter] = useState({ type: '', location: '', capacity: '', status: '' })
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    name: '', type: '', capacity: '', location: '',
    availabilityWindows: '', status: 'ACTIVE', description: ''
  })
  const [availabilityTemplate, setAvailabilityTemplate] = useState({
    days: '', fromTime: '', toTime: ''
  })
  const availabilityDayOptions = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
    'Mon-Fri',
    'Mon-Sat',
    'Weekend',
    'All Week'
  ]

  // Serialize availability fields into a single backend-friendly string.
  const formatAvailability = ({ days, fromTime, toTime }) => `${days.trim()} | ${fromTime} to ${toTime}`

  // Parse stored availability text when populating edit form.
  const parseAvailability = (availability = '') => {
    const [daysPart, timePart] = availability.split('|')
    if (!daysPart || !timePart) {
      return { days: '', fromTime: '', toTime: '' }
    }

    const [fromPart, toPart] = timePart.trim().split(/\s+to\s+/i)
    if (!fromPart || !toPart) {
      return { days: '', fromTime: '', toTime: '' }
    }

    return {
      days: daysPart.trim(),
      fromTime: fromPart.trim(),
      toTime: toPart.trim()
    }
  }

  // Load resources and known type/location options on first render.
  useEffect(() => {
    fetchResources()
    setResourceTypes(getAllResourceTypes())
    setResourceLocations(getAllResourceLocations())
  }, [])

  // Retrieve resources from the API and update loading state.
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

  // Validate input, normalize custom fields, then create/update the resource.
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    // Validate required fields
    if (!form.name.trim()) {
      setFormError('Resource name is required')
      return
    }

    if (!selectedType || selectedType === '') {
      setFormError('Resource type is required')
      return
    }

    if (selectedType === 'OTHER' && !otherType.trim()) {
      setFormError('Please enter a custom resource type')
      return
    }

    if (!form.capacity || form.capacity === '') {
      setFormError('Capacity is required')
      return
    }

    // Validate capacity is a positive number
    if (isNaN(form.capacity) || parseFloat(form.capacity) < 0) {
      setFormError('Capacity must be a valid positive number')
      return
    }

    if (!form.status || form.status === '') {
      setFormError('Status is required')
      return
    }

    if (!selectedLocation || selectedLocation === '') {
      setFormError('Location is required')
      return
    }

    if (selectedLocation === 'OTHER' && !otherLocation.trim()) {
      setFormError('Please enter a custom location')
      return
    }

    if (!availabilityTemplate.days.trim() || !availabilityTemplate.fromTime || !availabilityTemplate.toTime) {
      setFormError('Availability days and time range are required')
      return
    }

    if (availabilityTemplate.fromTime >= availabilityTemplate.toTime) {
      setFormError('Availability end time must be later than start time')
      return
    }

    try {
      let payload = {
        ...form,
        availabilityWindows: formatAvailability(availabilityTemplate)
      }

      // Handle custom location
      if (selectedLocation === 'OTHER') {
        const customLocation = otherLocation.trim()
        saveCustomResourceLocation(customLocation)
        setResourceLocations(getAllResourceLocations())
        payload = { ...payload, location: customLocation }
      } else {
        payload = { ...payload, location: selectedLocation }
      }

      // Handle custom type
      if (selectedType === 'OTHER') {
        const customType = otherType.trim()
        saveCustomResourceType(customType)
        setResourceTypes(getAllResourceTypes())
        payload = { ...payload, type: customType }
      }

      if (editingResource) {
        await api.put(`/api/resources/${editingResource.id}`, payload)
      } else {
        await api.post('/api/resources', payload)
      }

      fetchResources()
      resetForm()
    } catch (err) {
      console.error(err)
      setFormError('Failed to save resource. Please try again.')
    }
  }

  // Delete a resource after explicit user confirmation.
  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return
    try {
      await api.delete(`/api/resources/${id}`)
      fetchResources()
    } catch (err) {
      console.error(err)
    }
  }

  // Populate form with selected resource and preserve unknown values as custom entries.
  const handleEdit = (resource) => {
    const availableTypes = getAllResourceTypes()
    const matchedType = availableTypes.find(
      (type) => type.toLowerCase() === (resource.type || '').toLowerCase()
    )
    const isKnownType = Boolean(matchedType)
    const availableLocations = getAllResourceLocations()
    const matchedLocation = availableLocations.find(
      (location) => location.toLowerCase() === (resource.location || '').toLowerCase()
    )
    const isKnownLocation = Boolean(matchedLocation)

    if (!isKnownType && resource.type) {
      saveCustomResourceType(resource.type)
    }

    if (!isKnownLocation && resource.location) {
      saveCustomResourceLocation(resource.location)
    }

    setResourceTypes(getAllResourceTypes())
    setResourceLocations(getAllResourceLocations())
    setEditingResource(resource)
    setAvailabilityTemplate(parseAvailability(resource.availabilityWindows || ''))
    setForm({
      name: resource.name,
      type: resource.type,
      capacity: resource.capacity || '',
      location: resource.location,
      availabilityWindows: resource.availabilityWindows || '',
      status: resource.status,
      description: resource.description || ''
    })
    if (isKnownType) {
      setSelectedType(matchedType)
      setOtherType('')
    } else {
      setSelectedType('OTHER')
      setOtherType(resource.type || '')
    }

    if (isKnownLocation) {
      setSelectedLocation(matchedLocation)
      setOtherLocation('')
    } else {
      setSelectedLocation('OTHER')
      setOtherLocation(resource.location || '')
    }
    setShowForm(true)
  }

  // Reset form state to defaults when closing modal or after successful save.
  const resetForm = () => {
    setShowForm(false)
    setEditingResource(null)
    setSelectedType('')
    setOtherType('')
    setSelectedLocation('')
    setOtherLocation('')
    setAvailabilityTemplate({ days: '', fromTime: '', toTime: '' })
    setFormError('')
    setResourceTypes(getAllResourceTypes())
    setResourceLocations(getAllResourceLocations())
    setForm({ name: '', type: '', capacity: '', location: '', availabilityWindows: '', status: 'ACTIVE', description: '' })
  }

  // Client-side filtering shown in the resource grid.
  const filtered = resources.filter(r =>
    (!filter.type || r.type.toLowerCase().includes(filter.type.toLowerCase())) &&
    (!filter.location || r.location.toLowerCase().includes(filter.location.toLowerCase())) &&
    (!filter.capacity || Number(r.capacity) <= Number(filter.capacity)) &&
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
            <button onClick={() => {
              // Refresh options each time the modal opens.
              setResourceTypes(getAllResourceTypes())
              setResourceLocations(getAllResourceLocations())
              setAvailabilityTemplate({ days: '', fromTime: '', toTime: '' })
              setShowForm(true)
            }}
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
          <input placeholder="Filter by max capacity..." value={filter.capacity}
            onChange={e => setFilter({ ...filter, capacity: e.target.value })}
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
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Resource Name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              <select required value={selectedType}
                onChange={e => {
                  const value = e.target.value
                  setSelectedType(value)
                  // Keep `form.type` in sync with selected/custom type value.
                  if (value === 'OTHER') {
                    setForm({ ...form, type: otherType.trim() })
                  } else {
                    setOtherType('')
                    setForm({ ...form, type: value })
                  }
                }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100">
                <option value="">Select Type</option>
                {resourceTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
                <option value="OTHER">Other</option>
              </select>
              {selectedType === 'OTHER' && (
                <input required placeholder="Enter resource type" value={otherType}
                  onChange={e => {
                    const value = e.target.value
                    setOtherType(value)
                    setForm({ ...form, type: value.trim() })
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              )}
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Capacity" type="number" min="0" value={form.capacity}
                  onChange={e => setForm({ ...form, capacity: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                <select required value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100">
                  <option value="">Select Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>
              <select required value={selectedLocation}
                onChange={e => {
                  const value = e.target.value
                  setSelectedLocation(value)
                  // Keep `form.location` in sync with selected/custom location value.
                  if (value === 'OTHER') {
                    setForm({ ...form, location: otherLocation.trim() })
                  } else {
                    setOtherLocation('')
                    setForm({ ...form, location: value })
                  }
                }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100">
                <option value="">Select Location</option>
                {resourceLocations.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
                <option value="OTHER">Other</option>
              </select>
              {selectedLocation === 'OTHER' && (
                <input required placeholder="Enter location (e.g. Block A 7th Floor)" value={otherLocation}
                  onChange={e => {
                    const value = e.target.value
                    setOtherLocation(value)
                    setForm({ ...form, location: value.trim() })
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select required value={availabilityTemplate.days}
                  onChange={e => setAvailabilityTemplate({ ...availabilityTemplate, days: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100">
                  <option value="">Select days</option>
                  {availabilityDayOptions.map((dayOption) => (
                    <option key={dayOption} value={dayOption}>{dayOption}</option>
                  ))}
                  {availabilityTemplate.days && !availabilityDayOptions.includes(availabilityTemplate.days) && (
                    <option value={availabilityTemplate.days}>{availabilityTemplate.days}</option>
                  )}
                </select>
                <input required type="time" value={availabilityTemplate.fromTime}
                  onChange={e => setAvailabilityTemplate({ ...availabilityTemplate, fromTime: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                <input required type="time" value={availabilityTemplate.toTime}
                  onChange={e => setAvailabilityTemplate({ ...availabilityTemplate, toTime: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
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