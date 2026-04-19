const RESOURCE_LOCATIONS_STORAGE_KEY = 'resourceCustomLocations'

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

export const getStoredCustomResourceLocations = () => {
  try {
    const raw = localStorage.getItem(RESOURCE_LOCATIONS_STORAGE_KEY)
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
  const custom = getStoredCustomResourceLocations()
  return [...BASE_RESOURCE_LOCATIONS, ...custom]
}

export const saveCustomResourceLocation = (value) => {
  const normalized = normalizeLocation(value)
  if (!normalized) return

  const all = getAllResourceLocations()
  const exists = all.some((location) => location.toLowerCase() === normalized.toLowerCase())
  if (exists) return

  const updatedCustom = [...getStoredCustomResourceLocations(), normalized]
  localStorage.setItem(RESOURCE_LOCATIONS_STORAGE_KEY, JSON.stringify(updatedCustom))
}