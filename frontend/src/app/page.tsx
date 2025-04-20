"use client";

import Image from "next/image";
import Play from "@/components/Play";
import Create from "@/components/Create";
import { useState } from "react";

export default function Home() {
  const [roomCode, setRoomCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle room code submission
  };

  return (
    <main className='font-liberation min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[var(--color-accent)] to-black space-y-6'>
      <div className='flex items-center space-x-4'>
        <Image
          src='/assets/movie.svg'
          alt='Movie Icon'
          width={64}
          height={64}
          unoptimized
          className='filter brightness-0 invert'
        />
        <h1 className='text-white text-[2rem] font-bold'>TraileR&apos;ate</h1>
      </div>

      <div className='flex items-center justify-center gap-4'>
        <Play link='/play' label='Singleplayer' />
        <Create link='/create' label='Create Room' />
      </div>

      <div>
        <form
          onSubmit={handleSubmit}
          className='flex flex-col items-center justify-center gap-4'>
          <input
            type='number'
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder='Room Code'
            className='p-2 rounded border text-white'
          />
          <button
            type='submit'
            className='font-liberation font-bold px-4 py-2 bg-accent rounded cursor-pointer'>
            Join
          </button>
        </form>
      </div>
    </main>
  );
}
