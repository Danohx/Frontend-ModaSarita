import { Link, useNavigate, NavLink } from 'react-router-dom'
import styles from '../styles/Navbar.module.css'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated, logout } = useAuth()
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.logo}>
          <span className={`material-symbols-outlined ${styles.logoIcon}`}>
            diamond
          </span>
          Moda Sarita
        </Link>
        <ul className={styles.navMenu}>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
              end
            >
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/catalogo"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              Catálogo
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/ofertas"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              Ofertas
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contacto"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              Contacto
            </NavLink>
          </li>
        </ul>

        <div className={styles.navActions}>
          <button className={`${styles.iconButton} ${styles.searchIcon}`}>
            <span className="material-symbols-outlined">search</span>
          </button>

          <button 
            className={styles.iconButton} 
            onClick={toggleTheme}
            aria-label="Cambiar tema"
          >
            {theme === 'light' ? (
              <span className="material-symbols-outlined">dark_mode</span>
            ) : (
              <span className="material-symbols-outlined">light_mode</span>
            )}
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/perfil" className={styles.iconButton}>
                <span className="material-symbols-outlined">person</span>
              </Link>
              <button onClick={handleLogout} className={styles.iconButton} title="Cerrar sesión">
                <span className="material-symbols-outlined">logout</span>
              </button>
            </>
          ) : (
            <div className={styles.authLinks}>
              <Link to="/login" className={styles.loginButton}>
                Iniciar sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar