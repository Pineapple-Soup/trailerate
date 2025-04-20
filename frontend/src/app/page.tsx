"use client";

import Image from "next/image";
import Play from "@/components/Play";
import Script from "next/script";
// import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import Create from "@/components/Create";
// import { useState } from "react";

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

export default function Home() {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);


  useEffect(() => {
    if (typeof window !== "undefined" && window.VANTA && window.THREE && !vantaEffect) {
      setVantaEffect(
        window.VANTA.WAVES({
          el: vantaRef.current,
          THREE: window.THREE,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0x2e3e63,
          waveHeight: 7.5,
          waveSpeed: 0.45,
        })
      );
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError("");
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(
      `https://${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms/validate/${roomCode}`,
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
    <main ref={vantaRef} className="min-h-screen text-white relative overflow-hidden">
      {error && (
        <div className='font-liberation px-4 py-2 bg-accent text-white rounded-md'>
          {error}
        </div>
      )}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js" strategy="beforeInteractive" />
      <div
          className="glass-container relative z-10 p-8 rounded-xl w-full max-w-xl mx-auto mt-12 text-center"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        > 
        {/* https://css.glass/ */}

      {/* https://www.vantajs.com/?effect=waves#(backgroundAlpha:1,color:6963785,gyroControls:!f,minHeight:200,minWidth:200,mouseControls:!t,scale:1,scaleMobile:1,shininess:30,touchControls:!t,waveHeight:7.5,waveSpeed:0.30000000000000004,zoom:1) */}
      <div className='relative z-10 flex flex-col items-center space-y-8'>
        {/* <Image
          src='/assets/movie.svg'
          alt='Movie Icon'
          width={64}
          height={64}
          unoptimized
          className='filter brightness-0 invert'
        /> */}
        <Image
          src="/assets/logo.png"
          alt="TraileRate Logo"
          width={700} // adjust as needed
          height={360}
          priority
          className="object-contain drop-shadow-md"
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
