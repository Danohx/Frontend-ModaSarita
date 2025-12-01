import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import styles from '../styles/LoginPage.module.css'
import { useAuth } from '../context/AuthContext'

// 1. Agregamos los nuevos modos para la recuperación
type LoginMode = 
  | 'password' 
  | 'magiclink' 
  | 'magiclink-sent' 
  | 'forgot-password'      // <--- Formulario para pedir correo
  | 'forgot-password-sent' // <--- Mensaje de éxito

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

  // ===== LOGIN NORMAL =====
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
      // Manejo especial para el 429 (Rate Limit) que configuramos antes
      if (err.response?.status === 429) {
          setError(err.response.data?.mensaje || "Demasiados intentos. Intenta más tarde.");
      } else {
          setError(err.response?.data?.mensaje || 'Error al iniciar sesión.')
      }
    }
  }

  // ===== MAGIC LINK =====
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

  // ===== 2FA VERIFY =====
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

  // ===== NUEVO: RECUPERAR CONTRASEÑA =====
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      // Llamamos al endpoint que creamos en el paso anterior
      await axios.post(`${API_URL}/auth/forgot-password`, {
        correo: formData.correo,
      })
      setIsLoading(false)
      setMode('forgot-password-sent') // Cambiamos a la vista de éxito
    } catch (err: any) {
      setIsLoading(false)
      setError(err.response?.data?.mensaje || 'Error al solicitar recuperación.')
    }
  }

  // ---------------- RENDERIZADO ----------------

  // 1. VISTA DE 2FA
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

  // 2. VISTA ÉXITO MAGIC LINK
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

  // 3. VISTA ÉXITO RECUPERACIÓN (NUEVO)
  if (mode === 'forgot-password-sent') {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <span className={`material-symbols-outlined ${styles.successIcon}`}>lock_reset</span>
          <h1>Solicitud enviada</h1>
          <p>Si el correo <strong>{formData.correo}</strong> existe, recibirás instrucciones para restablecer tu contraseña.</p>
          <p className={styles.smallText}>(Revisa tu bandeja de spam)</p>
          <button onClick={() => setMode('password')} className={styles.secondaryButton}>
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  // 4. VISTA FORMULARIO RECUPERACIÓN (NUEVO)
  if (mode === 'forgot-password') {
    return (
        <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <h1>Recuperar Contraseña</h1>
          <p>Ingresa tu correo para buscar tu cuenta.</p>

          <form onSubmit={handleForgotPasswordSubmit}>
            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>mail</span>
              <input 
                type="email" 
                name="correo" 
                placeholder="Correo electrónico" 
                value={formData.correo} // Mantiene lo que el usuario ya escribió
                onChange={handleChange} 
                required 
              />
            </div>
            
            {error && <div className={styles.formMessageError}>{error}</div>}
            
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </form>

          <button onClick={() => setMode('password')} className={styles.secondaryButton} style={{marginTop: '10px'}}>
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  // 5. VISTA PRINCIPAL (LOGIN / MAGIC LINK)
  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <h1>Iniciar sesión</h1>
        <p>Bienvenido de nuevo a tu boutique de confianza</p>

        {mode === 'password' ? (
          <form onSubmit={handlePasswordSubmit}>
            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>mail</span>
              <input type="email" name="correo" value={formData.correo} placeholder="Correo electrónico" onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>lock</span>
              <input type="password" name="contrasena" placeholder="Contraseña" onChange={handleChange} required />
            </div>
            
            {/* AQUÍ ESTÁ EL CAMBIO CLAVE EN EL LINK */}
            <button 
                type="button" 
                className={styles.forgotPassword} 
                onClick={() => setMode('forgot-password')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
            >
                ¿Olvidaste tu contraseña?
            </button>

            {error && <div className={styles.formMessageError}>{error}</div>}
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMagicLinkSubmit}>
            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>mail</span>
              <input type="email" name="correo" value={formData.correo} placeholder="Correo electrónico" onChange={handleChange} required />
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