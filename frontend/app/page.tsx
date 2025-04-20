// app/page.tsx
import Image from "next/image";

export default function Home() {
  return (
    <main className='font-liberation min-h-screen flex flex-row items-center justify-center bg-gradient-to-t to-accent'>
      <Image
        src='/assets/movie.svg'
        alt='Movie Icon'
        width={64}
        height={64}
        unoptimized
        className='mr-4 filter brightness-0 invert'
      />
      <h1 className='text-white text-[2rem] font-bold'>TraileR&apos;ate</h1>
    </main>
  );
}
