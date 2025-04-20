// ✅ src/components/VantaWrapper.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

export default function VantaWrapper({ children }: { children: React.ReactNode }) {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    let retries = 0;
    const tryInit = () => {
      if (!vantaRef.current || vantaEffect) return;

      if (window?.VANTA?.WAVES && window?.THREE) {
        const effect = window.VANTA.WAVES({
          el: vantaRef.current,
          THREE: window.THREE,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          scale: 1.0,
          waveSpeed: 0.45,
          waveHeight: 7.5,
          color: 0x2e3e63,
          minHeight: 200,
          minWidth: 200,
        });
        setVantaEffect(effect);
      } else if (retries < 10) {
        retries++;
        setTimeout(tryInit, 300);
      }
    };

    tryInit();
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js"
        strategy="beforeInteractive"
      />
      <main
        ref={vantaRef}
        className="min-h-screen w-full text-white relative overflow-hidden"
      >
        <div className="relative z-10">{children}</div>
      </main>
    </>
  );
}
