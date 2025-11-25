import { useState } from 'react';
import type { Space } from '../../types/space';

interface SidebarProps {
  spaces: Space[];
  selectedSpaceId: string | null;
  onSelectSpace: (spaceId: string | null) => void;
  onCreateSpace: () => void;
  onLogout: () => void;
  currentFilter: 'all' | 'today' | 'upcoming';
  onFilterChange: (filter: 'all' | 'today' | 'upcoming') => void;
}

const Sidebar = ({
  spaces,
  selectedSpaceId,
  onSelectSpace,
  onCreateSpace,
  onLogout,
  currentFilter,
  onFilterChange
}: SidebarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div style={{
      width: '240px',
      backgroundColor: '#f8f9fa',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #e5e5e5',
      position: 'sticky',
      top: 0
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e5e5e5'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Menu</h2>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ☰
          </button>
        </div>

        {/* Search bar */}
        <div style={{
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="Search"
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
          <span style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#999'
          }}>🔍</span>
        </div>
      </div>

      {/* Tasks section */}
      <div style={{
        padding: '20px 15px 15px 15px',
        borderBottom: '1px solid #e5e5e5'
      }}>
        <h3 style={{
          margin: '0 0 10px 0',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#999',
          textTransform: 'uppercase'
        }}>TASKS</h3>

        <button
          onClick={() => onFilterChange('upcoming')}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '8px 12px',
            marginBottom: '5px',
            border: 'none',
            background: currentFilter === 'upcoming' ? '#e5e5e5' : 'transparent',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📅</span> Upcoming
          <span style={{ marginLeft: 'auto', color: '#999', fontSize: '12px' }}>12</span>
        </button>

        <button
          onClick={() => onFilterChange('today')}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '8px 12px',
            marginBottom: '5px',
            border: 'none',
            background: currentFilter === 'today' ? '#e5e5e5' : 'transparent',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📆</span> Today
          <span style={{ marginLeft: 'auto', color: '#999', fontSize: '12px' }}>5</span>
        </button>

        <button
          onClick={() => onSelectSpace('personal-sticky-wall')}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '8px 12px',
            border: 'none',
            background: selectedSpaceId === 'personal-sticky-wall' ? '#e5e5e5' : 'transparent',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📋</span> Sticky Wall
        </button>
      </div>

      {/* Lists section */}
      <div style={{
        padding: '20px 15px',
        flex: 1,
        overflowY: 'auto'
      }}>
        <h3 style={{
          margin: '0 0 10px 0',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#999',
          textTransform: 'uppercase'
        }}>LISTS</h3>

        {spaces.map((space) => (
          <button
            key={space.id}
            onClick={() => onSelectSpace(space.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '8px 12px',
              marginBottom: '5px',
              border: 'none',
              background: selectedSpaceId === space.id ? '#e5e5e5' : 'transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#A8E6CF',
              display: 'inline-block'
            }} />
            {space.name}
            <span style={{ marginLeft: 'auto', color: '#999', fontSize: '12px' }}>
              {space.usersList.length}
            </span>
          </button>
        ))}

        <button
          onClick={onCreateSpace}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '8px 12px',
            marginTop: '10px',
            border: 'none',
            background: 'transparent',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>+</span> Add New List
        </button>
      </div>

      {/* Tags section (placeholder) */}
      <div style={{
        padding: '15px',
        borderTop: '1px solid #e5e5e5'
      }}>
        <h3 style={{
          margin: '0 0 10px 0',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#999',
          textTransform: 'uppercase'
        }}>TAGS</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            padding: '4px 12px',
            backgroundColor: '#B3D9FF',
            borderRadius: '12px',
            fontSize: '12px'
          }}>Tag 1</span>
          <span style={{
            padding: '4px 12px',
            backgroundColor: '#FFD6A5',
            borderRadius: '12px',
            fontSize: '12px'
          }}>Tag 2</span>
          <button style={{
            padding: '4px 8px',
            background: 'transparent',
            border: 'none',
            fontSize: '12px',
            color: '#666',
            cursor: 'pointer'
          }}>+ Add Tag</button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '15px',
        borderTop: '1px solid #e5e5e5'
      }}>
        <button
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '8px 12px',
            marginBottom: '5px',
            border: 'none',
            background: 'transparent',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>⚙️</span> Settings
        </button>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '8px 12px',
            border: 'none',
            background: 'transparent',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🚪</span> Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
