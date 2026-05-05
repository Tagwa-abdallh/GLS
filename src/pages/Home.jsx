import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard.jsx'
import PropertyList from '../components/PropertyList.jsx'
import {
  getDecisionAnalysis,
  getPrioritySummary,
  getSmartInsights,
} from '../utils/analysis.js'

const Home = ({ properties }) => {
  const builtCount = properties.filter((p) => p.status === 'Built').length
  const summary = getPrioritySummary(properties)

  const analyzedProperties = properties.map((property) => ({
    property,
    analysis: getDecisionAnalysis(property, properties),
  }))

  const priorityProperties = analyzedProperties
    .filter((item) => item.analysis.priorityLevel !== 'Standard')
    .sort((a, b) => {
      const score = { 'Very High': 2, High: 1, Standard: 0 }
      return score[b.analysis.priorityLevel] - score[a.analysis.priorityLevel]
    })

  const recentProperties = properties.slice(0, 4)
  const smartInsights = getSmartInsights(properties)

  return (
    <section className="home rtl">

      {/* HERO */}
      <div className="hero">
        <div className="hero-content">
          <h1>نظام إدارة وتحليل العقارات</h1>
          <p>
            منصة ذكية لتسجيل العقارات وتحليل الأولويات واتخاذ قرارات مدروسة
          </p>

          <div className="hero-actions">
            <Link className="btn primary" to="/add">
              ➕ إضافة عقار
            </Link>
            <Link className="btn outline" to="/map">
               عرض الخريطة
            </Link>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <StatCard label="إجمالي العقارات" value={properties.length} />
        <StatCard label="المباني" value={builtCount} />
        <StatCard label="غير مبني" value={summary.unbuilt} />
        <StatCard label="أولوية عالية" value={summary.highPriority} />
        <StatCard label="أولوية قصوى" value={summary.veryHighPriority} />
      </div>

      {/* INSIGHTS */}
      <div className="card">
        <h2> التحليلات الذكية</h2>
        <ul className="insights-list">
          {smartInsights.map((line, i) => (
            <li key={i}> {line}</li>
          ))}
        </ul>
      </div>

      {/* GRID */}
      <div className="grid">
        {/* PRIORITY */}
        <div className="card">
          <h2> المناطق ذات الأولوية</h2>

          {!priorityProperties.length ? (
            <p className="muted">لا توجد بيانات حالياً</p>
          ) : (
            priorityProperties.slice(0, 3).map(({ property, analysis }) => (
              <div key={property.id} className="item-card">
                <h3>{property.ownerName}</h3>

                <div className="badges">
                  <span className={`badge ${property.status}`}>
                    {property.status === 'Built' ? 'مبني' : 'غير مبني'}
                  </span>
                  <span className="badge priority">
                    {analysis.priorityLevel === 'Very High'
                      ? 'أولوية قصوى'
                      : analysis.priorityLevel === 'High'
                      ? 'أولوية عالية'
                      : 'عادية'}
                  </span>
                </div>

                <p> {analysis.recommendation}</p>
                <p className="muted"> {analysis.reasonSummary}</p>
              </div>
            ))
          )}
        </div>

        {/* RECENT */}
        <div className="card">
          <h2>أحدث العقارات</h2>
          <PropertyList
            properties={recentProperties}
            emptyMessage="لا توجد عقارات محفوظة"
          />
        </div>
      </div>
    </section>
  )
}

export default Home