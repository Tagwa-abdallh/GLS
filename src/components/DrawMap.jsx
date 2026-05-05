import { FeatureGroup, MapContainer, Polygon, TileLayer, useMap } from 'react-leaflet'
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet-draw'

const defaultCenter = [15.5007, 32.5599]
const defaultZoom = 11

const DrawControls = ({ featureGroupRef, onPolygonChange }) => {
  const map = useMap()

  useEffect(() => {
    const featureGroup = featureGroupRef.current
    if (!featureGroup) return

    const drawControl = new L.Control.Draw({
      draw: {
        polygon: { showArea: true },
        rectangle: false,
        polyline: false,
        circle: false,
        marker: false,
      },
      edit: { featureGroup, remove: true },
    })

    map.addControl(drawControl)

    const created = (e) => {
      if (e.layerType !== 'polygon') return
      featureGroup.clearLayers()
      featureGroup.addLayer(e.layer)

      const points = e.layer.getLatLngs()[0].map(p => [p.lat, p.lng])
      onPolygonChange(points)
    }

    const edited = (e) => {
      const layer = e.layers.getLayers()[0]
      const points = layer.getLatLngs()[0].map(p => [p.lat, p.lng])
      onPolygonChange(points)
    }

    const deleted = () => onPolygonChange(null)

    map.on(L.Draw.Event.CREATED, created)
    map.on(L.Draw.Event.EDITED, edited)
    map.on(L.Draw.Event.DELETED, deleted)

    return () => {
      map.off(L.Draw.Event.CREATED, created)
      map.off(L.Draw.Event.EDITED, edited)
      map.off(L.Draw.Event.DELETED, deleted)
      map.removeControl(drawControl)
    }
  }, [map, featureGroupRef, onPolygonChange])

  return null
}

const CenterUpdater = ({ center }) => {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.setView(center, 16)
    }
  }, [center, map])

  return null
}

function BasemapControl({ basemap, setBasemap }) {
  const map = useMap()

  useEffect(() => {
    const container = L.DomUtil.create('div', 'map-control glass')

    container.innerHTML = `
      <button class="map-btn">🗺️</button>
      <button class="map-btn">🛰️</button>
    `

    const btns = container.querySelectorAll('button')

    btns[0].onclick = () => setBasemap('street')
    btns[1].onclick = () => setBasemap('sat')

    const control = L.control({ position: 'topright' })
    control.onAdd = () => container
    control.addTo(map)

    return () => control.remove()
  }, [map, setBasemap])

  return null
}

const DrawMap = ({ onPolygonChange, initialPolygon = null, initialCenter = null }) => {
  const featureGroupRef = useRef(null)
  const [currentPolygon, setCurrentPolygon] = useState(initialPolygon)
  const [basemap, setBasemap] = useState('street')

  useEffect(() => {
    setCurrentPolygon(initialPolygon)
  }, [initialPolygon])

  return (
    <div className="map-wrapper fade-in">

      {/* TITLE */}
      <div className="map-title slide-up">
        <h2> رسم حدود الأرض</h2>
        <p>اضغط على الخريطة لرسم حدود العقار</p>
      </div>

      {/* MAP */}
      <MapContainer center={defaultCenter} zoom={defaultZoom} className="map-box">

        <CenterUpdater center={initialCenter} />

        {basemap === 'street' ? (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        <BasemapControl basemap={basemap} setBasemap={setBasemap} />

        <FeatureGroup ref={featureGroupRef}>
          {currentPolygon && (
            <Polygon positions={currentPolygon} pathOptions={{ color: 'blue' }} />
          )}

          <DrawControls
            featureGroupRef={featureGroupRef}
            onPolygonChange={setCurrentPolygon}
          />
        </FeatureGroup>
      </MapContainer>
    </div>
  )
}

export default DrawMap