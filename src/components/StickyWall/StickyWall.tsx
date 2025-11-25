import { useState, useEffect, useMemo } from 'react';
import type { Space, Task } from '../../types/space';
import Sidebar from '../Sidebar/Sidebar';
import StickyNote from '../StickyNote/StickyNote';
import CreateTaskModal from '../CreateTaskModal/CreateTaskModal';
import SpaceService, { type CreateSpacePayload } from '../../services/spaceService';
import TaskService from '../../services/taskService';
import UserServices, { type UserPreview } from '../../services/userServices';
import { useAuth } from '../../context/AuthContext';
import CreateSpaceModal from '../Spaces/CreateSpaceModal';

const COLORS = [
  '#A8E6CF', // mint green pastel
  '#B3D9FF', // sky blue pastel
  '#FFD6A5', // peach pastel
  '#FFABAB', // pink pastel
  '#D4A5D4', // lavender pastel
  '#C2F0FC', // cyan pastel
];

const PERSONAL_STICKY_WALL_ID = 'personal-sticky-wall';

type MemberAction = 'idle' | 'add' | 'remove';

const buildPersonalStickyWall = (): Space => ({
  id: PERSONAL_STICKY_WALL_ID,
  name: 'Sticky Wall',
  description: 'Mon espace personnel',
  maxUsers: 1,
  adminList: [],
  usersList: [],
  createdAt: new Date(),
  updatedAt: new Date()
});

