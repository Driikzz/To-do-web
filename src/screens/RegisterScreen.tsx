import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface RegisterScreenProps {
  onSuccess?: (payload: unknown) => void
  onSwitchToLogin?: () => void
}

interface RegisterForm {
  firstname: string
  lastname: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

const defaultValues: RegisterForm = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
}

export default function RegisterScreen({ onSuccess, onSwitchToLogin }: RegisterScreenProps) {
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
    const { name, value, type, checked } = event.target
    setForm((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (passwordMismatch) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (!form.acceptTerms) {
      setError('Vous devez accepter les CGU pour continuer')
      return
    }

    if (!form.firstname.trim() || !form.lastname.trim()) {
      setError('Merci de renseigner votre prénom et votre nom')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await register({
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
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
    <div className="register-layout">
      <section className="register-hero">
        <div className="hero-brand">
          <span className="brand-dot" />
          <div>
            <p className="brand-label">Sticky Notes</p>
            <p className="brand-tagline">Créez votre mur d&apos;idées.</p>
          </div>
        </div>

        <h1>Créez votre mur d&apos;idées.</h1>
        <p className="hero-description">
          Commencez un espace clair pour organiser vos tâches, projets et inspirations.
        </p>

        <div className="register-cards">
          <article className="register-card yellow">
            <p className="hero-card-title">Bienvenue</p>
            <h3>Votre premier tableau</h3>
            <p>
              Ajoutez vos idées
              <br />
              Classez vos projets
              <br />
              Invitez votre équipe
            </p>
          </article>
          <article className="register-card blue">
            <p className="hero-card-title">Astuce</p>
            <h3>Glisser-déposer</h3>
            <p>Réorganisez vos notes en un geste</p>
          </article>
          <article className="register-card pink">
            <p className="hero-card-title">Perso</p>
            <h3>Objectifs du mois</h3>
            <p>3 priorités à atteindre</p>
          </article>
        </div>
      </section>

      <section className="register-panel">
        <header>
          <h2>Créer un compte</h2>
          <p>Rejoignez Sticky Notes et gardez toutes vos idées au même endroit.</p>
        </header>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="register-names">
            <label>
              Prénom
              <input
                name="firstname"
                type="text"
                placeholder="Prénom"
                value={form.firstname}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Nom
              <input
                name="lastname"
                type="text"
                placeholder="Nom"
                value={form.lastname}
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
              minLength={8}
            />
          </label>

          <label>
            Confirmer le mot de passe
            <input
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
            />
          </label>

          <label className="terms-checkbox row">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={form.acceptTerms}
              onChange={handleChange}
            />
            J&apos;accepte les CGU
          </label>

          <button
            type="submit"
            className="login-submit"
            disabled={loading || passwordMismatch || !form.acceptTerms}
          >
            {loading ? 'Création...' : 'Créer un compte'}
          </button>

          <p className="login-register">
            Déjà inscrit ?{' '}
            <button type="button" className="link-button" onClick={onSwitchToLogin}>
              Connectez-vous
            </button>
          </p>

          {passwordMismatch && (
            <p className="auth-feedback error">Les mots de passe doivent correspondre</p>
          )}
          {error && <p className="auth-feedback error">{error}</p>}
          {success && <p className="auth-feedback success">{success}</p>}
        </form>
      </section>
    </div>
  )
}

