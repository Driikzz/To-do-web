import axios from 'axios';
import type { Task } from '../types/space';

const BASE_URL = import.meta.env.BACKEND_URL || 'http://localhost:4000/api';

type TaskBackendResponse = {
  id: string;
  name: string;
  description: string;
  color: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
  assignedTo?: string;
  createdBy: string;
  defaultAdmin: string;
  adminList: string[];
  spaceId: string;
  createdAt: string;
  updatedAt: string;
};

const mapBackendToFrontend = (backendTask: TaskBackendResponse): Task => ({
  id: backendTask.id,
  name: backendTask.name,
  color: backendTask.color,
  items: [], // Convertir depuis le backend si nécessaire
  createdBy: backendTask.createdBy,
  defaultAdmin: backendTask.defaultAdmin,
  adminList: backendTask.adminList,
  spaceId: backendTask.spaceId,
  createdAt: new Date(backendTask.createdAt),
  updatedAt: new Date(backendTask.updatedAt)
});

const TaskService = {
  async getAllTasksBySpace(token: string, spaceId: string): Promise<Task[]> {
    try {
      const response = await axios.get<TaskBackendResponse[]>(`${BASE_URL}/tasks/space/${spaceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.map(mapBackendToFrontend);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du chargement des tâches');
    }
  },

  async getMyTasks(token: string, spaceId: string): Promise<Task[]> {
    try {
      const response = await axios.get<TaskBackendResponse[]>(`${BASE_URL}/tasks/space/${spaceId}/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.map(mapBackendToFrontend);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du chargement de vos tâches');
    }
  },

  async createTask(
    token: string,
    spaceId: string,
    data: {
      name: string;
      color?: string;
      items?: any[];
    }
  ): Promise<Task> {
    try {
      const response = await axios.post<TaskBackendResponse>(
        `${BASE_URL}/tasks/space/${spaceId}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return mapBackendToFrontend(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de la tâche');
    }
  },

  async updateTask(token: string, taskId: string, updates: Partial<Task>): Promise<Task> {
    try {
      const response = await axios.put<TaskBackendResponse>(
        `${BASE_URL}/tasks/${taskId}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return mapBackendToFrontend(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la tâche');
    }
  },

  async deleteTask(token: string, taskId: string): Promise<void> {
    try {
      await axios.delete(`${BASE_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la tâche');
    }
  }
};

export default TaskService;
