import { Navigate, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import './App.css'
import TopNav from './components/TopNav.jsx'
import Home from './pages/Home.jsx'
import AddProperty from './pages/AddProperty.jsx'
import MapView from './pages/MapView.jsx'
import PropertyDetails from './pages/PropertyDetails.jsx'
import { loadProperties, saveProperties } from './utils/storage.js'

function App() {
  const [properties, setProperties] = useState(() => loadProperties())
  const [lang, setLang] = useState("ar") // 🌍 اللغة

  const handleAddProperty = (property) => {
    const next = [property, ...properties]
    setProperties(next)
    saveProperties(next)
  }

  const handleDeleteProperty = (propertyId) => {
    const next = properties.filter((property) => property.id !== propertyId)
    setProperties(next)
    saveProperties(next)
  }

  const handleUpdateProperty = (propertyId, updates) => {
    const next = properties.map((property) =>
      property.id === propertyId ? { ...property, ...updates } : property,
    )
    setProperties(next)
    saveProperties(next)
  }

  return (
    <div className="app-shell" dir="rtl"> {/* 👈 عربي */}
      <TopNav lang={lang} setLang={setLang} />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home properties={properties} lang={lang} />} />

          <Route
            path="/add"
            element={
              <AddProperty
                properties={properties}
                onAddProperty={handleAddProperty}
                lang={lang}
              />
            }
          />

          <Route
            path="/map"
            element={<MapView properties={properties} lang={lang} />}
          />

          <Route
            path="/properties/:propertyId"
            element={
              <PropertyDetails
                properties={properties}
                onDeleteProperty={handleDeleteProperty}
                onUpdateProperty={handleUpdateProperty}
                lang={lang}
              />
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App