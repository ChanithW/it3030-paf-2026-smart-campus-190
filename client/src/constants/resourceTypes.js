const RESOURCE_TYPES_STORAGE_KEY = 'resourceTypes'
const LEGACY_RESOURCE_TYPES_STORAGE_KEY = 'resourceCustomTypes'

export const BASE_RESOURCE_TYPES = [
  'Lecture Hall',
  'Lab',
  'Meeting Room',
  'Equipment - Projector',
  'Equipment - Camera'
]

const normalizeType = (value) => value.trim()

const uniqueTypes = (values) => {
  const seen = new Set()
  const result = []

  values.forEach((value) => {
    const normalized = normalizeType(value)
    if (!normalized) return

    const key = normalized.toLowerCase()
    if (seen.has(key)) return

    seen.add(key)
    result.push(normalized)
  })

  return result
}

const saveResourceTypes = (values) => {
  localStorage.setItem(RESOURCE_TYPES_STORAGE_KEY, JSON.stringify(uniqueTypes(values)))
}

const getStoredResourceTypes = () => {
  try {
    const raw = localStorage.getItem(RESOURCE_TYPES_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null

    return uniqueTypes(parsed)
  } catch {
    return null
  }
}

export const getStoredCustomResourceTypes = () => {
  try {
    const raw = localStorage.getItem(LEGACY_RESOURCE_TYPES_STORAGE_KEY)
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
  const stored = getStoredResourceTypes()
  if (stored) return stored

  const legacyCustom = getStoredCustomResourceTypes()
  const initial = uniqueTypes([...BASE_RESOURCE_TYPES, ...legacyCustom])
  saveResourceTypes(initial)
  return initial
}

export const saveCustomResourceType = (value) => {
  const normalized = normalizeType(value)
  if (!normalized) return

  const all = getAllResourceTypes()
  const exists = all.some((type) => type.toLowerCase() === normalized.toLowerCase())
  if (exists) return

  saveResourceTypes([...all, normalized])
}

export const updateResourceType = (oldValue, newValue) => {
  const normalizedOld = normalizeType(oldValue)
  const normalizedNew = normalizeType(newValue)

  if (!normalizedOld || !normalizedNew) return

  const updated = getAllResourceTypes().map((type) =>
    type.toLowerCase() === normalizedOld.toLowerCase() ? normalizedNew : type
  )

  saveResourceTypes(updated)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('resource-types-changed'))
  }
}

export const deleteResourceType = (value) => {
  const normalized = normalizeType(value)
  if (!normalized) return

  const updated = getAllResourceTypes().filter(
    (type) => type.toLowerCase() !== normalized.toLowerCase()
  )

  saveResourceTypes(updated)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('resource-types-changed'))
  }
}
