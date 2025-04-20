'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/random')
      .then(res => res.json())
      .then(data => {
        setTitle(data.title);
        setVideoUrl(data.youtube_url);
      });
  }, []);

  const getVideoId = (url: string): string | null => {
    const match = url.match(/v=([^&]+)/);
    return match ? match[1] : null;
  };

  const videoId = videoUrl ? getVideoId(videoUrl) : null;

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      color: '#fff'
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>TraileR&apos;ate</h1>
      {title && <h2>{title}</h2>}
      {videoId && (
        <iframe
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube trailer"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{ marginTop: '1rem' }}
        />
      )}
    </main>
  );
}
