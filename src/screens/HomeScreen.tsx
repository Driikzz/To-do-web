import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function HomeScreen() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/auth', { replace: true })
  }

  return (
    <div className="home-shell">
      <header>
        <h1>Bienvenue {user?.firstname}</h1>
        <p>Ton espace personnel est désormais sécurisé.</p>
      </header>

      <section className="home-card">
        <h2>Profil</h2>
        <ul>
          <li>
            <strong>Nom :</strong> {user?.lastname}
          </li>
          <li>
            <strong>Prénom :</strong> {user?.firstname}
          </li>
          <li>
            <strong>Email :</strong> {user?.email}
          </li>
          <li>
            <strong>ID :</strong> {user?.id}
          </li>
        </ul>

        <button className="logout-button" onClick={handleLogout}>
          Se déconnecter
        </button>
      </section>
    </div>
  )
}

