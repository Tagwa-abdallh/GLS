import { Link, useNavigate } from 'react-router-dom'
import {
  CircleMarker,
  MapContainer,
  Polygon,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'
import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { getDecisionAnalysis, formatArea } from '../utils/analysis.js'

const defaultCenter = [15.5007, 32.5599]
const defaultZoom = 11

/* ---------------- FIT BOUNDS ---------------- */
const FitBounds = ({ bounds }) => {
  const map = useMap()

  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [30, 30] })
  }, [bounds, map])

  return null
}

/* ---------------- STYLE ---------------- */
const getPolygonStyle = (status, priority) => {
  if (priority === 'Very High') {
    return {
      color: '#8b0000',
      weight: 3,
      fillColor: '#ff6b6b',
      fillOpacity: 0.6,
    }
  }

  if (status === 'Built') {
    return {
      color: '#1b7f4b',
      fillColor: '#5ee07c',
      fillOpacity: 0.4,
    }
  }

  return {
    color: '#c62828',
    fillColor: '#ffb3b3',
    fillOpacity: 0.45,
    dashArray: '6 6',
  }
}

/* ---------------- MAP COMPONENT ---------------- */
const PropertyMap = ({
  properties,
  showDetailsLink = true,
  showPropertiesLayer = true,
  showServicesLayer = false,
  analysisContextProperties,
}) => {
  const navigate = useNavigate()
  const [basemap, setBasemap] = useState('street')

  const analysisProperties = analysisContextProperties || properties

  const bounds = useMemo(() => {
    const pts = properties.flatMap((p) => p.polygon || [])
    if (!pts.length) return null

    let minLat = pts[0][0],
      minLng = pts[0][1],
      maxLat = pts[0][0],
      maxLng = pts[0][1]

    pts.forEach(([lat, lng]) => {
      minLat = Math.min(minLat, lat)
      minLng = Math.min(minLng, lng)
      maxLat = Math.max(maxLat, lat)
      maxLng = Math.max(maxLng, lng)
    })

    return [
      [minLat, minLng],
      [maxLat, maxLng],
    ]
  }, [properties])

  return (
    <div className="map-container fade-in">

      {/* TITLE */}
      <div className="map-header slide-up">
        <h2> الخريطة التفاعلية</h2>
        <p>عرض وتحليل العقارات حسب الأولوية</p>
      </div>

      {/* MAP */}
      <MapContainer center={defaultCenter} zoom={defaultZoom} scrollWheelZoom className="map-box">

        <FitBounds bounds={bounds} />

        {/* BASEMAP */}
        {basemap === 'street' ? (
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        ) : (
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}" />
        )}

        {/* PROPERTIES */}
        {showPropertiesLayer &&
          properties
            .filter((p) => p.polygon?.length > 2)
            .map((property) => {
              const analysis = getDecisionAnalysis(property, analysisProperties)

              return (
                <Polygon
                  key={property.id}
                  positions={property.polygon}
                  pathOptions={getPolygonStyle(property.status, analysis.priorityLevel)}
                >

                  {/* TOOLTIP */}
                  {analysis.priorityLevel !== 'Standard' && (
                    <Tooltip permanent className="tooltip">
                       {analysis.priorityLevel === 'Very High'
                        ? 'منطقة حرجة'
                        : 'منطقة أولوية'}
                    </Tooltip>
                  )}

                  {/* POPUP */}
                  <Popup className="popup fade-in">

                    <h3>{property.ownerName}</h3>

                    <p> الحالة: {property.status}</p>
                    <p>الأولوية: {analysis.priorityLevel}</p>
                    <p> التوصية: {analysis.recommendation}</p>
                    <p> التحليل: {analysis.decision}</p>
                    <p> المساحة: {formatArea(analysis.areaSqm)}</p>

                    <div className="popup-actions">

                      {showDetailsLink && (
                        <Link className="btn small" to={`/properties/${property.id}`}>
                          عرض التفاصيل
                        </Link>
                      )}

                      <button
                        className="btn primary small"
                        onClick={() =>
                          navigate('/add', { state: { polygon: property.polygon } })
                        }
                      >
                        استخدام هذه الأرض
                      </button>

                    </div>

                  </Popup>

                </Polygon>
              )
            })}

        {/* SERVICES */}
        {showServicesLayer &&
          [
            { id: 1, name: 'محطة مياه', center: [15.52, 32.56] },
            { id: 2, name: 'مركز صحي', center: [15.48, 32.51] },
          ].map((s) => (
            <CircleMarker key={s.id} center={s.center} radius={8}>
              <Tooltip>{s.name}</Tooltip>
            </CircleMarker>
          ))}

      </MapContainer>
    </div>
  )
}

export default PropertyMap