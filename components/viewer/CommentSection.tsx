'use client'

import { useState, useEffect } from 'react'
import { Send } from 'lucide-react'

interface Comment {
  id: string
  author: string
  content: string
  created_at: string
}

interface CommentSectionProps {
  mediaId: string
  currentUser: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function CommentSection({
  mediaId,
  currentUser,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [mediaId])

  async function loadComments() {
    setLoading(true)
    try {
      const res = await fetch(`/api/comments?media_id=${mediaId}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch {
      // тихо ігноруємо
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_id: mediaId, content: text.trim() }),
      })

      if (res.ok) {
        const newComment = await res.json()
        setComments((prev) => [...prev, newComment])
        setText('')
      }
    } catch {
      // тихо ігноруємо
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--text)',
          margin: 0,
        }}
      >
        Коментарі{comments.length > 0 ? ` (${comments.length})` : ''}
      </h3>

      {loading ? (
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
          Завантаження...
        </p>
      ) : comments.length === 0 ? (
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
          Коментарів ще немає. Будьте першим!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '8px',
                padding: '12px 14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px',
                  marginBottom: '6px',
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text)',
                  }}
                >
                  {comment.author}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--text)',
                  margin: 0,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Форма додавання коментаря */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Написати від ${currentUser}...`}
          disabled={submitting}
          style={{
            flex: 1,
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '9px 12px',
            fontSize: '14px',
            color: 'var(--text)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!text.trim() || submitting}
          title="Надіслати"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '9px 14px',
            backgroundColor: text.trim() && !submitting ? 'var(--accent)' : 'var(--border)',
            color: 'var(--text)',
            border: 'none',
            borderRadius: '8px',
            cursor: text.trim() && !submitting ? 'pointer' : 'not-allowed',
            flexShrink: 0,
          }}
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}
