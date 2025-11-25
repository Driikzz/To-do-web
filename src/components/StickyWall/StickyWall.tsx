import { useState, useEffect } from 'react';
import type { Space, Task } from '../../types/space';
import Sidebar from '../Sidebar/Sidebar';
import StickyNote from '../StickyNote/StickyNote';
import CreateTaskModal from '../CreateTaskModal/CreateTaskModal';
import SpaceService from '../../services/spaceService';
import TaskService from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';

const COLORS = [
  '#A8E6CF', // mint green pastel
  '#B3D9FF', // sky blue pastel
  '#FFD6A5', // peach pastel
  '#FFABAB', // pink pastel
  '#D4A5D4', // lavender pastel
  '#C2F0FC', // cyan pastel
];

const PERSONAL_STICKY_WALL_ID = 'personal-sticky-wall';

const StickyWall = () => {
  const { token, logout } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [personalTasks, setPersonalTasks] = useState<Task[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'today' | 'upcoming'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Charger les spaces
  useEffect(() => {
    const loadSpaces = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const loadedSpaces = await SpaceService.getAllSpaces(token);

        // Créer un espace "Sticky Wall" virtuel (toujours en premier)
        const personalStickyWall: Space = {
          id: PERSONAL_STICKY_WALL_ID,
          name: 'Sticky Wall',
          description: 'Mon espace personnel',
          maxUsers: 1,
          adminList: [],
          usersList: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Ajouter le Sticky Wall personnel en premier, suivi des autres espaces
        const allSpaces = [personalStickyWall, ...loadedSpaces];
        setSpaces(allSpaces);

        // Sélectionner automatiquement le "Sticky Wall" personnel
        if (!selectedSpaceId) {
          setSelectedSpaceId(personalStickyWall.id);
        }
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(message);
        console.error('Erreur de chargement des spaces:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSpaces();
  }, [token]);

  // Charger les tâches personnelles depuis localStorage au démarrage
  useEffect(() => {
    const savedTasks = localStorage.getItem('personal-sticky-wall-tasks');
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        setPersonalTasks(parsed);
      } catch (err) {
        console.error('Erreur de chargement des tâches personnelles:', err);
      }
    }
  }, []);

  // Sauvegarder les tâches personnelles dans localStorage
  useEffect(() => {
    if (personalTasks.length > 0 || localStorage.getItem('personal-sticky-wall-tasks')) {
      localStorage.setItem('personal-sticky-wall-tasks', JSON.stringify(personalTasks));
    }
  }, [personalTasks]);

  // Charger les tasks du space sélectionné
  useEffect(() => {
    const loadTasks = async () => {
      if (!token || !selectedSpaceId) {
        setTasks([]);
        return;
      }

      // Si c'est le Sticky Wall personnel, utiliser les tâches locales
      if (selectedSpaceId === PERSONAL_STICKY_WALL_ID) {
        setTasks(personalTasks);
        return;
      }

      try {
        const loadedTasks = await TaskService.getAllTasksBySpace(token, selectedSpaceId);
        setTasks(loadedTasks);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(message);
        console.error('Erreur de chargement des tasks:', err);
      }
    };

    loadTasks();
  }, [token, selectedSpaceId, personalTasks]);

  const handleCreateSpace = async () => {
    if (!token) return;

    const name = prompt('Nom du nouvel espace :');
    if (!name) return;

    try {
      const newSpace = await SpaceService.createSpace(token, name);
      setSpaces([newSpace, ...spaces]);
      setSelectedSpaceId(newSpace.id);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('Erreur de création de l\'espace:', err);
    }
  };

  const handleCreateTask = async (name: string, color: string) => {
    if (!token || !selectedSpaceId) return;

    // Si c'est le Sticky Wall personnel, gérer localement
    if (selectedSpaceId === PERSONAL_STICKY_WALL_ID) {
      const newTask: Task = {
        id: `personal-${Date.now()}`,
        name,
        color,
        items: [],
        defaultAdmin: '',
        adminList: [],
        createdBy: '',
        spaceId: PERSONAL_STICKY_WALL_ID,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setPersonalTasks([newTask, ...personalTasks]);
      return;
    }

    try {
      const newTask = await TaskService.createTask(token, selectedSpaceId, {
        name,
        color,
        items: []
      });
      setTasks([newTask, ...tasks]);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('Erreur de création de la task:', err);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!token) return;

    // Si c'est une tâche personnelle, mettre à jour localement
    if (selectedSpaceId === PERSONAL_STICKY_WALL_ID) {
      setPersonalTasks(personalTasks.map(t =>
        t.id === taskId ? { ...t, ...updates, updatedAt: new Date() } : t
      ));
      return;
    }

    try {
      const updatedTask = await TaskService.updateTask(token, taskId, updates);
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('Erreur de mise à jour de la task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!token) return;

    // Si c'est une tâche personnelle, supprimer localement
    if (selectedSpaceId === PERSONAL_STICKY_WALL_ID) {
      setPersonalTasks(personalTasks.filter(t => t.id !== taskId));
      return;
    }

    try {
      await TaskService.deleteTask(token, taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('Erreur de suppression de la task:', err);
    }
  };

  const selectedSpace = spaces.find(s => s.id === selectedSpaceId);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Sidebar
        spaces={spaces}
        selectedSpaceId={selectedSpaceId}
        onSelectSpace={setSelectedSpaceId}
        onCreateSpace={handleCreateSpace}
        onLogout={logout}
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
      />

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fafafa' }}>
        {/* Header */}
        <div style={{
          padding: '30px 40px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e5e5',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: 'bold' }}>
            {selectedSpace ? selectedSpace.name : 'Sticky Wall'}
          </h1>
          {selectedSpace && (
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              {selectedSpace.description || 'Espace collaboratif'}
            </p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            margin: '20px 40px',
            padding: '15px',
            backgroundColor: '#ffebee',
            borderLeft: '4px solid #f44336',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#c62828' }}>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#c62828'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            fontSize: '18px',
            color: '#999'
          }}>
            Chargement...
          </div>
        )}

        {/* Empty state */}
        {!loading && (!selectedSpace || tasks.length === 0) && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100vh - 200px)',
            color: '#999'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>
              {!selectedSpace ? 'Sélectionnez un espace' : 'Aucune sticky note'}
            </p>
            {selectedSpace && (
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginTop: '10px'
                }}
              >
                Créer une sticky note
              </button>
            )}
          </div>
        )}

        {/* Sticky notes grid */}
        {!loading && selectedSpace && tasks.length > 0 && (
          <div style={{ padding: '30px 40px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              {tasks.map(task => (
                <StickyNote
                  key={task.id}
                  task={task}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                />
              ))}

              {/* Add button */}
              <div
                onClick={() => setShowCreateModal(true)}
                style={{
                  backgroundColor: '#f0f0f0',
                  borderRadius: '8px',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '2px dashed #ccc',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8e8e8';
                  e.currentTarget.style.borderColor = '#999';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                  e.currentTarget.style.borderColor = '#ccc';
                }}
              >
                <div style={{ fontSize: '48px', color: '#999', marginBottom: '10px' }}>+</div>
                <span style={{ color: '#666', fontSize: '14px' }}>Nouvelle note</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTask}
          colors={COLORS}
        />
      )}
    </div>
  );
};

export default StickyWall;
