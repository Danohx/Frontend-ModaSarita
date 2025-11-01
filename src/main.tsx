import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from './App.tsx'
import './index.css'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import HomePage from './pages/HomePage.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import ConfigurationPage from './pages/ConfigurationPage.tsx'
import MagicVerifyPage from './pages/MagicVerifyPage.tsx'
import Error404 from './pages/Error404.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <Error404 />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'registro', element: <RegisterPage /> },
      { path: 'magic-verify/:token', element: <MagicVerifyPage /> },
      // --- Rutas Protegidas ---
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'perfil', element: <ConfigurationPage /> },
        ]
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)