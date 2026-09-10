'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import DropZone from './DropZone'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

interface Folder {
  id: string
  name: string
}

interface FileItem {
  file: File
  status: 'pending' | 'uploading' | 'done' | 'error'
  progress: number
  error?: string
}

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  currentFolderId?: string | null
  onUploaded: () => void
}

export default function UploadModal({
  isOpen,
  onClose,
  currentFolderId,
  onUploaded,
}: UploadModalProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    currentFolderId || ''
  )
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    fetch('/api/folders')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setFolders(data)
      })
      .catch(() => {})
  }, [isOpen])

  useEffect(() => {
    setSelectedFolderId(currentFolderId || '')
  }, [currentFolderId])

  function handleClose() {
    if (uploading) return
    setFiles([])
    onClose()
  }

  function handleFiles(newFiles: File[]) {
    setFiles((prev) => [
      ...prev,
      ...newFiles.map((f) => ({
        file: f,
        status: 'pending' as const,
        progress: 0,
      })),
    ])
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function uploadAll() {
    if (files.length === 0 || uploading) return
    setUploading(true)

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'done') continue

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: 'uploading', progress: 0 } : f
        )
      )

      const file = files[i].file

      try {
        // 1. Отримати підписаний URL для завантаження прямо в R2
        const presignRes = await fetch('/api/media/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        })

        if (!presignRes.ok) {
          const err = await presignRes.json().catch(() => ({}))
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: 'error', error: err.error || 'Помилка' } : f
            )
          )
          continue
        }

        const { uploadUrl, storageKey } = await presignRes.json()

        // 2. Завантажити файл прямо в R2 (оминає Vercel)
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
        })

        if (!uploadRes.ok) {
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: 'error', error: 'Помилка завантаження' } : f
            )
          )
          continue
        }

        // 3. Зберегти метадані в базі
        const confirmRes = await fetch('/api/media/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storageKey,
            name: file.name,
            contentType: file.type,
            size: file.size,
            folderId: selectedFolderId || null,
          }),
        })

        if (confirmRes.ok) {
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: 'done', progress: 100 } : f
            )
          )
        } else {
          const err = await confirmRes.json().catch(() => ({}))
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: 'error', error: err.error || 'Помилка' } : f
            )
          )
        }
      } catch {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'error', error: 'Помилка з\'єднання' } : f
          )
        )
      }
    }

    setUploading(false)
    onUploaded()
  }

  const allDone = files.length > 0 && files.every((f) => f.status === 'done')
  const hasPending = files.some((f) => f.status === 'pending' || f.status === 'error')

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Завантажити файли"
      maxWidth={560}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Вибір папки */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text)',
              marginBottom: '6px',
            }}
          >
            Папка
          </label>
          <select
            value={selectedFolderId}
            onChange={(e) => setSelectedFolderId(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '14px',
              color: 'var(--text)',
              outline: 'none',
            }}
          >
            <option value="">Головна галерея</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <DropZone onFiles={handleFiles} />

        {/* Список файлів */}
        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {files.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: 'var(--surface)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
              >
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text)',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.file.name}
                  </p>
                  <p
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      margin: 0,
                    }}
                  >
                    {(item.file.size / 1024 / 1024).toFixed(1)} МБ
                  </p>
                  {item.status === 'error' && item.error && (
                    <p style={{ fontSize: '11px', color: '#c0392b', margin: 0 }}>
                      {item.error}
                    </p>
                  )}
                </div>

                {item.status === 'uploading' && (
                  <Loader
                    size={16}
                    style={{ color: 'var(--text-muted)', flexShrink: 0, animation: 'spin 1s linear infinite' }}
                  />
                )}
                {item.status === 'done' && (
                  <CheckCircle size={16} style={{ color: '#27ae60', flexShrink: 0 }} />
                )}
                {item.status === 'error' && (
                  <XCircle size={16} style={{ color: '#c0392b', flexShrink: 0 }} />
                )}
                {item.status === 'pending' && (
                  <button
                    onClick={() => removeFile(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: '2px',
                      fontSize: '16px',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Кнопки дії */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleClose}
            disabled={uploading}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text)',
              fontSize: '14px',
              cursor: uploading ? 'not-allowed' : 'pointer',
            }}
          >
            {allDone ? 'Закрити' : 'Скасувати'}
          </button>
          {hasPending && (
            <button
              onClick={uploadAll}
              disabled={uploading || files.length === 0}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: uploading ? 'var(--border)' : 'var(--accent)',
                color: 'var(--text)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: uploading ? 'not-allowed' : 'pointer',
              }}
            >
              {uploading ? 'Завантаження...' : 'Завантажити'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
