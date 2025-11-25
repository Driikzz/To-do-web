import axios, { AxiosError } from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_BACKEND_URL ??
  import.meta.env.BACKEND_URL ??
  'http://localhost:4000/api'

type UnauthorizedListener = (error?: AxiosError) => void

const unauthorizedListeners = new Set<UnauthorizedListener>()

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let currentToken: string | null = null

export const setAuthToken = (token: string | null) => {
  currentToken = token

  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common.Authorization
  }
}

export const onUnauthorized = (listener: UnauthorizedListener) => {
  unauthorizedListeners.add(listener)

  return () => unauthorizedListeners.delete(listener)
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && currentToken) {
      unauthorizedListeners.forEach((listener) => listener(error))
    }

    return Promise.reject(error)
  },
)

export default apiClient


