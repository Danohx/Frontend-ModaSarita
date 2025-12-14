import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import styles from '../styles/LoginPage.module.css'
import { useAuth } from '../context/AuthContext'

// Definimos los estados posibles de la pantalla
type LoginMode = 
  | 'password'             // Login normal
  | 'magiclink'            // Login con enlace mágico
  | 'magiclink-sent'       // Mensaje éxito enlace mágico
  | 'forgot-password'      // FORMULARIO para pedir recuperación
  | 'forgot-password-sent' // MENSAJE éxito recuperación

const API_URL = import.meta.env.VITE_API_URL;

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Inicializamos en modo password
  const [mode, setMode] = useState<LoginMode>('password')

  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ correo: '', contrasena: '' })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const [requires2FA, setRequires2FA] = useState(false)
  const [tempToken, setTempToken] = useState('')
  const [otpCode, setOtpCode] = useState('')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 1. LOGIN
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
          correo: formData.correo,
          contrasena: formData.contrasena,
      })
      if (response.data.requires2FA) {
        setRequires2FA(true)
        setTempToken(response.data.tempToken)
        setIsLoading(false)
      } else {
        const { accessToken, refreshToken, user } = response.data;
        login(accessToken, refreshToken, user || { nombre: 'Usuario' })
        navigate('/')
      }
    } catch (err: any) {
      setIsLoading(false)
      if (err.response?.status === 429) {
          setError(err.response.data?.mensaje || "Demasiados intentos. Intenta más tarde.");
      } else {
          setError(err.response?.data?.mensaje || 'Error al iniciar sesión.')
      }
    }
  }

  // 2. MAGIC LINK
  const handleMagicLinkSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await axios.post(`${API_URL}/auth/magic-link`, { correo: formData.correo })
      setIsLoading(false)
      setMode('magiclink-sent')
    } catch (err: any) {
      setIsLoading(false)
      setError(err.response?.data?.mensaje || 'Error al enviar el enlace.')
    }
  }

  // 3. VERIFICAR 2FA
  const handle2FASubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const response = await axios.post(`${API_URL}/auth/2fa-verify`, { tempToken, otpCode })
      const { accessToken, refreshToken, user } = response.data;
      login(accessToken, refreshToken, user || { nombre: 'Usuario' })
      navigate('/')
    } catch (err: any) {
      setIsLoading(false)
      setError(err.response?.data?.mensaje || 'Error al verificar 2FA.')
    }
  }

  // 4. RECUPERAR CONTRASEÑA (Enviar correo)
  const handleForgotPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { correo: formData.correo })
      setIsLoading(false)
      setMode('forgot-password-sent') 
    } catch (err: any) {
      setIsLoading(false)
      // 👇 NUEVO: Manejo específico para cuando superas el límite de intentos
      if (err.response?.status === 429) {
          setError("Has superado el límite de intentos. Por favor espera unos minutos.");
      } else {
          setError(err.response?.data?.mensaje || 'Error al solicitar recuperación.')
      }
    }
  }

  // --- RENDERIZADO ---

  // A. VISTA DE 2FA
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

  // B. ÉXITO MAGIC LINK
  if (mode === 'magiclink-sent') {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <span className={`material-symbols-outlined ${styles.successIcon}`}>mark_email_read</span>
          <h1>Revisa tu correo</h1>
          <p>Te hemos enviado un enlace mágico a <strong>{formData.correo}</strong>.</p>
          <button onClick={() => setMode('password')} className={styles.secondaryButton}>
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  // C. ÉXITO RECUPERACIÓN (Aquí está el cambio que pediste)
  if (mode === 'forgot-password-sent') {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <span className={`material-symbols-outlined ${styles.successIcon}`}>lock_reset</span>
          <h1>Solicitud enviada</h1>
          <p>Si el correo <strong>{formData.correo}</strong> existe, recibirás instrucciones.</p>
          <p className={styles.smallText}>(Revisa spam por si acaso)</p>
          
          {/* 👇 NUEVO: Botón para limpiar y probar otro correo rápidamente */}
          <button 
            onClick={() => {
                setFormData(prev => ({ ...prev, correo: '' })); // Limpiamos el correo
                setMode('forgot-password'); // Volvemos al formulario
            }} 
            className={styles.submitButton} // Usamos estilo primario para invitar a la acción si es testing
            style={{ marginBottom: '10px' }}
          >
            Intentar con otro correo
          </button>

          <button onClick={() => setMode('password')} className={styles.secondaryButton}>
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  // D. FORMULARIO RECUPERACIÓN (Input)
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
                value={formData.correo} 
                onChange={handleChange} 
                required 
              />
            </div>
            {error && <div className={styles.formMessageError}>{error}</div>}
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>

          {/* Botón cancelar: Vuelve al login */}
          <button onClick={() => setMode('password')} className={styles.secondaryButton} style={{marginTop: '10px'}}>
            Cancelar / Volver
          </button>
        </div>
      </div>
    )
  }

  // E. VISTA PRINCIPAL (LOGIN)
  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <h1>Iniciar sesión</h1>
        <p>Bienvenido de nuevo</p>

        {mode === 'password' ? (
          <form onSubmit={handlePasswordSubmit}>
            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>mail</span>
              <input type="email" name="correo" value={formData.correo} placeholder="Correo electrónico" onChange={handleChange} required />
            </div>
            
            <div className={styles.inputGroup} style={{ position: 'relative' }}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>lock</span>
              <input 
                type={showPassword ? "text" : "password"} 
                name="contrasena" 
                placeholder="Contraseña" 
                onChange={handleChange} 
                required 
              />
              <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                      background: 'none', border: 'none', cursor: 'pointer', 
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      color: '#666'
                  }}
              >
                  <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
              </button>
            </div>
            
            {/* AQUÍ ESTÁ LA SOLUCIÓN:
                Este botón establece explícitamente el modo 'forgot-password'.
                Esto garantiza que siempre se muestre el formulario, 
                incluso si antes se mostró el mensaje de éxito. */}
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
          // Vista Magic Link Form
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