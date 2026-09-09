'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Upload, LogOut, X } from 'lucide-react'

interface GalleryHeaderProps {
  memberName: string
  onSearch: (q: string) => void
  onUploadClick: () => void
}

export default function GalleryHeader({
  memberName,
  onSearch,
  onUploadClick,
}: GalleryHeaderProps) {
  const [searchValue, setSearchValue] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchValue(e.target.value)
    onSearch(e.target.value)
  }

  function clearSearch() {
    setSearchValue('')
    onSearch('')
    setMobileSearchOpen(false)
  }

  return (
    <header style={{
      backgroundColor: 'var(--bg)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      {/* Main row */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        {/* Logo */}
        <span style={{
          fontSize: '17px',
          fontWeight: 600,
          color: 'var(--text)',
          letterSpacing: '0.05em',
          flexShrink: 0,
        }}>
          greenkiv
        </span>

        {/* Desktop search */}
        <div className="header-search-desktop" style={{ flex: 1, maxWidth: '360px' }}>
          <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="search"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Пошук..."
              style={{
                width: '100%',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '7px 12px 7px 30px',
                fontSize: '14px',
                color: 'var(--text)',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Member name (desktop only) */}
        <span className="header-name" style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {memberName}
        </span>

        {/* Mobile search icon */}
        <button
          className="header-search-mobile"
          onClick={() => setMobileSearchOpen((v) => !v)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '8px', display: 'flex', alignItems: 'center',
          }}
          title="Пошук"
        >
          <Search size={18} />
        </button>

        {/* Upload */}
        <button
          onClick={onUploadClick}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px',
            backgroundColor: 'var(--accent)',
            color: 'var(--text)',
            border: 'none', borderRadius: '8px',
            fontSize: '14px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          <Upload size={15} />
          <span style={{ display: 'none' }} className="upload-label">Додати</span>
          <style>{`@media(min-width:480px){.upload-label{display:inline}}`}</style>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '8px', display: 'flex', alignItems: 'center',
          }}
          title="Вийти"
        >
          <LogOut size={17} />
        </button>
      </div>

      {/* Mobile search row */}
      {mobileSearchOpen && (
        <div style={{
          padding: '8px 16px 12px',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              autoFocus
              type="search"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Пошук по фото, папках..."
              style={{
                width: '100%',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '9px 36px 9px 30px',
                fontSize: '16px',
                color: 'var(--text)',
                outline: 'none',
              }}
            />
            {searchValue && (
              <button
                onClick={clearSearch}
                style={{
                  position: 'absolute', right: '8px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: '4px', display: 'flex',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
