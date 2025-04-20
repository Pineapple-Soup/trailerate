"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

interface PlayButtonProps {
  onClick?: () => void;
  iconSize?: number;
  label?: string;
}

/**
 * A rectangular play button that navigates to /play on click.
 */
const Play: React.FC<PlayButtonProps> = ({
  onClick,
  iconSize = 50,
  label = 'Play',
}) => {
  const router = useRouter();

  const handleClick = () => {
    onClick?.();
    router.push('/play');
  };

  return (
    <button
      onClick={handleClick}
      aria-label={label}
      className={
        `font-liberation inline-flex items-center justify-center rounded-md ` +
        `px-4 py-2 bg-[var(--color-accent)] hover:bg-white focus:outline-none ` +
        `focus:ring-2 focus:ring-offset-2 focus:[var(--color-accent)] text-white ` +
        `hover:text-[var(--color-accent)] font-bold space-x-2`
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={iconSize}
        height={iconSize}
        fill="currentColor"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
      <span>{label}</span>
    </button>
  );
};

export default Play;