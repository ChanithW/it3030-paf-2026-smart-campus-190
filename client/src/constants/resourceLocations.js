const RESOURCE_LOCATIONS_STORAGE_KEY = 'resourceLocations'
const LEGACY_RESOURCE_LOCATIONS_STORAGE_KEY = 'resourceCustomLocations'

const BLOCKS = [
  { name: 'Block A', maxFloor: 7 },
  { name: 'Block B', maxFloor: 7 },
  { name: 'Block F', maxFloor: 14 },
  { name: 'Block G', maxFloor: 14 }
]

const ORDINAL_SUFFIXES = ['th', 'st', 'nd', 'rd']

const getOrdinalLabel = (floor) => {
  const remainder = floor % 100
  if (remainder >= 11 && remainder <= 13) {
    return `${floor}th`
  }

  const suffix = ORDINAL_SUFFIXES[floor % 10] || 'th'
  return `${floor}${suffix}`
}

export const BASE_RESOURCE_LOCATIONS = BLOCKS.flatMap(({ name, maxFloor }) =>
  Array.from({ length: maxFloor }, (_, index) => `${name} ${getOrdinalLabel(index + 1)} Floor`)
)

const normalizeLocation = (value) => value.trim()

const uniqueLocations = (values) => {
  const seen = new Set()
  const result = []

  values.forEach((value) => {
    const normalized = normalizeLocation(value)
    if (!normalized) return

    const key = normalized.toLowerCase()
    if (seen.has(key)) return

    seen.add(key)
    result.push(normalized)
  })

  return result
}

const saveResourceLocations = (values) => {
  localStorage.setItem(RESOURCE_LOCATIONS_STORAGE_KEY, JSON.stringify(uniqueLocations(values)))
}

const getStoredResourceLocations = () => {
  try {
    const raw = localStorage.getItem(RESOURCE_LOCATIONS_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null

    return uniqueLocations(parsed)
  } catch {
    return null
  }
}

export const getStoredCustomResourceLocations = () => {
  try {
    const raw = localStorage.getItem(LEGACY_RESOURCE_LOCATIONS_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => (typeof item === 'string' ? normalizeLocation(item) : ''))
      .filter(Boolean)
  } catch {
    return []
  }
}

export const getAllResourceLocations = () => {
  const stored = getStoredResourceLocations()
  if (stored) return stored

  const legacyCustom = getStoredCustomResourceLocations()
  const initial = uniqueLocations([...BASE_RESOURCE_LOCATIONS, ...legacyCustom])
  saveResourceLocations(initial)
  return initial
}

export const saveCustomResourceLocation = (value) => {
  const normalized = normalizeLocation(value)
  if (!normalized) return

  const all = getAllResourceLocations()
  const exists = all.some((location) => location.toLowerCase() === normalized.toLowerCase())
  if (exists) return

  saveResourceLocations([...all, normalized])
}

export const updateResourceLocation = (oldValue, newValue) => {
  const normalizedOld = normalizeLocation(oldValue)
  const normalizedNew = normalizeLocation(newValue)

  if (!normalizedOld || !normalizedNew) return

  const updated = getAllResourceLocations().map((location) =>
    location.toLowerCase() === normalizedOld.toLowerCase() ? normalizedNew : location
  )

  saveResourceLocations(updated)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('resource-locations-changed'))
  }
}

export const deleteResourceLocation = (value) => {
  const normalized = normalizeLocation(value)
  if (!normalized) return

  const updated = getAllResourceLocations().filter(
    (location) => location.toLowerCase() !== normalized.toLowerCase()
  )

  saveResourceLocations(updated)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('resource-locations-changed'))
  }
}