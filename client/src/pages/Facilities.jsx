import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import {
  BASE_RESOURCE_TYPES,
  getAllResourceTypes,
  saveCustomResourceType,
  updateResourceType,
  deleteResourceType
} from '../constants/resourceTypes'
import {
  BASE_RESOURCE_LOCATIONS,
  getAllResourceLocations,
  saveCustomResourceLocation,
  updateResourceLocation,
  deleteResourceLocation
} from '../constants/resourceLocations'

const RESOURCE_NAME_PATTERN = /^[A-Za-z0-9 ]+$/
const CUSTOM_EQUIPMENT_PREFIX = 'Equipment - '

const stripEquipmentPrefix = (value = '') => {
  const trimmed = value.trim()
  if (trimmed.toLowerCase().startsWith(CUSTOM_EQUIPMENT_PREFIX.toLowerCase())) {
    return trimmed.slice(CUSTOM_EQUIPMENT_PREFIX.length)
  }
  return trimmed
}

const buildCustomEquipmentType = (value = '') => {
  const customPart = stripEquipmentPrefix(value)
  if (!customPart) return ''
  return `${CUSTOM_EQUIPMENT_PREFIX}${customPart}`
}

export default function Facilities() {
  const { user } = useAuth()

  // Page state for resources, filters, and modal/form behavior.
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [resourceTypes, setResourceTypes] = useState([])
  const [resourceLocations, setResourceLocations] = useState([])
  const [typeEditor, setTypeEditor] = useState({ original: '', value: '' })
  const [locationEditor, setLocationEditor] = useState({ original: '', value: '' })
  const [isTypePanelCollapsed, setIsTypePanelCollapsed] = useState(true)
  const [isLocationPanelCollapsed, setIsLocationPanelCollapsed] = useState(true)
  const [selectedType, setSelectedType] = useState('')
  const [otherType, setOtherType] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [otherLocation, setOtherLocation] = useState('')
  const [filter, setFilter] = useState({ type: '', location: '', capacity: '', status: '' })
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' })
  const [deleteTarget, setDeleteTarget] = useState(null)
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

  const isBuiltInResourceType =
    selectedType && BASE_RESOURCE_TYPES.some((type) => type.toLowerCase() === selectedType.toLowerCase())
  const customResourceTypes = resourceTypes.filter(
    (type) => !BASE_RESOURCE_TYPES.some((baseType) => baseType.toLowerCase() === type.toLowerCase())
  )
  const customResourceLocations = resourceLocations.filter(
    (location) => !BASE_RESOURCE_LOCATIONS.some((baseLocation) => baseLocation.toLowerCase() === location.toLowerCase())
  )

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

  useEffect(() => {
    const handleTypesChanged = () => {
      setResourceTypes(getAllResourceTypes())
    }

    window.addEventListener('resource-types-changed', handleTypesChanged)
    return () => window.removeEventListener('resource-types-changed', handleTypesChanged)
  }, [])

  useEffect(() => {
    const handleLocationsChanged = () => {
      setResourceLocations(getAllResourceLocations())
    }

    window.addEventListener('resource-locations-changed', handleLocationsChanged)
    return () => window.removeEventListener('resource-locations-changed', handleLocationsChanged)
  }, [])

  // Auto-hide popup messages after a short delay.
  useEffect(() => {
    if (!toast.show) return undefined

    const timeoutId = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }))
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [toast.show])

  const showToast = (message, type = 'success') => {
    setToast({ show: true, type, message })
  }

  const buildResourcePayload = (resource, overrides = {}) => ({
    name: resource.name,
    type: resource.type,
    capacity: resource.capacity ?? null,
    location: resource.location,
    availabilityWindows: resource.availabilityWindows || '',
    status: resource.status,
    description: resource.description || '',
    ...overrides
  })

  const startTypeEdit = (type) => {
    setTypeEditor({ original: type, value: type })
  }

  const cancelTypeEdit = () => {
    setTypeEditor({ original: '', value: '' })
  }

  const startLocationEdit = (location) => {
    setLocationEditor({ original: location, value: location })
  }

  const cancelLocationEdit = () => {
    setLocationEditor({ original: '', value: '' })
  }

  const commitTypeEdit = async () => {
    const oldValue = typeEditor.original.trim()
    const newValue = typeEditor.value.trim()

    if (!oldValue) return
    if (!newValue) {
      showToast('Resource type name is required.', 'error')
      return
    }

    const duplicate = resourceTypes.some(
      (type) => type.toLowerCase() === newValue.toLowerCase() && type.toLowerCase() !== oldValue.toLowerCase()
    )

    if (duplicate) {
      showToast('That resource type already exists.', 'error')
      return
    }

    try {
      const affectedResources = resources.filter(
        (resource) => (resource.type || '').toLowerCase() === oldValue.toLowerCase()
      )

      if (affectedResources.length > 0) {
        await Promise.all(
          affectedResources.map((resource) =>
            api.put(`/api/resources/${resource.id}`, buildResourcePayload(resource, { type: newValue }))
          )
        )
      }
    } catch (err) {
      console.error(err)
      showToast('Failed to update resources with the new type name.', 'error')
      return
    }

    updateResourceType(oldValue, newValue)
    setResourceTypes(getAllResourceTypes())
    await fetchResources()

    if (selectedType.toLowerCase() === oldValue.toLowerCase()) {
      setSelectedType(newValue)
    }

    if (form.type.toLowerCase() === oldValue.toLowerCase()) {
      setForm({ ...form, type: newValue })
    }

    showToast('Resource type updated successfully.')
    cancelTypeEdit()
  }

  const handleDeleteType = (type) => {
    if (!confirm(`Delete resource type "${type}"?`)) return

    deleteResourceType(type)
    setResourceTypes(getAllResourceTypes())

    if (selectedType.toLowerCase() === type.toLowerCase()) {
      setSelectedType('OTHER')
      const customTypePart = stripEquipmentPrefix(type)
      setOtherType(customTypePart)
      setForm({ ...form, type: buildCustomEquipmentType(customTypePart) })
    }

    if (typeEditor.original.toLowerCase() === type.toLowerCase()) {
      cancelTypeEdit()
    }

    showToast('Resource type deleted successfully.')
  }

  const commitLocationEdit = async () => {
    const oldValue = locationEditor.original.trim()
    const newValue = locationEditor.value.trim()

    if (!oldValue) return
    if (!newValue) {
      showToast('Resource location name is required.', 'error')
      return
    }

    const duplicate = resourceLocations.some(
      (location) => location.toLowerCase() === newValue.toLowerCase() && location.toLowerCase() !== oldValue.toLowerCase()
    )

    if (duplicate) {
      showToast('That resource location already exists.', 'error')
      return
    }

    try {
      const affectedResources = resources.filter(
        (resource) => (resource.location || '').toLowerCase() === oldValue.toLowerCase()
      )

      if (affectedResources.length > 0) {
        await Promise.all(
          affectedResources.map((resource) =>
            api.put(`/api/resources/${resource.id}`, buildResourcePayload(resource, { location: newValue }))
          )
        )
      }
    } catch (err) {
      console.error(err)
      showToast('Failed to update resources with the new location name.', 'error')
      return
    }

    updateResourceLocation(oldValue, newValue)
    setResourceLocations(getAllResourceLocations())
    await fetchResources()

    if (selectedLocation.toLowerCase() === oldValue.toLowerCase()) {
      setSelectedLocation(newValue)
    }

    if (form.location.toLowerCase() === oldValue.toLowerCase()) {
      setForm({ ...form, location: newValue })
    }

    showToast('Resource location updated successfully.')
    cancelLocationEdit()
  }

  const handleDeleteLocation = (location) => {
    if (!confirm(`Delete resource location "${location}"?`)) return

    deleteResourceLocation(location)
    setResourceLocations(getAllResourceLocations())

    if (selectedLocation.toLowerCase() === location.toLowerCase()) {
      setSelectedLocation('OTHER')
      setOtherLocation(location)
      setForm({ ...form, location })
    }

    if (locationEditor.original.toLowerCase() === location.toLowerCase()) {
      cancelLocationEdit()
    }

    showToast('Resource location deleted successfully.')
  }

  // Retrieve resources from the API and update loading state.
  const fetchResources = async () => {
    try {
      const res = await api.get('/api/resources')
      setResources(res.data)
    } catch (err) {
      console.error(err)
      showToast('Failed to load resources.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Validate input, normalize custom fields, then create/update the resource.
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    // Validate required fields
    const trimmedName = form.name.trim()
    if (!trimmedName) {
      setFormError('Resource name is required')
      return
    }

    if (!RESOURCE_NAME_PATTERN.test(trimmedName)) {
      setFormError('Resource name can only contain letters, numbers, and spaces')
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

    const shouldRequireCapacity =
      isBuiltInResourceType && (!editingResource || editingResource.capacity !== null)

    if (shouldRequireCapacity && (!form.capacity || form.capacity === '')) {
      setFormError('Capacity is required')
      return
    }

    // Validate capacity only when provided.
    if (form.capacity !== '' && (isNaN(form.capacity) || parseFloat(form.capacity) <= 0)) {
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
        name: trimmedName,
        capacity: form.capacity === '' ? null : Number(form.capacity),
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
        const customType = buildCustomEquipmentType(otherType)
        saveCustomResourceType(customType)
        setResourceTypes(getAllResourceTypes())
        payload = { ...payload, type: customType }
      }

      if (editingResource) {
        await api.put(`/api/resources/${editingResource.id}`, payload)
        showToast('Resource updated successfully.')
      } else {
        await api.post('/api/resources', payload)
        showToast('Resource created successfully.')
      }

      fetchResources()
      resetForm()
    } catch (err) {
      console.error(err)
      setFormError('Failed to save resource. Please try again.')
      showToast('Failed to save resource.', 'error')
    }
  }

  // Open custom confirmation popup before delete action.
  const promptDelete = (resource) => {
    setDeleteTarget(resource)
  }

  // Delete a resource after custom confirmation.
  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      await api.delete(`/api/resources/${deleteTarget.id}`)
      showToast('Resource deleted successfully.')
      fetchResources()
    } catch (err) {
      console.error(err)
      const message = err.response?.data?.message || 'Failed to delete resource.'
      showToast(message, 'error')
    } finally {
      setDeleteTarget(null)
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
      setOtherType(stripEquipmentPrefix(resource.type || ''))
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
      {toast.show && (
        <div className="fixed right-4 top-4 z-[70] w-full max-w-sm">
          <div
            className={`rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${toast.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
              }`}
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-semibold">{toast.type === 'error' ? 'Action failed' : 'Success'}</p>
            <p className="mt-1 text-sm">{toast.message}</p>
          </div>
        </div>
      )}

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

        {user?.role === 'ADMIN' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Manage Resource Types</h2>
                <p className="text-sm text-gray-500">Rename or remove custom types added from Other Equipments.</p>
              </div>
              <div className="flex items-center gap-2">
                {typeEditor.original && (
                  <button
                    type="button"
                    onClick={cancelTypeEdit}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsTypePanelCollapsed((prev) => !prev)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  aria-expanded={!isTypePanelCollapsed}
                >
                  {isTypePanelCollapsed ? 'Expand' : 'Minimize'}
                </button>
              </div>
            </div>

            {!isTypePanelCollapsed && (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {customResourceTypes.length === 0 && (
                  <p className="text-sm text-gray-500">No custom resource types added yet.</p>
                )}
                {customResourceTypes.map((type) => {
                  const isEditing = typeEditor.original.toLowerCase() === type.toLowerCase()

                  return (
                    <div key={type} className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            value={typeEditor.value}
                            onChange={(e) => setTypeEditor({ ...typeEditor, value: e.target.value })}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={commitTypeEdit}
                              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelTypeEdit}
                              className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-gray-800">{type}</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startTypeEdit(type)}
                              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteType(type)}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {user?.role === 'ADMIN' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Manage Resource Locations</h2>
                <p className="text-sm text-gray-500">Rename or remove custom locations added from Other.</p>
              </div>
              <div className="flex items-center gap-2">
                {locationEditor.original && (
                  <button
                    type="button"
                    onClick={cancelLocationEdit}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsLocationPanelCollapsed((prev) => !prev)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  aria-expanded={!isLocationPanelCollapsed}
                >
                  {isLocationPanelCollapsed ? 'Expand' : 'Minimize'}
                </button>
              </div>
            </div>

            {!isLocationPanelCollapsed && (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {customResourceLocations.length === 0 && (
                  <p className="text-sm text-gray-500">No custom resource locations added yet.</p>
                )}
                {customResourceLocations.map((location) => {
                  const isEditing = locationEditor.original.toLowerCase() === location.toLowerCase()

                  return (
                    <div key={location} className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            value={locationEditor.value}
                            onChange={(e) => setLocationEditor({ ...locationEditor, value: e.target.value })}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={commitLocationEdit}
                              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelLocationEdit}
                              className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-gray-800">{location}</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startLocationEdit(location)}
                              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLocation(location)}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

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
                    <button onClick={() => promptDelete(r)}
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
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm" role="alert" aria-live="assertive">
                <p className="font-semibold">Please fix this issue</p>
                <p className="mt-1">{formError}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Resource Name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                pattern="[A-Za-z0-9 ]+"
                title="Only letters, numbers, and spaces are allowed"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              <select required value={selectedType}
                onChange={e => {
                  const value = e.target.value
                  setSelectedType(value)
                  // Keep `form.type` in sync with selected/custom type value.
                  if (value === 'OTHER') {
                    setForm({ ...form, type: buildCustomEquipmentType(otherType), capacity: '' })
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
                <option value="OTHER">Other Equipments</option>
              </select>
              {selectedType === 'OTHER' && (
                <div className="flex w-full items-center rounded-xl border border-gray-200 px-4 py-3 focus-within:ring-2 focus-within:ring-blue-100">
                  <span className="shrink-0 text-gray-500">Equipment - </span>
                  <input
                    required
                    placeholder="Type name"
                    value={otherType}
                    onChange={e => {
                      const value = e.target.value
                      setOtherType(value)
                      setForm({ ...form, type: buildCustomEquipmentType(value) })
                    }}
                    className="w-full border-none p-0 focus:outline-none"
                  />
                </div>
              )}
              <div className={`grid gap-4 ${isBuiltInResourceType ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {isBuiltInResourceType && (
                  <input
                    required={!editingResource || editingResource.capacity !== null}
                    placeholder={!editingResource || editingResource.capacity !== null ? 'Capacity' : 'Capacity (optional)'}
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={e => setForm({ ...form, capacity: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                )}
                <select required value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100">
                  <option value="">Select Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>
              {selectedType === 'OTHER' && (
                <p className="text-xs text-amber-600">Capacity is not required for custom resource types.</p>
              )}
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

      {/* Delete confirmation popup */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800">Delete Resource</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete
              <span className="font-semibold text-gray-800"> {deleteTarget.name}</span>?
              This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}