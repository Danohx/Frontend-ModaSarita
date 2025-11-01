import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import styles from '../styles/LoginPage.module.css'

const API_URL = import.meta.env.VITE_API_URL;
const RegisterPage = () => {
  const navigate = useNavigate()
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
  
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
      const response = await axios.post(
        `${API_URL}/auth/register`,
        dataToSubmit
      )

      setSuccess(response.data.mensaje + ' Redirigiendo al login...')
      setIsLoading(false)
      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (err: any) {
      setIsLoading(false)
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.mensaje || 'Error al registrar la cuenta.')
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
          <div className={styles.inputGroup}>
            <span className={`material-symbols-outlined ${styles.inputIcon}`}>lock</span>
            <input type="password" name="contrasena" placeholder="Contraseña" onChange={handleChange} required />
          </div>
          <div className={styles.inputGroup}>
            <span className={`material-symbols-outlined ${styles.inputIcon}`}>password</span>
            <input type="password" name="confirmarContrasena" placeholder="Confirmar contraseña" onChange={handleChange} required />
          </div>

          {error && <div className={styles.formMessageError}>{error}</div>}
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