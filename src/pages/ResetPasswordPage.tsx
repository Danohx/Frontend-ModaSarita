import { useState, type FormEvent } from 'react'; // Importamos FormEvent
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/LoginPage.module.css';

const API_URL = import.meta.env.VITE_API_URL;

// Definimos la interfaz para el mensaje
interface MensajeEstado {
  texto: string;
  tipo: 'error' | 'exito';
}

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Tipado explícito para el mensaje
  const [mensaje, setMensaje] = useState<MensajeEstado | null>(null);
  const [cargando, setCargando] = useState(false);

  // Tipado del evento 'e'
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    if (!token) {
      setMensaje({ texto: "Token inválido o faltante.", tipo: 'error' });
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setMensaje({ texto: "Las contraseñas no coinciden.", tipo: 'error' });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;
    if (!passwordRegex.test(nuevaContrasena)) {
        setMensaje({ texto: "La contraseña es muy débil (Requiere Mayúscula, Minúscula, Número y Símbolo)", tipo: 'error' });
        return;
    }

    setCargando(true);

    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        nuevaContrasena
      });

      setMensaje({ texto: "¡Contraseña actualizada! Redirigiendo...", tipo: 'exito' });
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error: any) {
      setMensaje({ 
        texto: error.response?.data?.mensaje || "Error al restablecer contraseña.", 
        tipo: 'error' 
      });
    } finally {
      setCargando(false);
    }
  };

  if (!token) {
    return (
        <div className={styles.loginPage}>
            <div className={styles.loginCard}>
                <h1>Error</h1>
                <p>Enlace inválido. No se encontró el token de seguridad.</p>
                <button onClick={() => navigate('/login')} className={styles.secondaryButton}>
                    Volver al inicio
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <h1>Nueva Contraseña</h1>
        <p>Introduce tu nueva contraseña segura.</p>

        <form onSubmit={handleSubmit}>
          
          <div className={styles.inputGroup} style={{ position: 'relative' }}>
            <span className={`material-symbols-outlined ${styles.inputIcon}`}>lock</span>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Nueva contraseña" 
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
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

          <div className={styles.inputGroup}>
            <span className={`material-symbols-outlined ${styles.inputIcon}`}>lock_reset</span>
            <input 
              type="password" 
              placeholder="Confirmar contraseña" 
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              required 
            />
          </div>

          {mensaje && (
            <div className={mensaje.tipo === 'error' ? styles.formMessageError : styles.formMessageSuccess} 
                 style={{ color: mensaje.tipo === 'exito' ? 'green' : 'red', margin: '10px 0' }}>
              {mensaje.texto}
            </div>
          )}

          <button type="submit" className={styles.submitButton} disabled={cargando}>
            {cargando ? 'Guardando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;