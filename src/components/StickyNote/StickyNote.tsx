import { useState } from 'react';
import type { Task, TodoItem } from '../../types/space';

interface StickyNoteProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

const StickyNote = ({ task, onUpdate, onDelete }: StickyNoteProps) => {
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(task.name);

  const handleAddItem = () => {
    if (!newItemText.trim()) return;

    const newItem: TodoItem = {
      id: `item-${Date.now()}`,
      text: newItemText.trim(),
      completed: false
    };

    onUpdate(task.id, {
      items: [...task.items, newItem]
    });

    setNewItemText('');
  };

  const handleToggleItem = (itemId: string) => {
    const updatedItems = task.items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onUpdate(task.id, { items: updatedItems });
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = task.items.filter(item => item.id !== itemId);
    onUpdate(task.id, { items: updatedItems });
  };

  const handleStartEditItem = (item: TodoItem) => {
    setEditingItemId(item.id);
    setEditingText(item.text);
  };

  const handleSaveEditItem = (itemId: string) => {
    if (!editingText.trim()) {
      handleDeleteItem(itemId);
      setEditingItemId(null);
      return;
    }

    const updatedItems = task.items.map(item =>
      item.id === itemId ? { ...item, text: editingText.trim() } : item
    );
    onUpdate(task.id, { items: updatedItems });
    setEditingItemId(null);
  };

  const handleSaveTitle = () => {
    if (titleText.trim()) {
      onUpdate(task.id, { name: titleText.trim() });
    } else {
      setTitleText(task.name);
    }
    setEditingTitle(false);
  };

  return (
    <div
      style={{
        backgroundColor: task.color,
        borderRadius: '8px',
        padding: '20px',
        minHeight: '200px',
        maxHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
    >
      {/* Header with title and action buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px'
      }}>
        {editingTitle ? (
          <input
            type="text"
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') {
                setTitleText(task.name);
                setEditingTitle(false);
              }
            }}
            autoFocus
            style={{
              flex: 1,
              fontSize: '18px',
              fontWeight: 'bold',
              border: '2px solid rgba(0,0,0,0.2)',
              borderRadius: '4px',
              padding: '4px 8px',
              backgroundColor: 'rgba(255,255,255,0.5)',
              outline: 'none'
            }}
          />
        ) : (
          <h3
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 'bold',
              flex: 1,
              wordBreak: 'break-word'
            }}
          >
            {task.name}
          </h3>
        )}
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0, marginLeft: '8px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingTitle(true);
            }}
            style={{
              background: 'rgba(0,0,0,0.1)',
              border: 'none',
              borderRadius: '4px',
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,120,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
            }}
          >
            ✎
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Supprimer cette note ?')) {
                onDelete(task.id);
              }
            }}
            style={{
              background: 'rgba(0,0,0,0.1)',
              border: 'none',
              borderRadius: '4px',
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Items list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '10px'
      }}>
        {task.items.map(item => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
              gap: '8px'
            }}
          >
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => handleToggleItem(item.id)}
              style={{
                cursor: 'pointer',
                width: '16px',
                height: '16px',
                flexShrink: 0
              }}
            />

            {editingItemId === item.id ? (
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={() => handleSaveEditItem(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEditItem(item.id);
                  if (e.key === 'Escape') setEditingItemId(null);
                }}
                autoFocus
                style={{
                  flex: 1,
                  border: '1px solid rgba(0,0,0,0.2)',
                  borderRadius: '3px',
                  padding: '4px 6px',
                  fontSize: '14px',
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  outline: 'none'
                }}
              />
            ) : (
              <span
                style={{
                  flex: 1,
                  fontSize: '14px',
                  textDecoration: item.completed ? 'line-through' : 'none',
                  opacity: item.completed ? 0.6 : 1,
                  wordBreak: 'break-word'
                }}
              >
                {item.text}
              </span>
            )}

            <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
              <button
                onClick={() => handleStartEditItem(item)}
                style={{
                  background: 'rgba(0,0,0,0.1)',
                  border: 'none',
                  borderRadius: '3px',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,120,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
                }}
              >
                ✎
              </button>
              <button
                onClick={() => handleDeleteItem(item.id)}
                style={{
                  background: 'rgba(0,0,0,0.1)',
                  border: 'none',
                  borderRadius: '3px',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
                }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new item */}
      <div style={{
        display: 'flex',
        gap: '8px',
        paddingTop: '10px',
        borderTop: '1px solid rgba(0,0,0,0.1)'
      }}>
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddItem();
          }}
          placeholder="Ajouter une tâche..."
          style={{
            flex: 1,
            border: '1px solid rgba(0,0,0,0.2)',
            borderRadius: '4px',
            padding: '6px 10px',
            fontSize: '14px',
            backgroundColor: 'rgba(255,255,255,0.5)',
            outline: 'none'
          }}
        />
        <button
          onClick={handleAddItem}
          style={{
            background: 'rgba(0,0,0,0.2)',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'background 0.2s',
            color: '#333'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default StickyNote;
