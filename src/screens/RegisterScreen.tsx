import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface RegisterScreenProps {
  onSuccess?: (payload: unknown) => void
}

interface RegisterForm {
  firstname: string
  lastname: string
  email: string
  password: string
  confirmPassword: string
}

const defaultValues: RegisterForm = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function RegisterScreen({ onSuccess }: RegisterScreenProps) {
  const [form, setForm] = useState<RegisterForm>(defaultValues)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { register } = useAuth()
  const navigate = useNavigate()

  const passwordMismatch = useMemo(
    () => form.password !== '' && form.confirmPassword !== '' && form.password !== form.confirmPassword,
    [form.password, form.confirmPassword],
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (passwordMismatch) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await register({
        firstname: form.firstname,
        lastname: form.lastname,
        email: form.email,
        password: form.password,
      })

      setSuccess('Compte créé avec succès 🎉')
      onSuccess?.(null)
      setForm(defaultValues)
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Inscription</h2>
      <div className="grid-2">
        <label>
          Nom
          <input
            name="lastname"
            type="text"
            placeholder="Dupont"
            value={form.lastname}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Prénom
          <input
            name="firstname"
            type="text"
            placeholder="Marie"
            value={form.firstname}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <label>
        Email
        <input
          name="email"
          type="email"
          placeholder="marie.dupont@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />
      </label>

      <div className="grid-2">
        <label>
          Mot de passe
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </label>
        <label>
          Confirmation
          <input
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
          />
        </label>
      </div>

      <button type="submit" disabled={loading || passwordMismatch}>
        {loading ? 'Création...' : "S'inscrire"}
      </button>

      {passwordMismatch && <p className="auth-feedback error">Les mots de passe doivent correspondre</p>}
      {error && <p className="auth-feedback error">{error}</p>}
      {success && <p className="auth-feedback success">{success}</p>}
    </form>
  )
}

