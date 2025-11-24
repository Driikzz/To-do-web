import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginScreen from './LoginScreen'
import RegisterScreen from './RegisterScreen'
import '../App.css'

type AuthView = 'login' | 'register'

export default function AuthScreen() {
  const [view, setView] = useState<AuthView>('login')
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    setView('login')
  }, [])

  if (!loading && isAuthenticated) {
    return <Navigate to="/home" replace />
  }

  return (
    <div className="app-shell">
      <header>
        <h1>Espace sécurisé</h1>
        <p>Connectez-vous ou créez un compte pour accéder à l&apos;application.</p>
      </header>

      <div className="auth-card">
        <nav className="auth-tabs">
          <button
            type="button"
            className={view === 'login' ? 'active' : ''}
            onClick={() => setView('login')}
          >
            Connexion
          </button>
          <button
            type="button"
            className={view === 'register' ? 'active' : ''}
            onClick={() => setView('register')}
          >
            Inscription
          </button>
        </nav>

        {view === 'login' ? <LoginScreen /> : <RegisterScreen />}
      </div>
    </div>
  )
}

