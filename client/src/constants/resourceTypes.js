const RESOURCE_TYPES_STORAGE_KEY = 'resourceCustomTypes'

export const BASE_RESOURCE_TYPES = [
  'Lecture Hall',
  'Lab',
  'Meeting Room',
  'Equipment - Projector',
  'Equipment - Camera'
]

const normalizeType = (value) => value.trim()

export const getStoredCustomResourceTypes = () => {
  try {
    const raw = localStorage.getItem(RESOURCE_TYPES_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => (typeof item === 'string' ? normalizeType(item) : ''))
      .filter(Boolean)
  } catch {
    return []
  }
}

export const getAllResourceTypes = () => {
  const custom = getStoredCustomResourceTypes()
  return [...BASE_RESOURCE_TYPES, ...custom]
}

export const saveCustomResourceType = (value) => {
  const normalized = normalizeType(value)
  if (!normalized) return

  const all = getAllResourceTypes()
  const exists = all.some((type) => type.toLowerCase() === normalized.toLowerCase())
  if (exists) return

  const updatedCustom = [...getStoredCustomResourceTypes(), normalized]
  localStorage.setItem(RESOURCE_TYPES_STORAGE_KEY, JSON.stringify(updatedCustom))
}
