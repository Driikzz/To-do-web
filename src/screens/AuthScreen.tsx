import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginScreen from './LoginScreen'
import RegisterScreen from './RegisterScreen'
import '../App.css'

type AuthView = 'login' | 'register'

export default function AuthScreen() {
  const [view, setView] = useState<AuthView>('login')
  const { isAuthenticated, loading } = useAuth()

  if (!loading && isAuthenticated) {
    return <Navigate to="/home" replace />
  }

  if (view === 'register') {
    return (
      <RegisterScreen
        onSuccess={() => undefined}
        onSwitchToLogin={() => setView('login')}
      />
    )
  }

  return (
    <LoginScreen
      onSuccess={() => undefined}
      onSwitchToRegister={() => setView('register')}
    />
  )
}

