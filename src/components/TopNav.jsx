import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'

const navItems = [
  { to: '/', label: 'لوحة التحكم' },
  { to: '/add', label: 'إضافة عقار' },
  { to: '/map', label: 'الخريطة' },
]

const TopNav = () => {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`topbar ${scrolled ? 'scrolled' : ''}`}>

      {/* BRAND */}
      <div className="brand">
        <div className="brand-mark">EGLS</div>
        <div>
          <p className="brand-title">نظام إدارة الأراضي</p>
          <p className="brand-subtitle">تسجيل وتحليل الأراضي</p>
        </div>
      </div>

      {/* DESKTOP NAV */}
      <nav className="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* STATUS */}
      <div className="status-pill">Local Storage</div>

      {/* MOBILE BUTTON */}
      <button className="menu-btn" onClick={() => setOpen(!open)}>
        ☰
      </button>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${open ? 'show' : ''}`}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className="mobile-link"
          >
            {item.label}
          </NavLink>
        ))}
      </div>

    </header>
  )
}

export default TopNav