const reorderSpaces = (spaceList: Space[]): Space[] => {
  const personal = spaceList.find(space => space.id === PERSONAL_STICKY_WALL_ID);
  const others = spaceList.filter(space => space.id !== PERSONAL_STICKY_WALL_ID);
  return personal ? [personal, ...others] : others;
};

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
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [spaceModalLoading, setSpaceModalLoading] = useState(false);
  const [spaceModalError, setSpaceModalError] = useState<string | null>(null);
  const [memberUserId, setMemberUserId] = useState('');
  const [memberAction, setMemberAction] = useState<MemberAction>('idle');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<UserPreview[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userSearchError, setUserSearchError] = useState<string | null>(null);
  const [selectedUserPreview, setSelectedUserPreview] = useState<UserPreview | null>(null);

  // Charger les spaces
  useEffect(() => {
    const loadSpaces = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const loadedSpaces = await SpaceService.getAllSpaces();
        const personalStickyWall = buildPersonalStickyWall();

        const allSpaces = reorderSpaces([personalStickyWall, ...loadedSpaces]);
        setSpaces(allSpaces);

        // Si aucun espace n'est sélectionné, sélectionner le premier espace non-personnel ou le personnel
        setSelectedSpaceId(prev => {
          if (prev) {
            // Vérifier que l'espace sélectionné existe toujours
            const exists = allSpaces.some(s => s.id === prev);
            if (exists) return prev;
          }
          // Sinon, sélectionner le premier espace non-personnel ou le personnel
          const firstNonPersonal = loadedSpaces.find(s => s.id !== PERSONAL_STICKY_WALL_ID);
          return firstNonPersonal?.id ?? personalStickyWall.id;
        });
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
        const loadedTasks = await TaskService.getAllTasksBySpace(selectedSpaceId);
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

  const handleOpenSpaceModal = () => {
    setSpaceModalError(null);
    setShowSpaceModal(true);
  };

  const handleCloseSpaceModal = () => {
    setShowSpaceModal(false);
    setSpaceModalError(null);
  };

  const handleSubmitSpace = async (payload: CreateSpacePayload) => {
    setSpaceModalLoading(true);
    setSpaceModalError(null);
    try {
      const newSpace = await SpaceService.createSpace(payload);
      setSpaces(previous => {
        const withoutDuplicate = previous.filter(space => space.id !== newSpace.id);
        return reorderSpaces([...withoutDuplicate, newSpace]);
      });
      setSelectedSpaceId(newSpace.id);
      setShowSpaceModal(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création de l\'espace';
      setSpaceModalError(message);
    } finally {
      setSpaceModalLoading(false);
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
      const newTask = await TaskService.createTask(selectedSpaceId, {
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
      const updatedTask = await TaskService.updateTask(taskId, updates);
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
      await TaskService.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('Erreur de suppression de la task:', err);
    }
  };

  const handleSearchUser = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const query = userSearchQuery.trim();
    if (!query || userSearchLoading) {
      return;
    }

    try {
      setUserSearchLoading(true);
      setUserSearchResults([]);
      setUserSearchError(null);
      const results = await UserServices.search(query);
      if (!results.length) {
        setUserSearchError('Aucun utilisateur trouvé');
      }
      setUserSearchResults(results);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Impossible de rechercher cet utilisateur';
      setUserSearchError(message);
    } finally {
      setUserSearchLoading(false);
    }
  };

  const handleSelectUser = (user: UserPreview) => {
    setMemberUserId(user.id);
    setSelectedUserPreview(user);
    setUserSearchResults([]);
    setUserSearchError(null);
    setUserSearchQuery(user.email);
  };

  const handleClearSelectedUser = () => {
    setMemberUserId('');
    setSelectedUserPreview(null);
    setUserSearchResults([]);
  };

  const selectedSpace = useMemo(
    () => spaces.find(space => space.id === selectedSpaceId) ?? null,
    [spaces, selectedSpaceId]
  );

  const handleMemberAction = async (action: Exclude<MemberAction, 'idle'>) => {
    // Utiliser selectedSpaceId directement si selectedSpace est null (cas où l'espace n'est pas encore chargé)
    const currentSpaceId = selectedSpace?.id ?? selectedSpaceId;
    
    if (!token) {
      setError('Vous devez être connecté');
      return;
    }
    
    if (!currentSpaceId) {
      setError('Veuillez sélectionner un espace dans la sidebar');
      return;
    }
    
    if (currentSpaceId === PERSONAL_STICKY_WALL_ID) {
      setError('Vous ne pouvez pas ajouter d\'utilisateurs à votre espace personnel');
      return;
    }

    const trimmedUserId = memberUserId.trim();
    if (!trimmedUserId) {
      setError('Veuillez sélectionner un utilisateur');
      return;
    }
    
    if (memberAction !== 'idle') {
      return;
    }

    try {
      setMemberAction(action);
      setError(null);

      const updatedSpace =
        action === 'add'
          ? await SpaceService.addUser(currentSpaceId, trimmedUserId)
          : await SpaceService.removeUser(currentSpaceId, trimmedUserId);
      
      setSpaces(previous =>
        previous.map(space => (space.id === updatedSpace.id ? updatedSpace : space))
      );
      setMemberUserId('');
      setSelectedUserPreview(null);
      setUserSearchQuery('');
      setUserSearchResults([]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Impossible de mettre à jour les utilisateurs';
      setError(message);
      console.error('Erreur lors de la mise à jour des membres:', err);
    } finally {
      setMemberAction('idle');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Sidebar
        spaces={spaces}
        selectedSpaceId={selectedSpaceId}
        onSelectSpace={setSelectedSpaceId}
        onCreateSpace={handleOpenSpaceModal}
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
          {!selectedSpaceId && (
            <p style={{ margin: '8px 0 0', color: '#f44336', fontSize: '14px' }}>
              ⚠️ Veuillez sélectionner un espace dans la sidebar
            </p>
          )}
          {selectedSpaceId && (
            <>
              {selectedSpace && (
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  {selectedSpace.description || 'Espace collaboratif'}
                </p>
              )}

              {selectedSpaceId !== PERSONAL_STICKY_WALL_ID && (
                <div
                  style={{
                    marginTop: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <form
                    onSubmit={handleSearchUser}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      alignItems: 'center'
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Nom, prénom ou email"
                      value={userSearchQuery}
                      onChange={(event) => {
                        setUserSearchQuery(event.target.value);
                        setUserSearchError(null);
                      }}
                      style={{
                        flex: 1,
                        minWidth: '220px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #dcdcdc',
                        fontSize: '14px'
                      }}
                      autoComplete="off"
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#1976d2',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: userSearchLoading ? 'not-allowed' : 'pointer'
                      }}
                      disabled={userSearchLoading || !userSearchQuery.trim()}
                    >
                      {userSearchLoading ? 'Recherche...' : 'Rechercher'}
                    </button>
                  </form>

                  {userSearchError && (
                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#fdecea',
                        border: '1px solid #f5c6cb',
                        color: '#a94442'
                      }}
                    >
                      {userSearchError}
                    </div>
                  )}

                  {userSearchResults.length > 0 && (
                    <div
                      style={{
                        border: '1px solid #dcdcdc',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}
                    >
                      {userSearchResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleSelectUser(user)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px 16px',
                            border: 'none',
                            borderBottom: '1px solid #eee',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>
                            {user.firstname} {user.lastname}
                          </span>
                          <span style={{ fontSize: '13px', color: '#666' }}>{user.email}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedUserPreview && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        alignItems: 'center',
                        padding: '12px',
                        border: '1px solid #dcdcdc',
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9'
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontWeight: 600 }}>
                          {selectedUserPreview.firstname} {selectedUserPreview.lastname}
                        </p>
                        <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>
                          {selectedUserPreview.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearSelectedUser}
                        style={{
                          marginLeft: 'auto',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #dcdcdc',
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        Changer
                      </button>
                    </div>
                  )}

                  {!selectedUserPreview && (
                    <p style={{ margin: 0, color: '#999', fontSize: '13px', fontStyle: 'italic' }}>
                      Recherchez et sélectionnez un utilisateur pour l&apos;ajouter ou le retirer
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleMemberAction('add')}
                      disabled={!memberUserId.trim() || memberAction !== 'idle'}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: memberUserId.trim() && memberAction === 'idle' ? '#4CAF50' : '#ccc',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: memberUserId.trim() && memberAction === 'idle' ? 'pointer' : 'not-allowed',
                        opacity: memberUserId.trim() && memberAction === 'idle' ? 1 : 0.6
                      }}
                    >
                      {memberAction === 'add' ? 'Ajout...' : 'Ajouter'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMemberAction('remove')}
                      disabled={!memberUserId.trim() || memberAction !== 'idle'}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid #f44336',
                        backgroundColor: '#fff',
                        color: memberUserId.trim() && memberAction === 'idle' ? '#f44336' : '#ccc',
                        fontWeight: 600,
                        cursor: memberUserId.trim() && memberAction === 'idle' ? 'pointer' : 'not-allowed',
                        opacity: memberUserId.trim() && memberAction === 'idle' ? 1 : 0.6
                      }}
                    >
                      {memberAction === 'remove' ? 'Retrait...' : 'Retirer'}
                    </button>
                  </div>
                </div>
              )}
            </>
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

      {showSpaceModal && (
        <CreateSpaceModal
          onClose={handleCloseSpaceModal}
          onSubmit={handleSubmitSpace}
          loading={spaceModalLoading}
          error={spaceModalError}
        />
      )}
    </div>
  );
};

export default StickyWall;
