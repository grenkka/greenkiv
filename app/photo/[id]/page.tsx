'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Trash2 } from 'lucide-react'
import VideoPlayer from '@/components/viewer/VideoPlayer'
import PhotoLightbox from '@/components/viewer/PhotoLightbox'
import CommentSection from '@/components/viewer/CommentSection'

interface MediaItem {
  id: string
  name: string
  type: 'photo' | 'video'
  url: string | null
  uploaded_by: string
  created_at: string
  size_bytes: number | null
  folder_id: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`
}

export default function PhotoPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const [item, setItem] = useState<MediaItem | null>(null)
  const [memberName, setMemberName] = useState('')
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch('/api/auth/name')
      .then((r) => r.json())
      .then((d) => { if (d.memberName) setMemberName(d.memberName) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    fetch(`/api/media/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setItem(data)
        else router.push('/gallery')
      })
      .catch(() => router.push('/gallery'))
      .finally(() => setLoading(false))
  }, [id, router])

  async function handleDownload() {
    if (!item?.url) return
    const a = document.createElement('a')
    a.href = item.url
    a.download = item.name
    a.target = '_blank'
    a.click()
  }

  async function handleDelete() {
    if (!item || !confirm(`Видалити "${item.name}"?`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/media/${item.id}`, { method: 'DELETE' })
      if (res.ok) {
        const backUrl = item.folder_id ? `/gallery/${item.folder_id}` : '/gallery'
        router.push(backUrl)
      }
    } catch {
      // тихо ігноруємо
    } finally {
      setDeleting(false)
    }
  }

  function handleBack() {
    if (item?.folder_id) {
      router.push(`/gallery/${item.folder_id}`)
    } else {
      router.push('/gallery')
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: 'var(--text-muted)' }}>Завантаження...</p>
      </div>
    )
  }

  if (!item) return null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Шапка */}
      <header
        style={{
          backgroundColor: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
          padding: '0 24px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={handleBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '14px',
            padding: '4px',
          }}
        >
          <ArrowLeft size={17} />
          Назад
        </button>

        <span
          style={{
            fontSize: '15px',
            fontWeight: 500,
            color: 'var(--text)',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.name}
        </span>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handleDownload}
            title="Завантажити"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            <Download size={15} />
            Завантажити
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Видалити"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '7px',
              backgroundColor: 'transparent',
              border: '1px solid #c0392b',
              borderRadius: '8px',
              color: '#c0392b',
              cursor: deleting ? 'not-allowed' : 'pointer',
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </header>

      <main
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        {/* Медіа */}
        <div>
          {item.type === 'photo' && item.url ? (
            <>
              <img
                src={item.url}
                alt={item.name}
                onClick={() => setLightboxOpen(true)}
                style={{
                  width: '100%',
                  maxHeight: '65vh',
                  objectFit: 'contain',
                  borderRadius: '10px',
                  cursor: 'zoom-in',
                  backgroundColor: 'var(--surface)',
                  display: 'block',
                }}
              />
              <PhotoLightbox
                isOpen={lightboxOpen}
                src={item.url}
                alt={item.name}
                onClose={() => setLightboxOpen(false)}
              />
            </>
          ) : item.type === 'video' && item.url ? (
            <VideoPlayer src={item.url} title={item.name} />
          ) : (
            <div
              style={{
                height: '300px',
                backgroundColor: 'var(--surface)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              Не вдалося завантажити медіафайл
            </div>
          )}
        </div>

        {/* Інформація */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '10px',
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px' }}>
              Автор
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text)', margin: 0, fontWeight: 500 }}>
              {item.uploaded_by}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px' }}>
              Дата
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text)', margin: 0 }}>
              {formatDate(item.created_at)}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px' }}>
              Тип
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text)', margin: 0 }}>
              {item.type === 'photo' ? 'Фото' : 'Відео'}
            </p>
          </div>
          {item.size_bytes && (
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px' }}>
                Розмір
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text)', margin: 0 }}>
                {formatSize(item.size_bytes)}
              </p>
            </div>
          )}
        </div>

        {/* Коментарі */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '24px',
          }}
        >
          <CommentSection mediaId={item.id} currentUser={memberName} />
        </div>
      </main>
    </div>
  )
}
