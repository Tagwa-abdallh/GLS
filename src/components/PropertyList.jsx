import { Link } from 'react-router-dom'

const PropertyList = ({ properties, emptyMessage }) => {
  if (!properties.length) {
    return <p className="empty fade-in">{emptyMessage}</p>
  }

  return (
    <ul className="property-grid fade-in">

      {properties.map((property) => {
        const isPriority = property.status === 'Unbuilt'

        return (
          <li key={property.id} className="property-card hover-pop">

            {/* INFO */}
            <div className="property-info">
              <h3>{property.ownerName}</h3>

              <p> {property.phone || 'لا يوجد رقم'}</p>

              <p> عدد نقاط الحدود: {property.polygon?.length || 0}</p>

              <Link
                className="btn small"
                to={`/properties/${property.id}`}
              >
                عرض التفاصيل
              </Link>
            </div>

            {/* TAGS */}
            <div className="tags">
              <span
                className={
                  property.status === 'Built'
                    ? 'tag built'
                    : 'tag unbuilt'
                }
              >
                {property.status === 'Built' ? 'مبني' : 'غير مبني'}
              </span>

              {isPriority && (
                <span className="tag danger"> أولوية عالية</span>
              )}
            </div>

          </li>
        )
      })}

    </ul>
  )
}

export default PropertyList