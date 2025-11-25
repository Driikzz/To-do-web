import type { Task } from '../types/space'
import apiClient from './apiClient'

type TaskBackendResponse = {
  id: string
  name: string
  description: string
  color: string
  status: 'todo' | 'in-progress' | 'done'
  dueDate?: string
  assignedTo?: string
  createdBy: string
  defaultAdmin: string
  adminList: string[]
  spaceId: string
  createdAt: string
  updatedAt: string
}

const mapBackendToFrontend = (backendTask: TaskBackendResponse): Task => ({
  id: backendTask.id,
  name: backendTask.name,
  color: backendTask.color,
  items: [],
  createdBy: backendTask.createdBy,
  defaultAdmin: backendTask.defaultAdmin,
  adminList: backendTask.adminList,
  spaceId: backendTask.spaceId,
  createdAt: new Date(backendTask.createdAt),
  updatedAt: new Date(backendTask.updatedAt),
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

const TaskService = {
  async getAllTasksBySpace(spaceId: string): Promise<Task[]> {
    try {
      const response = await apiClient.get<TaskBackendResponse[]>(`/tasks/space/${spaceId}`)
      return response.data.map(mapBackendToFrontend)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Erreur lors du chargement des tâches'))
    }
  },

  async getMyTasks(spaceId: string): Promise<Task[]> {
    try {
      const response = await apiClient.get<TaskBackendResponse[]>(`/tasks/space/${spaceId}/my-tasks`)
      return response.data.map(mapBackendToFrontend)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Erreur lors du chargement de vos tâches'))
    }
  },

  async createTask(
    spaceId: string,
    data: {
      name: string
      color?: string
      items?: unknown[]
    },
  ): Promise<Task> {
    try {
      const response = await apiClient.post<TaskBackendResponse>(`/tasks/space/${spaceId}`, data)
      return mapBackendToFrontend(response.data)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Erreur lors de la création de la tâche'))
    }
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    try {
      const response = await apiClient.put<TaskBackendResponse>(`/tasks/${taskId}`, updates)
      return mapBackendToFrontend(response.data)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Erreur lors de la mise à jour de la tâche'))
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      await apiClient.delete(`/tasks/${taskId}`)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Erreur lors de la suppression de la tâche'))
    }
  },
}

export default TaskService
