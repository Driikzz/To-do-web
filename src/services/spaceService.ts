import axios from 'axios';
import type { Space } from '../types/space';

const BASE_URL = import.meta.env.BACKEND_URL || 'http://localhost:4000/api';

type SpaceBackendResponse = {
  id: string;
  name: string;
  description: string;
  maxUsers: number;
  adminList: string[];
  usersList: string[];
  createdAt: string;
  updatedAt: string;
};

const mapBackendToFrontend = (backendSpace: SpaceBackendResponse): Space => ({
  id: backendSpace.id,
  name: backendSpace.name,
  description: backendSpace.description,
  maxUsers: backendSpace.maxUsers,
  adminList: backendSpace.adminList,
  usersList: backendSpace.usersList,
  createdAt: new Date(backendSpace.createdAt),
  updatedAt: new Date(backendSpace.updatedAt)
});

const SpaceService = {
  async getAllSpaces(token: string): Promise<Space[]> {
    try {
      const response = await axios.get<SpaceBackendResponse[]>(`${BASE_URL}/spaces`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.map(mapBackendToFrontend);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du chargement des espaces');
    }
  },

  async getSpaceById(token: string, spaceId: string): Promise<Space> {
    try {
      const response = await axios.get<SpaceBackendResponse>(`${BASE_URL}/spaces/${spaceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return mapBackendToFrontend(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du chargement de l\'espace');
    }
  },

  async createSpace(token: string, name: string, description?: string, maxUsers?: number): Promise<Space> {
    try {
      const response = await axios.post<SpaceBackendResponse>(
        `${BASE_URL}/spaces`,
        { name, description, maxUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return mapBackendToFrontend(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de l\'espace');
    }
  },

  async updateSpace(token: string, spaceId: string, updates: Partial<Space>): Promise<Space> {
    try {
      const response = await axios.put<SpaceBackendResponse>(
        `${BASE_URL}/spaces/${spaceId}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return mapBackendToFrontend(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'espace');
    }
  },

  async deleteSpace(token: string, spaceId: string): Promise<void> {
    try {
      await axios.delete(`${BASE_URL}/spaces/${spaceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de l\'espace');
    }
  },

  async addUser(token: string, spaceId: string, userId: string): Promise<Space> {
    try {
      const response = await axios.post<SpaceBackendResponse>(
        `${BASE_URL}/spaces/${spaceId}/users`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return mapBackendToFrontend(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout de l\'utilisateur');
    }
  },

  async removeUser(token: string, spaceId: string, userId: string): Promise<Space> {
    try {
      const response = await axios.delete<SpaceBackendResponse>(
        `${BASE_URL}/spaces/${spaceId}/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return mapBackendToFrontend(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur');
    }
  }
};

export default SpaceService;
