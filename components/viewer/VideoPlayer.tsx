'use client'

interface VideoPlayerProps {
  src: string
  title?: string
}

export default function VideoPlayer({ src, title }: VideoPlayerProps) {
  return (
    <div
      style={{
        backgroundColor: '#1a1612',
        borderRadius: '10px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <video
        src={src}
        controls
        playsInline
        title={title}
        style={{
          width: '100%',
          maxHeight: '70vh',
          display: 'block',
        }}
      >
        Ваш браузер не підтримує відтворення відео.
      </video>
    </div>
  )
}
