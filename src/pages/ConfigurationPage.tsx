import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import styles from '../styles/ConfigurationPage.module.css'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const ConfigurationPage = () => {
  const { isAuthenticated, logout, logoutAllDevices } = useAuth()

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSetup2FA = async () => {
    setIsLoading(true); setError(null); setSuccess(null);
    try {
      const response = await api.post('/security/2fa/setup')
      setQrCodeUrl(response.data.otpauth_url)
      setIsLoading(false)
    } catch (err: any) {
      setIsLoading(false)
      setError(err.response?.data?.mensaje || 'Error al iniciar la configuración 2FA.')
    }
  }

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.post(
        '/security/2fa/enable',
        { token: otpCode }
      )
      setSuccess(response.data.message)
      setQrCodeUrl(null)
      setIsLoading(false)
      
    } catch (err: any) {
      setIsLoading(false)
      setError(err.response?.data?.message || 'Código OTP inválido.')
    }
  }

  if (!isAuthenticated) {
    return <div>Cargando...</div>
  }

  return (
    <div className={styles.configPage}>
      <div className={styles.configCard}>
        <h1>Configuración de Seguridad</h1>
        <p>
          Administra la seguridad de tu cuenta.
        </p>

        {/* === SECCIÓN 1: CIERRE DE SESIÓN === */}
        <div className={styles.sessionSection}>
            <h2>Sesiones Activas</h2>
            <div className={styles.buttonGroup}>
                <button onClick={logout} className={styles.secondaryButton}>
                    Cerrar sesión actual
                </button>
                
                {/* Botón de Pánico */}
                <button onClick={logoutAllDevices} className={styles.dangerButton}>
                    ⚠️ Cerrar sesión en TODOS los dispositivos
                </button>
            </div>
            <p className={styles.smallText}>
                Úsalo si crees que alguien más accedió a tu cuenta.
            </p>
        </div>
        
        <hr className={styles.divider} />

        <h2>Autenticación de Dos Factores (2FA)</h2>

        {!qrCodeUrl && !success && (
          <>
            <p>
              Añade una capa extra de seguridad. Se te pedirá un código
              de tu app de autenticación cada vez que inicies sesión.
            </p>
            <button
              onClick={handleSetup2FA}
              className={styles.primaryButton}
              disabled={isLoading}
            >
              {isLoading ? 'Generando...' : 'Activar 2FA'}
            </button>
          </>
        )}

        {qrCodeUrl && (
          <div className={styles.qrSection}>
            <p>
              ¡Casi listo! Escanea este código QR con tu app de autenticación
              (como Google Authenticator).
            </p>
            <div className={styles.qrContainer}>
              <QRCodeSVG value={qrCodeUrl} size={256} />
            </div>

            <form onSubmit={handleEnable2FA} className={styles.verifyForm}>
              <p>
                Luego, ingresa el código de 6 dígitos que ves en tu app para
                confirmar.
              </p>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Código de 6 dígitos"
                maxLength={6}
                className={styles.otpInput}
              />
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isLoading}
              >
                {isLoading ? 'Verificando...' : 'Verificar y Activar'}
              </button>
            </form>
          </div>
        )}

        {success && (
          <div className={styles.successMessage}>
            <span className="material-symbols-outlined">check_circle</span>
            {success}
          </div>
        )}
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

      </div>
    </div>
  )
}

export default ConfigurationPage