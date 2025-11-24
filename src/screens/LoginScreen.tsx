import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface LoginScreenProps {
  onSuccess?: (payload: unknown) => void
  onSwitchToRegister?: () => void
}

interface LoginForm {
  email: string
  password: string
}

const defaultValues: LoginForm = {
  email: '',
  password: '',
}

export default function LoginScreen({ onSuccess, onSwitchToRegister }: LoginScreenProps) {
  const [form, setForm] = useState<LoginForm>(defaultValues)
  const [remember, setRemember] = useState(true)
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
    <div className="login-layout">
      <section className="login-hero">
        <div className="hero-brand">
          <span className="brand-dot" />
          <div>
            <p className="brand-label">Sticky Notes</p>
            <p className="brand-tagline">Organisez vos idées en un clin d&apos;œil.</p>
          </div>
        </div>

        <h1>Organisez vos idées en un clin d&apos;œil.</h1>
        <p className="hero-description">
          Un tableau épuré pour capturer tâches, pensées et projets, sans friction.
        </p>

        <div className="hero-cards">
          <article className="hero-card yellow">
            <p className="hero-card-title">Aujourd&apos;hui</p>
            <h3>Priorités rapides</h3>
            <ul>
              <li>Répondre aux messages</li>
              <li>Ranger le bureau</li>
              <li>Planifier la semaine</li>
            </ul>
          </article>

          <article className="hero-card blue">
            <p className="hero-card-title">Projet</p>
            <h3>Campagne avril</h3>
            <p>Idées, slogans, visuels</p>
          </article>

          <article className="hero-card pink">
            <p className="hero-card-title">Perso</p>
            <h3>Liste de lecture</h3>
            <p>3 livres avant l&apos;été</p>
          </article>
        </div>
      </section>

      <section className="login-panel">
        <header>
          <h2>Heureux de vous revoir</h2>
          <p>Connectez-vous pour retrouver vos murs de notes et continuer là où vous vous êtes arrêté.</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              name="email"
              type="email"
              placeholder="vous@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Mot de passe
            <div className="password-meta">
              <span>Minimum 8 caractères</span>
            </div>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <div className="form-inline">
            <label className="remember-me row">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember((prev) => !prev)}
              />
              Se souvenir de moi
            </label>
          </div>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p className="login-hint">
            Astuce : utilisez un gestionnaire de mots de passe pour garder votre compte en sécurité.
          </p>

          <p className="login-register">
            Pas encore de compte ?{' '}
            <button type="button" className="link-button" onClick={onSwitchToRegister}>
              Créer un compte
            </button>
          </p>

          {error && <p className="auth-feedback error">{error}</p>}
        </form>
      </section>
    </div>
  )
}
