import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DrawMap from '../components/DrawMap.jsx'
import PropertyMap from '../components/PropertyMap.jsx'
import { formatArea, getDecisionAnalysis } from '../utils/analysis.js'

const statusOptions = [
  { value: 'Built', label: 'مبني' },
  { value: 'Unbuilt', label: 'غير مبني' },
]

const PropertyDetails = ({ properties, onDeleteProperty, onUpdateProperty }) => {
  const { propertyId } = useParams()
  const navigate = useNavigate()

  const property = useMemo(
    () => properties.find((p) => p.id === propertyId),
    [properties, propertyId]
  )

  const [isEditing, setIsEditing] = useState(false)
  const [isEditingBoundary, setIsEditingBoundary] = useState(false)
  const [editedPolygon, setEditedPolygon] = useState(null)

  const [formState, setFormState] = useState({
    ownerName: '',
    phone: '',
    status: 'Built',
  })

  useEffect(() => {
    if (!property) return
    setFormState({
      ownerName: property.ownerName,
      phone: property.phone,
      status: property.status,
    })
    setEditedPolygon(property.polygon)
  }, [property])

  if (!property) {
    return (
      <section className="page fade-in rtl">
        <div className="card">
          <h2> العقار غير موجود</h2>
          <p>هذا العقار غير موجود في النظام.</p>
          <Link className="btn primary" to="/map">
            العودة للخريطة
          </Link>
        </div>
      </section>
    )
  }

  const analysis = getDecisionAnalysis(property, properties)
  const priorityLabel = analysis.priorityLevel

  const handleDelete = () => {
    if (!window.confirm('هل تريد حذف العقار نهائياً؟')) return
    onDeleteProperty(property.id)
    navigate('/map')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    onUpdateProperty(property.id, {
      ownerName: formState.ownerName,
      phone: formState.phone,
      status: formState.status,
    })

    setIsEditing(false)
  }

  const handleSaveBoundary = () => {
    if (!editedPolygon || editedPolygon.length < 3) return
    onUpdateProperty(property.id, { polygon: editedPolygon })
    setIsEditingBoundary(false)
  }

  return (
    <section className="page rtl fade-in">

      {/* HEADER */}
      <div className="header slide-up">
        <div>
          <h1>تفاصيل العقار</h1>
          <p>رقم التعريف: {property.id}</p>
        </div>

        <div className="actions">
          <button className="btn secondary" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'إلغاء التعديل' : 'تعديل'}
          </button>

          <button className="btn danger" onClick={handleDelete}>
            حذف
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid-two">

        {/* INFO */}
        <div className="card slide-up">
          <h2>معلومات العقار</h2>

          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <input
                value={formState.ownerName}
                onChange={(e) =>
                  setFormState({ ...formState, ownerName: e.target.value })
                }
                placeholder="اسم المالك"
              />

              <input
                value={formState.phone}
                onChange={(e) =>
                  setFormState({ ...formState, phone: e.target.value })
                }
                placeholder="رقم الهاتف"
              />

              <select
                value={formState.status}
                onChange={(e) =>
                  setFormState({ ...formState, status: e.target.value })
                }
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              <button className="btn primary">حفظ التعديلات</button>
            </form>
          ) : (
            <div className="info">
              <p> المالك: {property.ownerName}</p>
              <p> الهاتف: {property.phone}</p>
              <p> الحالة: {property.status}</p>
              <p> المستند: {property.documentName || 'غير متوفر'}</p>
            </div>
          )}
        </div>

        {/* MAP */}
        <div className="card slide-up">
          <h2>الخريطة</h2>

          <PropertyMap
            properties={[property]}
            analysisContextProperties={properties}
            showDetailsLink={false}
          />

          <button
            className="btn secondary"
            onClick={() => setIsEditingBoundary(!isEditingBoundary)}
          >
            {isEditingBoundary ? 'إغلاق المحرر' : 'تعديل الحدود'}
          </button>

          {isEditingBoundary && (
            <>
              <DrawMap
                initialPolygon={editedPolygon}
                onPolygonChange={setEditedPolygon}
              />

              <button className="btn primary" onClick={handleSaveBoundary}>
                حفظ الحدود
              </button>
            </>
          )}
        </div>
      </div>

      {/* ANALYSIS */}
      <div className="card slide-up">
        <h2>تحليل القرار</h2>

        <div className="analysis-grid">
          <p> التحليل: {analysis.decision}</p>
          <p> التوصية: {analysis.recommendation}</p>
          <p> الأولوية: {priorityLabel}</p>
          <p> المساحة: {formatArea(analysis.areaSqm)}</p>
        </div>
      </div>
    </section>
  )
}

export default PropertyDetails