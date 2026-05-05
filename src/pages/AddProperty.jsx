import { useState, useEffect } from 'react'
import DrawMap from '../components/DrawMap.jsx'
import PropertyList from '../components/PropertyList.jsx'
import { useLocation } from 'react-router-dom'
import '../App.css'

const statusOptions = [
  { value: 'Built', label: 'مبني' },
  { value: 'Unbuilt', label: 'غير مبني' },
]

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `prop-${Date.now()}`
}

const AddProperty = ({ onAddProperty, properties }) => {
  const [form, setForm] = useState({
    ownerName: '',
    phone: '',
    status: 'Built',
    documentName: '',
    latitude: '',
    longitude: '',
  })

  const [polygon, setPolygon] = useState(null)
  const [mapCenter, setMapCenter] = useState(null)
  const [notice, setNotice] = useState(null)
  const [mapKey, setMapKey] = useState(0)

  const location = useLocation()
  const initialPolygon = location?.state?.polygon || null

  useEffect(() => {
    if (initialPolygon) {
      setPolygon(initialPolygon)
      setNotice({ type: 'info', text: 'تم تحميل حدود العقار من الخريطة' })
    }
  }, [initialPolygon])

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.ownerName.trim() || !form.phone.trim()) {
      setNotice({ type: 'error', text: 'الاسم ورقم الهاتف مطلوبين' })
      return
    }

    if (!polygon || polygon.length < 3) {
      setNotice({ type: 'error', text: 'ارسم حدود العقار أولاً' })
      return
    }

    const property = {
      id: createId(),
      ownerName: form.ownerName,
      phone: form.phone,
      status: form.status,
      documentName: form.documentName,
      polygon,
      createdAt: new Date().toISOString(),
    }

    onAddProperty(property)

    setForm({
      ownerName: '',
      phone: '',
      status: 'Built',
      documentName: '',
      latitude: '',
      longitude: '',
    })

    setPolygon(null)
    setNotice({ type: 'success', text: 'تم حفظ العقار بنجاح 🎉' })
    setMapKey((v) => v + 1)
  }

  const goToCoordinates = () => {
    const lat = parseFloat(form.latitude)
    const lng = parseFloat(form.longitude)

    if (!lat || !lng) {
      setNotice({ type: 'error', text: 'إحداثيات غير صحيحة' })
      return
    }

    setMapCenter([lat, lng])
    setNotice({ type: 'info', text: 'تم تحديد الموقع على الخريطة' })
  }

  return (
    <section className="page rtl">

      {/* Header */}
      <div className="hero fade-in">
        <h1> نظام إدارة العقارات</h1>
        <p>إضافة وتتبع العقارات باستخدام الخرائط الذكية</p>
      </div>

      <div className="grid">

        {/* FORM */}
        <div className="card glass slide-up">
          <h2>➕ إضافة عقار جديد</h2>

          <form onSubmit={handleSubmit} className="form">

            <input
              placeholder="اسم المالك"
              value={form.ownerName}
              onChange={(e) => update('ownerName', e.target.value)}
            />

            <input
              placeholder="رقم الهاتف"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />

            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <input
              type="file"
              onChange={(e) =>
                update('documentName', e.target.files[0]?.name)
              }
            />

            <div className="row">
              <input
                placeholder="خط العرض"
                value={form.latitude}
                onChange={(e) => update('latitude', e.target.value)}
              />

              <input
                placeholder="خط الطول"
                value={form.longitude}
                onChange={(e) => update('longitude', e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn secondary"
              onClick={goToCoordinates}
            >
               عرض على الخريطة
            </button>

            {notice && (
              <div className={`alert ${notice.type} fade-in`}>
                {notice.text}
              </div>
            )}

            <button type="submit" className="btn primary pulse">
              حفظ العقار
            </button>

          </form>
        </div>

        {/* MAP */}
        <div className="card slide-up">
          <h2> رسم حدود العقار</h2>

          <DrawMap
            key={mapKey}
            initialPolygon={initialPolygon}
            initialCenter={mapCenter}
            onPolygonChange={setPolygon}
          />
        </div>
      </div>

      {/* LIST */}
      <div className="card slide-up">
        <h2> العقارات المسجلة</h2>

        <PropertyList
          properties={properties}
          emptyMessage="لا توجد عقارات حتى الآن"
        />
      </div>
    </section>
  )
}

export default AddProperty