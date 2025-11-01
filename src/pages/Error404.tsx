import { Link, useRouteError } from 'react-router-dom'
import stylesVerify from '../styles/MagicVerifyPage.module.css'
import stylesLogin from '../styles/LoginPage.module.css'

export default function Error404() {
  const error = useRouteError() as any; 
  console.error(error);

  return (
    <div className={stylesVerify.verifyPage}>
      <div className={stylesVerify.verifyCard}>
        <h1 className={stylesVerify.errorTitle} style={{ fontSize: '4rem' }}>404</h1>
        <h2>Página No Encontrada</h2>
        <p>
          Lo sentimos, no pudimos encontrar la página que estás buscando.
          Esta página aún no está diseñada o no existe.
        </p>
        {error && (
          <p>
            <i>{error.statusText || error.message}</i>
          </p>
        )}

        <Link 
          to="/" 
          className={stylesLogin.submitButton} 
          style={{ textDecoration: 'none', marginTop: '1.5rem' }}
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}