import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface LoginScreenProps {
  onSuccess?: (payload: unknown) => void
}

interface LoginForm {
  email: string
  password: string
}

const defaultValues: LoginForm = {
  email: '',
  password: '',
}

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [form, setForm] = useState<LoginForm>(defaultValues)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await login(form.email, form.password)
      onSuccess?.(null)
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Connexion</h2>
      <label>
        Email
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Mot de passe
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          required
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>

      {error && <p className="auth-feedback error">{error}</p>}
    </form>
  )
}

