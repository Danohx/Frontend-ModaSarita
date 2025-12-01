import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/LoginPage.module.css'; // Reutilizamos estilos del login

const API_URL = import.meta.env.VITE_API_URL;

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Obtenemos el token de la URL (ej: ?token=abc...)
  const token = searchParams.get('token');

  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'error' | 'exito' } | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

    // Validación visual de complejidad (para mejor UX)
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
      
      // Redirigir al login después de 3 segundos
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

  // Si no hay token en la URL, mostramos error directo
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
          <div className={styles.inputGroup}>
            <span className={`material-symbols-outlined ${styles.inputIcon}`}>lock</span>
            <input 
              type="password" 
              placeholder="Nueva contraseña" 
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              required 
            />
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