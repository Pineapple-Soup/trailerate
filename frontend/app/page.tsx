'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [title, setTitle] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrailer = async () => {
      try {
        const res = await fetch('/api/random');
        const data = await res.json();

        setTitle(data.title);
        const url = data.youtube_url;
        const match = url?.match(/v=([^&]+)/);
        if (match) {
          setVideoId(match[1]);
        }
      } catch (err) {
        console.error("Failed to fetch trailer:", err);
      }
    };

    fetchTrailer();
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>TraileR&apos;ate</h1>
      {title && <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{title}</h2>}
      {videoId ? (
        <iframe
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1`}
          title="YouTube trailer"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      ) : (
        <p>Loading trailer...</p>
      )}
    </main>
  );
}
