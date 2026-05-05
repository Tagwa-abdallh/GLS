import { motion } from 'framer-motion'

const StatCard = ({ label, value, note, details = [] }) => {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <p className="stat-label">{label}</p>

      <p className="stat-value">{value}</p>

      {note ? <p className="stat-note">{note}</p> : null}

      {details.length ? (
        <div className="stat-detail-list">
          {details.map((line, index) => (
            <p key={index} className="stat-detail-line">
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </motion.div>
  )
}

export default StatCard