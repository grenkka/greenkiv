'use client'

import { useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface PhotoLightboxProps {
  isOpen: boolean
  src: string
  alt?: string
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
}

export default function PhotoLightbox({
  isOpen,
  src,
  alt = '',
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: PhotoLightboxProps) {
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev && onPrev) onPrev()
      if (e.key === 'ArrowRight' && hasNext && onNext) onNext()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose, onPrev, onNext, hasPrev, hasNext])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 50) return // too short
    if (dx < 0 && hasNext && onNext) onNext()
    if (dx > 0 && hasPrev && onPrev) onPrev()
  }

  return (
    <div
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(30, 25, 22, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'pan-y',
      }}
    >
      {/* Закрити */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%',
          color: '#fff', cursor: 'pointer', padding: '8px',
          display: 'flex', alignItems: 'center', zIndex: 1,
          width: '40px', height: '40px', justifyContent: 'center',
        }}
      >
        <X size={20} />
      </button>

      {/* Попереднє */}
      {hasPrev && onPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          style={{
            position: 'absolute', left: '8px',
            background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '8px',
            color: '#fff', cursor: 'pointer', padding: '12px 6px',
            display: 'flex', alignItems: 'center',
          }}
        >
          <ChevronLeft size={26} />
        </button>
      )}

      {/* Фото */}
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '96vw',
          maxHeight: '92vh',
          objectFit: 'contain',
          borderRadius: '4px',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />

      {/* Наступне */}
      {hasNext && onNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext() }}
          style={{
            position: 'absolute', right: '8px',
            background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '8px',
            color: '#fff', cursor: 'pointer', padding: '12px 6px',
            display: 'flex', alignItems: 'center',
          }}
        >
          <ChevronRight size={26} />
        </button>
      )}
    </div>
  )
}
