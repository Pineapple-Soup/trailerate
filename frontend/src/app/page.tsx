// app/page.tsx
import Image from 'next/image';
import Play from '@/components/Play';

export default function Home() {
  return (
    <main className="font-liberation min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[var(--color-accent)] to-black space-y-6">
      <div className="flex items-center space-x-4">
        <Image
          src="/assets/movie.svg"
          alt="Movie Icon"
          width={64}
          height={64}
          unoptimized
          className="filter brightness-0 invert"
        />
        <h1 className="text-white text-[2rem] font-bold">
          TraileR&apos;ate
        </h1>
      </div>
      <Play />
    </main>
  );
}
