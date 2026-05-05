const STORAGE_KEY = 'egls-properties'

const sampleProperties = [
  {
    id: 'seed-khartoum-01',
    ownerName: 'Khartoum Central Plot',
    phone: '+249 91 234 5678',
    status: 'Built',
    documentName: 'Survey_Khartoum.pdf',
    polygon: [
      [15.5022, 32.5611],
      [15.5041, 32.5692],
      [15.4986, 32.5724],
      [15.4967, 32.5641],
    ],
    createdAt: '2026-05-01T09:00:00.000Z',
  },
  {
    id: 'seed-omdurman-02',
    ownerName: 'Omdurman Riverside Parcel',
    phone: '+249 92 345 9901',
    status: 'Unbuilt',
    documentName: 'Deed_Omdurman.pdf',
    polygon: [
      [15.6531, 32.4656],
      [15.6564, 32.4742],
      [15.6492, 32.4771],
      [15.6462, 32.4688],
    ],
    createdAt: '2026-05-02T10:20:00.000Z',
  },
  {
    id: 'seed-bahri-03',
    ownerName: 'Khartoum North Growth Zone',
    phone: '+249 90 558 3344',
    status: 'Unbuilt',
    documentName: 'Survey_Bahri.pdf',
    polygon: [
      [15.6145, 32.5708],
      [15.6187, 32.5796],
      [15.6121, 32.5841],
      [15.6079, 32.5752],
    ],
    createdAt: '2026-05-03T15:45:00.000Z',
  },
]

const isSeedData = (items) => {
  return (
    Array.isArray(items) &&
    items.length > 0 &&
    items.every(
      (item) => typeof item?.id === 'string' && item.id.startsWith('seed-'),
    )
  )
}

export const loadProperties = () => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleProperties))
      return sampleProperties
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleProperties))
      return sampleProperties
    }

    const hasKhartoumSeed = parsed.some(
      (item) => item?.id === 'seed-khartoum-01',
    )
    if (isSeedData(parsed) && !hasKhartoumSeed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleProperties))
      return sampleProperties
    }

    return parsed
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleProperties))
    return sampleProperties
  }
}

export const saveProperties = (properties) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(properties))
}
