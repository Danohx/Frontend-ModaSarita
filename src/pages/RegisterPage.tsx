import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import styles from '../styles/LoginPage.module.css'

const API_URL = import.meta.env.VITE_API_URL;

const RegisterPage = () => {
  const navigate = useNavigate()
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    telefono: '',
    edad: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
  })
  
  // SOLUCIÓN 1: Definimos que puede ser string O null
  const [error, setError] = useState<string | null>(null) 
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // SOLUCIÓN 2: Tipamos el evento de cambio (input)
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // SOLUCIÓN 3: Tipamos el evento de envío (form)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsLoading(true)

    try {
      const { confirmarContrasena, ...dataToSubmit } = formData;
      await axios.post(
        `${API_URL}/auth/register`,
        dataToSubmit
      )

      setSuccess('Usuario registrado exitosamente. Redirigiendo al login...')
      setIsLoading(false)
      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (err: any) {
      setIsLoading(false)
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data;

        if (data.errors && Array.isArray(data.errors)) {
            // Mapeamos los errores para que sea un solo string
            setError(data.errors.map((e: any) => e.msg).join(' | '));
        } else {
            setError(data.mensaje || 'Error al registrar la cuenta.')
        }

      } else {
        setError('Ocurrió un error inesperado.')
      }
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <h1>Crear una cuenta</h1>
        <p>Tu nueva boutique de confianza te espera</p>
        <form onSubmit={handleSubmit}>
          {/* ... (El resto del JSX se mantiene igual) ... */}
          
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>person</span>
              <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>badge</span>
              <input type="text" name="apellidoPaterno" placeholder="Apellido Paterno" onChange={handleChange} required />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>badge</span>
              <input type="text" name="apellidoMaterno" placeholder="Apellido Materno" onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>phone</span>
              <input type="tel" name="telefono" placeholder="Teléfono" onChange={handleChange} />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <span className={`material-symbols-outlined ${styles.inputIcon}`}>cake</span>
            <input type="number" name="edad" placeholder="Edad" onChange={handleChange} />
          </div>

          <hr className={styles.divider} />

          <div className={styles.inputGroup}>
            <span className={`material-symbols-outlined ${styles.inputIcon}`}>mail</span>
            <input type="email" name="correo" placeholder="Correo electrónico" onChange={handleChange} required />
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

          <div className={styles.inputGroup} style={{ position: 'relative' }}>
            <span className={`material-symbols-outlined ${styles.inputIcon}`}>password</span>
            <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmarContrasena" 
                placeholder="Confirmar contraseña" 
                onChange={handleChange} 
                required 
            />
             <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ 
                    background: 'none', border: 'none', cursor: 'pointer', 
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    color: '#666'
                }}
            >
                <span className="material-symbols-outlined">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
            </button>
          </div>

          {error && <div className={styles.formMessageError} style={{ whiteSpace: 'pre-wrap' }}>{error}</div>}
          {success && <div className={styles.formMessageSuccess}>{success}</div>}

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className={styles.registerLink}>
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage