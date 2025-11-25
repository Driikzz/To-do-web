import { useState } from 'react'
import type { CreateSpacePayload } from '../../services/spaceService'

interface CreateSpaceModalProps {
  onClose: () => void
  onSubmit: (payload: CreateSpacePayload) => Promise<void> | void
  loading?: boolean
  error?: string | null
}

type CreateSpaceForm = {
  name: string
  description: string
  maxUsers: number
  adminList: string
  usersList: string
}

const defaultForm: CreateSpaceForm = {
  name: '',
  description: '',
  maxUsers: 5,
  adminList: '',
  usersList: '',
}

const parseIdList = (raw: string) =>
  raw
    .split(/[,\n]/)
    .map((value) => value.trim())
    .filter(Boolean)

export default function CreateSpaceModal({
  onClose,
  onSubmit,
  loading = false,
  error,
}: CreateSpaceModalProps) {
  const [form, setForm] = useState<CreateSpaceForm>(defaultForm)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || loading) return

    const payload: CreateSpacePayload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      maxUsers: Number.isNaN(Number(form.maxUsers)) ? undefined : Number(form.maxUsers),
    }

    const admins = parseIdList(form.adminList)
    const users = parseIdList(form.usersList)

    if (admins.length) {
      payload.adminList = admins
    }
    if (users.length) {
      payload.usersList = users
    }

    await onSubmit(payload)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1200,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
          maxHeight: '95vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '26px' }}>Nouvel espace</h2>
          <p style={{ margin: '8px 0 0', color: '#666' }}>
            Définissez un nom et, si besoin, les paramètres avancés. Vous pourrez modifier ces valeurs
            plus tard.
          </p>
        </div>

        {error && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: '#fdecea',
              border: '1px solid #f5c6cb',
              color: '#a94442',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontWeight: 600 }}>Nom *</span>
            <input
              name="name"
              type="text"
              placeholder="Espace marketing, Projet X..."
              value={form.name}
              onChange={handleChange}
              required
              autoFocus
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #dcdcdc',
                fontSize: '16px',
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontWeight: 600 }}>Description</span>
            <textarea
              name="description"
              placeholder="Quelques détails pour vos membres..."
              value={form.description}
              onChange={handleChange}
              rows={3}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #dcdcdc',
                fontSize: '15px',
                resize: 'vertical',
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontWeight: 600 }}>Nombre maximum d&apos;utilisateurs</span>
            <input
              name="maxUsers"
              type="number"
              min={1}
              value={form.maxUsers}
              onChange={handleChange}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #dcdcdc',
                fontSize: '16px',
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontWeight: 600 }}>Admins (IDs séparés par une virgule ou un retour)</span>
            <textarea
              name="adminList"
              placeholder="64fc..., 64fd..., ..."
              value={form.adminList}
              onChange={handleChange}
              rows={2}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #dcdcdc',
                fontSize: '15px',
                resize: 'vertical',
              }}
            />
          </label>

  <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontWeight: 600 }}>
              Utilisateurs (IDs séparés par une virgule ou un retour)
            </span>
            <textarea
              name="usersList"
              placeholder="64fc..., 64fd..., ..."
              value={form.usersList}
              onChange={handleChange}
              rows={2}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #dcdcdc',
                fontSize: '15px',
                resize: 'vertical',
              }}
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: '1px solid #dcdcdc',
                backgroundColor: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!form.name.trim() || loading}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#4CAF50',
                color: '#fff',
                cursor: !form.name.trim() || loading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


