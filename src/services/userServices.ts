import apiClient from './apiClient'

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) {
      return response.data.message
    }
  }

  return fallback
}

export type UserPreview = {
  id: string
  firstname: string
  lastname: string
  email: string
}

const UserServices = {
  async login(email: string, password: string) {
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      return response.data
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Impossible de se connecter'))
    }
  },
  async register(firstname: string, lastname: string, email: string, password: string) {
    try {
      const response = await apiClient.post('/auth/register', {
        firstname,
        lastname,
        email,
        password,
      })
      return response.data
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Impossible de créer le compte'))
    }
  },
  async search(query: string): Promise<UserPreview[]> {
    try {
      const response = await apiClient.get<UserPreview[]>('/users/search', {
        params: { q: query },
      })
      return response.data
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Impossible de rechercher des utilisateurs'))
    }
  },
}

export default UserServices