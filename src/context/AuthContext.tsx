import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import UserServices from '../services/userServices'
import asyncStorage from '../services/asyncStorage'
import { onUnauthorized, setAuthToken } from '../services/apiClient'

const AUTH_STORAGE_KEY = 'auth_session'

type AuthUser = {
  id: string
  email: string
  firstname: string
  lastname: string
  createdAt: string
  updatedAt: string
}

type AuthSession = {
  token: string
  user: AuthUser
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: {
    firstname: string
    lastname: string
    email: string
    password: string
  }) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

type AuthState = {
  token: string | null
  user: AuthUser | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, user: null })
  const [loading, setLoading] = useState(true)

  const persistSession = useCallback(async (session: AuthSession | null) => {
    if (session) {
      setState({ token: session.token, user: session.user })
      setAuthToken(session.token)
      await asyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
    } else {
      setState({ token: null, user: null })
      setAuthToken(null)
      await asyncStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    const hydrate = async () => {
      try {
        const raw = await asyncStorage.getItem(AUTH_STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw) as AuthSession
          setState({ token: parsed.token, user: parsed.user })
          setAuthToken(parsed.token)
        } else {
          setAuthToken(null)
        }
      } catch (error) {
        console.error('Impossible de charger la session', error)
      } finally {
        setLoading(false)
      }
    }

    hydrate()
  }, [])

  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      persistSession(null)
    })

    return unsubscribe
  }, [persistSession])

  const login = async (email: string, password: string) => {
    const data = await UserServices.login(email, password)
    if (!data?.token || !data?.user) {
      throw new Error('Réponse du serveur invalide')
    }
    await persistSession({ token: data.token, user: data.user })
  }

  const register = async ({
    firstname,
    lastname,
    email,
    password,
  }: {
    firstname: string
    lastname: string
    email: string
    password: string
  }) => {
    let data = await UserServices.register(firstname, lastname, email, password)
    if (!data?.token || !data?.user) {
      data = await UserServices.login(email, password)
    }

    if (!data?.token || !data?.user) {
      throw new Error('Impossible de créer la session')
    }

    await persistSession({ token: data.token, user: data.user })
  }

  const logout = async () => {
    await persistSession(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      token: state.token,
      loading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(state.token),
    }),
    [state.user, state.token, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}

