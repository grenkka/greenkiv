'use client'

import { useState } from 'react'
import { FolderOpen, Trash2, Pencil } from 'lucide-react'

interface Folder {
  id: string
  name: string
  created_by: string
  created_at: string
}

interface FolderCardProps {
  folder: Folder
  onClick: () => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function FolderCard({
  folder,
  onClick,
  onDelete,
  onRename,
}: FolderCardProps) {
  const [hovered, setHovered] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState(folder.name)

  function handleRenameSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newName.trim() && newName.trim() !== folder.name) {
      onRename(folder.id, newName.trim())
    }
    setRenaming(false)
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? 'var(--surface)' : 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
        position: 'relative',
      }}
    >
      <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <FolderOpen
          size={28}
          style={{ color: 'var(--accent)' }}
        />

        {renaming ? (
          <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              onBlur={handleRenameSubmit}
              style={{
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '14px',
                color: 'var(--text)',
                outline: 'none',
                width: '100%',
              }}
            />
          </form>
        ) : (
          <p
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {folder.name}
          </p>
        )}

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          {folder.created_by} · {formatDate(folder.created_at)}
        </p>
      </div>

      {hovered && !renaming && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            display: 'flex',
            gap: '4px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setRenaming(true)
              setNewName(folder.name)
            }}
            title="Перейменувати"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Видалити папку "${folder.name}"?`)) {
                onDelete(folder.id)
              }
            }}
            title="Видалити"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#c0392b',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
