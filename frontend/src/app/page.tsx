"use client";

import Image from "next/image";
import Play from "@/components/Play";
import { useState } from "react";
import Create from "@/components/Create";

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
    fetch(
      `${process.env.HTTP_URL}/rooms/validate/${roomCode}`,
      {
        method: "GET",
      }
    )
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
    <main className='h-screen text-white relative overflow-hidden flex items-center justify-center'>
      {error && (
        <div className='font-liberation px-4 py-2 bg-accent text-white rounded-md'>
          {error}
        </div>
      )}
      <div
        className='relative z-10 p-8 rounded-2xl bg-white/10 border border-white/30 backdrop-blur shadow-lg'
        style={{ WebkitBackdropFilter: "blur(8px)" }}>
        <div className='relative z-10 flex flex-col items-center space-y-8'>
          <Image
            src='/assets/logo.png'
            alt='TraileRate Logo'
            width={700} // adjust as needed
            height={360}
            priority
            className='object-contain drop-shadow-md'
          />
        </div>

        <div className='flex items-center justify-center gap-4'>
          <Play link='/play' label='Singleplayer' />
          <Create link='/create' label='Create Room' />
        </div>

        <div>
          <form
            onSubmit={handleSubmit}
            className='flex flex-col items-center justify-center gap-4 mt-4'>
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
      </div>
    </main>
  );
}
