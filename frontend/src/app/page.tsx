"use client";

import Image from "next/image";
import Play from "@/components/Play";
import Create from "@/components/Create";
import { useState } from "react";

export default function Home() {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError("");
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms/validate/${roomCode}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          showError("Failed to validate room code");
          throw new Error("Failed to validate room code");
        }
        return response.json();
      })
      .then((data) => {
        if (!data.exists) {
          showError("Invalid room code");
          throw new Error("Invalid room code");
        }
        console.log("Room validated:", data);
        // Handle successful validation (e.g., navigate to the room)
        window.location.href = `/room/${roomCode}`;
      })
      .catch((error) => {
        console.error(error);
        // Handle validation error (e.g., show an error message)
      });
  };

  return (
    <main className='font-liberation min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[var(--color-accent)] to-black space-y-6'>
      {error && (
        <div className='font-liberation px-4 py-2 bg-accent text-white rounded-md'>
          {error}
        </div>
      )}

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
