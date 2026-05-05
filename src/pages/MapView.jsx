import { useMemo, useState } from 'react'
import PropertyList from '../components/PropertyList.jsx'
import PropertyMap from '../components/PropertyMap.jsx'
import StatCard from '../components/StatCard.jsx'
import { getPrioritySummary } from '../utils/analysis.js'

const MapView = ({ properties }) => {
  const [filter, setFilter] = useState('all')
  const [showPropertiesLayer, setShowPropertiesLayer] = useState(true)
  const [showServicesLayer, setShowServicesLayer] = useState(false)

  const filteredProperties = useMemo(() => {
    if (filter === 'all') return properties
    return properties.filter((p) => p.status === filter)
  }, [properties, filter])

  const summary = useMemo(() => getPrioritySummary(properties), [properties])

  return (
    <section className="page rtl map-page fade-in">

      {/* HEADER */}
      <div className="page-header modern-header">
        <div>
          <h1> عرض الخريطة</h1>
          <p className="muted-text">
            عرض حدود الأراضي وتحليل المناطق ذات الأولوية
          </p>
        </div>

        <div className="legend">
          <div className="legend-item">
            <span className="legend-dot built" />
            <span>مبني</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot unbuilt" />
            <span>غير مبني</span>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card filters-card slide-up">
        <div className="filters-row">
          <span className="filter-label">التصفية</span>

          <div className="filter-buttons">
            {[
              { key: 'all', label: 'الكل' },
              { key: 'Built', label: 'مبني' },
              { key: 'Unbuilt', label: 'غير مبني' },
            ].map((item) => (
              <button
                key={item.key}
                className={`btn-chip ${filter === item.key ? 'active' : ''}`}
                onClick={() => setFilter(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filters-row">
          <span className="filter-label">الطبقات</span>

          <div className="filter-buttons">
            <button
              className={`btn-chip ${showPropertiesLayer ? 'active' : ''}`}
              onClick={() => setShowPropertiesLayer((v) => !v)}
            >
              العقارات
            </button>

            <button
              className={`btn-chip ${showServicesLayer ? 'active' : ''}`}
              onClick={() => setShowServicesLayer((v) => !v)}
            >
              الخدمات
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="stat-grid responsive-grid">
        <StatCard label="إجمالي العقارات" value={summary.total} />
        <StatCard label="غير مبني" value={summary.unbuilt} />
        <StatCard label="أولوية عالية" value={summary.highPriority} />
        <StatCard
          label="مناطق حرجة"
          value={summary.veryHighPriority}
          note="تجمعات غير مبنية"
        />
      </div>

      {/* MAP */}
      <div className="card map-card slide-up">
        <PropertyMap
          properties={filteredProperties}
          analysisContextProperties={properties}
          showPropertiesLayer={showPropertiesLayer}
          showServicesLayer={showServicesLayer}
        />
      </div>

      {/* LIST */}
      <div className="card slide-up ">
        <div className="panel-header">
          <h2> سجل العقارات</h2>
          <span className="tag live">مباشر</span>
        </div>

        <PropertyList
          properties={filteredProperties}
          emptyMessage="لا توجد عقارات مسجلة"
        />
      </div>

    </section>
  )
}

export default MapView