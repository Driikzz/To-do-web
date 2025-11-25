import type { Space } from '../types/space'
import apiClient from './apiClient'

type SpaceBackendResponse = {
  id: string
  name: string
  description: string
  maxUsers: number
  adminList: string[]
  usersList: string[]
  createdAt: string
  updatedAt: string
}

export type CreateSpacePayload = {
  name: string
  description?: string
  maxUsers?: number
  adminList?: string[]
  usersList?: string[]
}

export type UpdateSpacePayload = Partial<CreateSpacePayload>

const mapBackendToFrontend = (backendSpace: SpaceBackendResponse): Space => ({
  id: backendSpace.id,
  name: backendSpace.name,
  description: backendSpace.description ?? '',
  maxUsers: backendSpace.maxUsers,
  adminList: backendSpace.adminList,
  usersList: backendSpace.usersList,
  createdAt: new Date(backendSpace.createdAt),
  updatedAt: new Date(backendSpace.updatedAt),
})

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

const SpaceService = {
  async getAllSpaces(): Promise<Space[]> {
    try {
      const response = await apiClient.get<SpaceBackendResponse[]>('/spaces')
      return response.data.map(mapBackendToFrontend)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Erreur lors du chargement des espaces'))
    }
  },

  async getSpaceById(spaceId: string): Promise<Space> {
    try {
      const response = await apiClient.get<SpaceBackendResponse>(`/spaces/${spaceId}`)
      return mapBackendToFrontend(response.data)
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erreur lors du chargement de l'espace"))
    }
  },

  async createSpace(payload: CreateSpacePayload): Promise<Space> {
    try {
      const response = await apiClient.post<SpaceBackendResponse>('/spaces', payload)
      return mapBackendToFrontend(response.data)
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erreur lors de la création de l'espace"))
    }
  },

  async updateSpace(spaceId: string, updates: UpdateSpacePayload): Promise<Space> {
    try {
      const response = await apiClient.put<SpaceBackendResponse>(`/spaces/${spaceId}`, updates)
      return mapBackendToFrontend(response.data)
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erreur lors de la mise à jour de l'espace"))
    }
  },

  async deleteSpace(spaceId: string): Promise<void> {
    try {
      await apiClient.delete(`/spaces/${spaceId}`)
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erreur lors de la suppression de l'espace"))
    }
  },

  async addUser(spaceId: string, userId: string): Promise<Space> {
    try {
      const response = await apiClient.post<SpaceBackendResponse>(`/spaces/${spaceId}/addUser`, {
        userId,
      })
      return mapBackendToFrontend(response.data)
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erreur lors de l'ajout de l'utilisateur"))
    }
  },

  async removeUser(spaceId: string, userId: string): Promise<Space> {
    try {
      const response = await apiClient.post<SpaceBackendResponse>(`/spaces/${spaceId}/removeUser`, {
        userId,
      })
      return mapBackendToFrontend(response.data)
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Erreur lors du retrait de l'utilisateur"))
    }
  },
}

export default SpaceService
