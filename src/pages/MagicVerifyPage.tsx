import { useEffect, useState } from 'react'
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/MagicVerifyPage.module.css'
import loginStyles from '../styles/LoginPage.module.css'

const API_URL = import.meta.env.VITE_API_URL;
const MagicVerifyPage = () => {
  const { token } = useParams()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [requires2FA, setRequires2FA] = useState(false)
  const [tempToken, setTempToken] = useState('')
  const [otpCode, setOtpCode] = useState('')
  
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setError('Token no proporcionado.')
      setIsLoading(false)
      return
    }

    const verifyToken = async () => {
      try {
        const response = await axios.post(
          `${API_URL}/auth/magic-verify`,
          { token }
        )

        if (response.data.requires2FA) {
          setRequires2FA(true)
          setTempToken(response.data.tempToken)
          setIsLoading(false)
        } else {
          const { accessToken, refreshToken, user } = response.data;
          login(accessToken, refreshToken, user || { nombre: 'Usuario' })
          navigate('/', { replace: true })
        }
      } catch (err: any) {
        setIsLoading(false)
        setError(err.response?.data?.mensaje || 'Enlace inválido o expirado.')
      }
    }

    verifyToken()
  }, [token, login, navigate])

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const response = await axios.post(
        `${API_URL}/auth/2fa-verify`,
        { tempToken, otpCode }
      )
      const { accessToken, refreshToken, user } = response.data;
      login(accessToken, refreshToken, user || { nombre: 'Usuario' })
      navigate('/', { replace: true })
      
    } catch (err: any) {
      setIsLoading(false)
      setError(err.response?.data?.mensaje || 'Error al verificar 2FA.')
    }
  }

  if (isLoading) {
    return (
      <div className={styles.verifyPage}>
        <div className={styles.verifyCard}>
          <h1>Verificando...</h1>
          <p>Estamos validando tu enlace mágico.</p>
        </div>
      </div>
    )
  }

  if (requires2FA) {
    return (
      <div className={styles.verifyPage}>
        <div className={styles.verifyCard}>
          <h1>Verificación 2FA</h1>
          <p>¡Enlace verificado! Ingresa el código de tu app de autenticación.</p>
          <form onSubmit={handle2FASubmit}>
            <div className={loginStyles.inputGroup}> {/* Reutiliza estilo */}
              <span className={`material-symbols-outlined ${loginStyles.inputIcon}`}>key</span>
              <input
                type="text"
                placeholder="Código de 6 dígitos"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
              />
            </div>
            {error && <div className={loginStyles.formMessageError}>{error}</div>}
            <button type="submit" className={loginStyles.submitButton} disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Verificar e Ingresar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.verifyPage}>
        <div className={styles.verifyCard}>
          <h1 className={styles.errorTitle}>Error al verificar</h1>
          <p>{error}</p>
          <Link to="/login" className={loginStyles.submitButton} style={{textDecoration: 'none'}}>
            Volver al Login
          </Link>
        </div>
      </div>
    )
  }

  return <Navigate to="/" replace />
}

export default MagicVerifyPage