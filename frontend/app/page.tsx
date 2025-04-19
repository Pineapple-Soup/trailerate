// app/page.tsx
import Image from 'next/image';
import localFont from 'next/font/local';

// Load Liberation Sans local font variants

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom, var(--color-accent), #000)',
      }}
    >
      <Image
        src="/assets/movie.svg"
        alt="Movie Icon"
        width={64}
        height={64}
        unoptimized
        style={{ marginRight: '1rem', filter: 'brightness(0) invert(1)' }}
      />
      <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, font: 'Liberation Sans Regular' }}>
        TraileR&apos;ate
      </h1>
    </main>
  );
}