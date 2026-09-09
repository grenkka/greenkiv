'use client'

import { useState } from 'react'
import { ImagePlus } from 'lucide-react'

const ACCEPTED = '.jpg,.jpeg,.png,.heic,.heif,.mp4,.mov'

interface DropZoneProps {
  onFiles: (files: File[]) => void
}

export default function DropZone({ onFiles }: DropZoneProps) {
  const [dragging, setDragging] = useState(false)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) onFiles(files)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) onFiles(files)
    e.target.value = ''
  }

  return (
    <label
      htmlFor="dropzone-input"
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: '10px',
        backgroundColor: dragging ? 'var(--surface)' : 'var(--bg)',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <ImagePlus
        size={32}
        style={{ color: dragging ? 'var(--accent)' : 'var(--text-muted)' }}
      />
      <p
        style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          margin: 0,
        }}
      >
        Перетягніть файли або{' '}
        <span style={{ color: 'var(--text)', fontWeight: 500 }}>
          натисніть для вибору
        </span>
      </p>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
        JPG, PNG, HEIC, MP4, MOV
      </p>
      <input
        id="dropzone-input"
        type="file"
        accept={ACCEPTED}
        multiple
        onChange={handleChange}
        style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
      />
    </label>
  )
}
