import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import styles from '../styles/LoginPage.module.css'
import { useAuth } from '../context/AuthContext'

type LoginMode = 'password' | 'magiclink' | 'magiclink-sent'

const API_URL = import.meta.env.VITE_API_URL;
const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [mode, setMode] = useState<LoginMode>('password')

  const [formData, setFormData] = useState({ correo: '', contrasena: '' })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const [requires2FA, setRequires2FA] = useState(false)
  const [tempToken, setTempToken] = useState('')
  const [otpCode, setOtpCode] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          correo: formData.correo,
          contrasena: formData.contrasena,
        }
      )
      if (response.data.requires2FA) {
        setRequires2FA(true)
        setTempToken(response.data.tempToken)
        setIsLoading(false)
      } else {
        login(response.data.accessToken)
        navigate('/')
      }
    } catch (err: any) {
      setIsLoading(false)
      setError(err.response?.data?.mensaje || 'Error al iniciar sesión.')
    }
  }

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await axios.post(`${API_URL}/auth/magic-link`, {
        correo: formData.correo,
      })
      setIsLoading(false)
      setMode('magiclink-sent')
    } catch (err: any) {
      setIsLoading(false)
      setError(err.response?.data?.mensaje || 'Error al enviar el enlace.')
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const response = await axios.post(
        `${API_URL}/auth/2fa-verify`,
        { tempToken, otpCode }
      )
      login(response.data.accessToken)
      navigate('/')
    } catch (err: any) {
      setIsLoading(false)
      setError(err.response?.data?.mensaje || 'Error al verificar 2FA.')
    }
  }

  if (requires2FA) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <h1>Verificación 2FA</h1>
          <p>Ingresa el código de tu app de autenticación</p>
          <form onSubmit={handle2FASubmit}>
            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>key</span>
              <input type="text" placeholder="Código de 6 dígitos" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required />
            </div>
            {error && <div className={styles.formMessageError}>{error}</div>}
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Verificar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (mode === 'magiclink-sent') {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <span className={`material-symbols-outlined ${styles.successIcon}`}>mark_email_read</span>
          <h1>Revisa tu correo</h1>
          <p>Te hemos enviado un enlace mágico a <strong>{formData.correo}</strong>.</p>
          <p className={styles.smallText}>(El enlace expira en 5 minutos)</p>
          <button onClick={() => setMode('password')} className={styles.secondaryButton}>
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <h1>Iniciar sesión</h1>
        <p>Bienvenido de nuevo a tu boutique de confianza</p>

        {mode === 'password' ? (
          <form onSubmit={handlePasswordSubmit}>
            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>mail</span>
              <input type="email" name="correo" placeholder="Correo electrónico" onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>lock</span>
              <input type="password" name="contrasena" placeholder="Contraseña" onChange={handleChange} required />
            </div>
            <a href="#" className={styles.forgotPassword}>¿Olvidaste tu contraseña?</a>
            {error && <div className={styles.formMessageError}>{error}</div>}
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMagicLinkSubmit}>
            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>mail</span>
              <input type="email" name="correo" placeholder="Correo electrónico" onChange={handleChange} required />
            </div>
            <p className={styles.smallText}>Te enviaremos un enlace para iniciar sesión sin contraseña.</p>
            {error && <div className={styles.formMessageError}>{error}</div>}
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar enlace mágico'}
            </button>
          </form>
        )}

        <hr className={styles.divider} />

        <button onClick={() => setMode(mode === 'password' ? 'magiclink' : 'password')} className={styles.secondaryButton}>
          {mode === 'password' ? 'Usar enlace mágico' : 'Usar contraseña'}
        </button>

        <div className={styles.registerLink}>
          ¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage