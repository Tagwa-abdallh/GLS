const METERS_PER_DEGREE_LAT = 111320
const VERY_HIGH_ZONE_MIN_COUNT = 3
const VERY_HIGH_ZONE_RADIUS_METERS = 900

const toRadians = (value) => (value * Math.PI) / 180

export const calculatePolygonAreaSqm = (polygon = []) => {
  if (!Array.isArray(polygon) || polygon.length < 3) {
    return 0
  }

  const centerLat =
    polygon.reduce((sum, [lat]) => sum + lat, 0) / polygon.length

  const metersPerDegreeLng =
    METERS_PER_DEGREE_LAT * Math.cos(toRadians(centerLat))

  const points = polygon.map(([lat, lng]) => [
    lng * metersPerDegreeLng,
    lat * METERS_PER_DEGREE_LAT,
  ])

  let total = 0
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[(i + 1) % points.length]
    total += x1 * y2 - x2 * y1
  }

  return Math.abs(total / 2)
}

const getPolygonCentroid = (polygon = []) => {
  if (!Array.isArray(polygon) || polygon.length < 3) {
    return null
  }

  const totals = polygon.reduce(
    (acc, [lat, lng]) => ({
      lat: acc.lat + lat,
      lng: acc.lng + lng,
    }),
    { lat: 0, lng: 0 }
  )

  return {
    lat: totals.lat / polygon.length,
    lng: totals.lng / polygon.length,
  }
}

const getDistanceMeters = (pointA, pointB) => {
  if (!pointA || !pointB) {
    return Number.POSITIVE_INFINITY
  }

  const meanLat = (pointA.lat + pointB.lat) / 2
  const metersPerDegreeLng =
    METERS_PER_DEGREE_LAT * Math.cos(toRadians(meanLat))

  const deltaLatMeters =
    (pointA.lat - pointB.lat) * METERS_PER_DEGREE_LAT

  const deltaLngMeters =
    (pointA.lng - pointB.lng) * metersPerDegreeLng

  return Math.hypot(deltaLatMeters, deltaLngMeters)
}

const getNearbyUnbuiltCount = (property, allProperties = []) => {
  const subjectCenter = getPolygonCentroid(property?.polygon || [])
  if (!subjectCenter) return 0

  return allProperties.filter((candidate) => {
    if (candidate?.status !== 'Unبني' || !candidate?.polygon?.length) {
      return false
    }

    const candidateCenter = getPolygonCentroid(candidate.polygon)
    const distance = getDistanceMeters(subjectCenter, candidateCenter)

    return distance <= VERY_HIGH_ZONE_RADIUS_METERS
  }).length
}

const getZoneLabel = (polygon = []) => {
  const center = getPolygonCentroid(polygon)
  if (!center) return 'الخرطوم'

  if (center.lat >= 15.52) return 'شمال الخرطوم'
  if (center.lat <= 15.48) return 'جنوب الخرطوم'

  return 'وسط الخرطوم'
}

export const getDecisionAnalysis = (property, allProperties = []) => {
  const areaSqm = calculatePolygonAreaSqm(property?.polygon || [])
  const areaHectares = areaSqm / 10000

  const isUnbuilt = property?.status === 'Unbuilt'
  const isLargeParcel = areaSqm >= 8000

  const nearbyUnbuiltCount = isUnbuilt
    ? getNearbyUnbuiltCount(property, allProperties)
    : 0

  const isVeryHighZone = nearbyUnbuiltCount >= VERY_HIGH_ZONE_MIN_COUNT
  const zoneLabel = getZoneLabel(property?.polygon || [])

  let recommendation = 'مراقبة الحالة والخدمات'
  let decision = 'منطقة عادية'
  const reasons = []

  if (isUnbuilt) {
    decision = isVeryHighZone
      ? 'منطقة أولوية عالية جداً'
      : 'منطقة أولوية عالية'

    recommendation = isVeryHighZone
      ? 'يوصى بتنفيذ بنية تحتية وخدمات كاملة'
      : isLargeParcel
      ? 'يوصى بتطوير الطرق والخدمات العامة'
      : 'يوصى بتطوير البنية التحتية'

    reasons.push('الأرض غير مبنية وتحتاج تدخل')

    if (isVeryHighZone) {
      reasons.push(
        `تجمع ${nearbyUnbuiltCount} أراضي غير مبنية في منطقة كثافة عالية (${zoneLabel})`
      )
    } else if (isLargeParcel) {
      reasons.push('قطعة كبيرة مناسبة للتوسع الخدمي')
    } else {
      reasons.push(`موقع ضمن منطقة طلب نشطة (${zoneLabel})`)
    }
  }

  if (property?.status === 'Built' && isLargeParcel) {
    recommendation = 'حماية الخدمات الحالية مع التخطيط للتوسع'
    reasons.push('أرض مبنية ذات مساحة استراتيجية')
  }

  if (!reasons.length) {
    reasons.push('لا توجد مخاطر حالية')
  }

  return {
    areaSqm,
    areaHectares,
    decision,
    recommendation,
    priorityLevel: isUnbuilt
      ? isVeryHighZone
        ? 'عالية جداً'
        : 'عالية'
      : 'عادية',
    isLargeParcel,
    nearbyUnbuiltCount,
    isVeryHighZone,
    zoneLabel,
    reasons,
    reasonSummary: reasons.join(' | '),
  }
}

export const getPrioritySummary = (properties = []) => {
  const total = properties.length

  const unbuilt = properties.filter(
    (p) => p.status === 'Unbuilt'
  ).length

  const analyzed = properties.map((p) =>
    getDecisionAnalysis(p, properties)
  )

  const highPriority = analyzed.filter(
    (a) =>
      a.priorityLevel === 'عالية' ||
      a.priorityLevel === 'عالية جداً'
  ).length

  const veryHighPriority = analyzed.filter(
    (a) => a.priorityLevel === 'عالية جداً'
  ).length

  return {
    total,
    unbuilt,
    highPriority,
    veryHighPriority,
  }
}

export const getSmartInsights = (properties = []) => {
  const analyzed = properties
    .map((p) => ({
      property: p,
      analysis: getDecisionAnalysis(p, properties),
    }))
    .filter((i) => i.analysis.priorityLevel !== 'عادية')

  if (!analyzed.length) {
    return ['لا توجد مناطق حرجة حالياً. استمر في المراقبة.']
  }

  const veryHigh = analyzed.filter(
    (i) => i.analysis.priorityLevel === 'عالية جداً'
  )

  const high = analyzed.filter(
    (i) => i.analysis.priorityLevel === 'عالية'
  )

  const insights = []

  if (veryHigh.length) {
    insights.push(
      `${veryHigh.length} مناطق تحتاج تدخل فوري.`
    )
  }

  if (high.length) {
    insights.push(
      `${high.length} مناطق تحتاج تخطيط قريب.`
    )
  }

  const mostDense = analyzed.sort(
    (a, b) =>
      b.analysis.nearbyUnbuiltCount -
      a.analysis.nearbyUnbuiltCount
  )[0]

  if (mostDense) {
    insights.push(
      `أعلى كثافة في ${mostDense.analysis.zoneLabel}.`
    )
  }

  return insights
}

export const formatArea = (areaSqm) => {
  if (!Number.isFinite(areaSqm) || areaSqm <= 0) {
    return '0 م²'
  }

  if (areaSqm >= 1000000) {
    return `${(areaSqm / 1000000).toFixed(2)} كم²`
  }

  if (areaSqm >= 10000) {
    return `${(areaSqm / 10000).toFixed(2)} هكتار`
  }

  return `${Math.round(areaSqm)} م²`
}