'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FolderPlus } from 'lucide-react'
import GalleryHeader from '@/components/gallery/GalleryHeader'
import FolderCard from '@/components/gallery/FolderCard'
import MediaCard from '@/components/gallery/MediaCard'
import SortControls, { SortOption } from '@/components/gallery/SortControls'
import UploadModal from '@/components/upload/UploadModal'

interface Folder {
  id: string
  name: string
  created_by: string
  created_at: string
}

interface MediaItem {
  id: string
  name: string
  type: 'photo' | 'video'
  url: string | null
  uploaded_by: string
  created_at: string
}

interface SearchResults {
  folders: Folder[]
  media: MediaItem[]
}

export default function GalleryPage() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [media, setMedia] = useState<MediaItem[]>([])
  const [sort, setSort] = useState<SortOption>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [memberName, setMemberName] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Отримуємо ім'я користувача
  useEffect(() => {
    fetch('/api/auth/name', { method: 'GET' })
      .then((r) => r.json())
      .then((d) => {
        if (d.memberName) setMemberName(d.memberName)
      })
      .catch(() => {})
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [foldersRes, mediaRes] = await Promise.all([
        fetch('/api/folders'),
        fetch(`/api/media?sort=${sort}`),
      ])

      if (foldersRes.ok) {
        const data = await foldersRes.json()
        setFolders(Array.isArray(data) ? data : [])
      }
      if (mediaRes.ok) {
        const data = await mediaRes.json()
        setMedia(Array.isArray(data) ? data : [])
      }
    } catch {
      // тихо ігноруємо
    } finally {
      setLoading(false)
    }
  }, [sort])

  useEffect(() => {
    if (!searchQuery) {
      loadData()
      setSearchResults(null)
    }
  }, [searchQuery, loadData])

  useEffect(() => {
    if (!searchQuery) {
      loadData()
    }
  }, [sort])

  async function handleSearch(q: string) {
    setSearchQuery(q)
    if (!q.trim()) {
      setSearchResults(null)
      return
    }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data)
      }
    } catch {
      // тихо ігноруємо
    }
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return
    setCreatingFolder(true)
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim() }),
      })
      if (res.ok) {
        setNewFolderName('')
        await loadData()
      }
    } catch {
      // тихо ігноруємо
    } finally {
      setCreatingFolder(false)
    }
  }

  async function handleDeleteFolder(id: string) {
    try {
      await fetch(`/api/folders/${id}`, { method: 'DELETE' })
      setFolders((prev) => prev.filter((f) => f.id !== id))
    } catch {
      // тихо ігноруємо
    }
  }

  async function handleRenameFolder(id: string, name: string) {
    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const updated = await res.json()
        setFolders((prev) => prev.map((f) => (f.id === id ? updated : f)))
      }
    } catch {
      // тихо ігноруємо
    }
  }

  async function handleDeleteMedia(id: string) {
    try {
      await fetch(`/api/media/${id}`, { method: 'DELETE' })
      setMedia((prev) => prev.filter((m) => m.id !== id))
    } catch {
      // тихо ігноруємо
    }
  }

  const displayFolders = searchResults ? searchResults.folders : folders
  const displayMedia = searchResults ? searchResults.media : media

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <GalleryHeader
        memberName={memberName}
        onSearch={handleSearch}
        onUploadClick={() => setUploadOpen(true)}
      />

      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        {searchQuery && (
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              marginBottom: '24px',
            }}
          >
            Результати пошуку для «{searchQuery}»: {displayFolders.length} папок,{' '}
            {displayMedia.length} файлів
          </p>
        )}

        {/* Папки */}
        <section style={{ marginBottom: '40px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
              flexWrap: 'wrap',
            }}
          >
            <h2
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text)',
                margin: 0,
              }}
            >
              Папки
            </h2>

            {/* Нова папка */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleCreateFolder()
              }}
              style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Назва нової папки"
                style={{
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '7px',
                  padding: '5px 10px',
                  fontSize: '13px',
                  color: 'var(--text)',
                  outline: 'none',
                  width: '180px',
                }}
              />
              <button
                type="submit"
                disabled={!newFolderName.trim() || creatingFolder}
                title="Створити папку"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  backgroundColor: newFolderName.trim() ? 'var(--accent)' : 'var(--border)',
                  color: 'var(--text)',
                  border: 'none',
                  borderRadius: '7px',
                  fontSize: '13px',
                  cursor: newFolderName.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                <FolderPlus size={14} />
                Нова папка
              </button>
            </form>
          </div>

          {loading ? (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Завантаження...
            </p>
          ) : displayFolders.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Папок ще немає
            </p>
          ) : (
            <div className="folder-grid">
              {displayFolders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onClick={() => router.push(`/gallery/${folder.id}`)}
                  onDelete={handleDeleteFolder}
                  onRename={handleRenameFolder}
                />
              ))}
            </div>
          )}
        </section>

        {/* Медіафайли */}
        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '16px',
              flexWrap: 'wrap',
            }}
          >
            <h2
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text)',
                margin: 0,
              }}
            >
              Фото і відео
            </h2>
            {!searchQuery && (
              <SortControls value={sort} onChange={setSort} />
            )}
          </div>

          {loading ? (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Завантаження...
            </p>
          ) : displayMedia.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {searchQuery
                ? 'Нічого не знайдено'
                : 'Тут поки немає фото. Завантажте перше!'}
            </p>
          ) : (
            <div className="media-grid">
              {displayMedia.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onDelete={handleDeleteMedia}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        currentFolderId={null}
        onUploaded={loadData}
      />
    </div>
  )
}
