'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FolderPlus } from 'lucide-react'
import GalleryHeader from '@/components/gallery/GalleryHeader'
import FolderCard from '@/components/gallery/FolderCard'
import MediaCard from '@/components/gallery/MediaCard'
import Breadcrumb from '@/components/gallery/Breadcrumb'
import SortControls, { SortOption } from '@/components/gallery/SortControls'
import UploadModal from '@/components/upload/UploadModal'

interface Folder {
  id: string
  name: string
  created_by: string
  created_at: string
  parent_id: string | null
}

interface MediaItem {
  id: string
  name: string
  type: 'photo' | 'video'
  url: string | null
  uploaded_by: string
  created_at: string
}

export default function FolderPage() {
  const params = useParams()
  const folderId = params.folderId as string
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null)
  const [subFolders, setSubFolders] = useState<Folder[]>([])
  const [media, setMedia] = useState<MediaItem[]>([])
  const [sort, setSort] = useState<SortOption>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [memberName, setMemberName] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/name', { method: 'GET' })
      .then((r) => r.json())
      .then((d) => { if (d.memberName) setMemberName(d.memberName) })
      .catch(() => {})
  }, [])

  // Завантажуємо дані поточної папки
  useEffect(() => {
    fetch(`/api/folders/${folderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setCurrentFolder(data)
      })
      .catch(() => {})
  }, [folderId])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [foldersRes, mediaRes] = await Promise.all([
        fetch(`/api/folders?parent_id=${folderId}`),
        fetch(`/api/media?folder_id=${folderId}&sort=${sort}`),
      ])

      if (foldersRes.ok) {
        const data = await foldersRes.json()
        setSubFolders(Array.isArray(data) ? data : [])
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
  }, [folderId, sort])

  useEffect(() => {
    loadData()
  }, [loadData])

  function handleSearch(q: string) {
    setSearchQuery(q)
    if (q.trim()) {
      router.push(`/gallery?search=${encodeURIComponent(q)}`)
    }
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return
    setCreatingFolder(true)
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim(), parent_id: folderId }),
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
      setSubFolders((prev) => prev.filter((f) => f.id !== id))
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
        setSubFolders((prev) => prev.map((f) => (f.id === id ? updated : f)))
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

  const breadcrumbItems = [
    { label: 'Головна', href: '/gallery' },
    ...(currentFolder
      ? [{ label: currentFolder.name, href: `/gallery/${folderId}` }]
      : []),
  ]

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
        <div style={{ marginBottom: '28px' }}>
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Підпапки */}
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

            <form
              onSubmit={(e) => { e.preventDefault(); handleCreateFolder() }}
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
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Завантаження...</p>
          ) : subFolders.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Немає підпапок</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '12px',
              }}
            >
              {subFolders.map((folder) => (
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
            <SortControls value={sort} onChange={setSort} />
          </div>

          {loading ? (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Завантаження...</p>
          ) : media.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              У цій папці ще немає фото
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '12px',
              }}
            >
              {media.map((item) => (
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
        currentFolderId={folderId}
        onUploaded={loadData}
      />
    </div>
  )
}
