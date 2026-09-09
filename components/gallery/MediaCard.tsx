'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Trash2 } from 'lucide-react'

interface MediaItem {
  id: string
  name: string
  type: 'photo' | 'video'
  url: string | null
  uploaded_by: string
  created_at: string
}

interface MediaCardProps {
  item: MediaItem
  onDelete: (id: string) => void
}

export default function MediaCard({ item, onDelete }: MediaCardProps) {
  const [hovered, setHovered] = useState(false)
  const router = useRouter()

  function handleClick() {
    router.push(`/photo/${item.id}`)
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        backgroundColor: 'var(--surface)',
        aspectRatio: '1',
      }}
      onClick={handleClick}
    >
      {item.url ? (
        item.type === 'photo' ? (
          <img
            src={item.url}
            alt={item.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <video
              src={item.url}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              muted
              preload="metadata"
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(61,53,48,0.25)',
              }}
            >
              <Play size={32} style={{ color: '#fff' }} />
            </div>
          </div>
        )
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}
        >
          {item.type === 'video' ? <Play size={24} /> : null}
        </div>
      )}

      {/* Нижня панель з інформацією */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(250,247,242,0.92)',
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ overflow: 'hidden' }}>
            <p
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text)',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.name}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              {item.uploaded_by}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`Видалити "${item.name}"?`)) {
                onDelete(item.id)
              }
            }}
            title="Видалити"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#c0392b',
              padding: '4px',
              flexShrink: 0,
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
