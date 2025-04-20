"use client";

import { useEffect, useState } from "react";
import YoutubeEmbed from "@/components/YouTubeEmbed";
import { Movie } from "@/types/Movie";
import Link from "next/link";

const totalRounds = 3;

const Play = () => {
  const [round, setRound] = useState(1);
  const [guess, setGuess] = useState("");
  const [roundScore, setRoundScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);

  // Fetch a new movie when the round changes (only if not already submitted)
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/random_movie");
        // const res = await fetch("http://localhost:8000/random_movie");
        const data = await res.json();
        console.log(data)
        setCurrentMovie(data);
        console.log(currentMovie)
      } catch (err) {
        console.error("Failed to fetch movie:", err);
      }
    };

    if (!submitted && !gameOver) {
      fetchMovie();
    }
  }, [round, submitted, gameOver]);

  const handleSubmit = () => {
    const guessNum = parseInt(guess);
    if (isNaN(guessNum) || guessNum < 0 || guessNum > 100) return;

    const imdbRating = parseFloat(currentMovie?.imdb_rating || "0");
    if (isNaN(imdbRating)) return;

    const actualScore = Math.round(imdbRating * 10);
    const score = 100 - Math.abs(actualScore - guessNum);

    setRoundScore(score);
    setTotalScore((prevTotalScore) => prevTotalScore + score);
    setSubmitted(true);
  };

  const nextRound = () => {
    if (round === totalRounds) {
      setGameOver(true);
    } else {
      setRound((prev) => prev + 1);
      setGuess("");
      setSubmitted(false);
    }
  };

  const replayGame = () => {
    setRound(1);
    setGuess("");
    setRoundScore(0);
    setTotalScore(0);
    setSubmitted(false);
    setGameOver(false);
    setCurrentMovie(null); 
  };

  const getVideoId = (url: string): string | null => {
    const match = url?.match(/v=([^&]+)/);
    return match ? match[1] : null;
  };

  if (!currentMovie) {
    return (
      <div className='font-liberation flex items-center justify-center h-screen bg-gradient-to-t to-accent text-white'>
        Loading trailer...
      </div>
    );
  }

  const videoId = getVideoId(currentMovie.youtube_url);
  const actualScore = Math.round(
    parseFloat(currentMovie?.imdb_rating || "0") * 10
  );

  return (
    <div className='font-liberation flex flex-col items-center justify-center min-h-screen bg-gradient-to-t to-accent from-black text-white px-4'>
      {!gameOver && (
        <div className='flex flex-col items-center'>
          <h1 className='text-4xl font-bold mb-4'>
            Round {round}/{totalRounds}
          </h1>
          <h2 className='text-2xl mb-4'>
            Guess the score of {currentMovie.title}
          </h2>
          {videoId && <YoutubeEmbed videoId={videoId} />}
        </div>
      )}

      {!submitted && !gameOver && (
        <div className='mt-6'>
          <input
            type='number'
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder='Your guess (0-100)'
            className='p-2 rounded border text-white'
          />
          <button
            onClick={handleSubmit}
            className='ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
            Submit
          </button>
        </div>
      )}

      {submitted && !gameOver && (
        <div className='flex flex-col justify-center items-center mt-6'>
          <p className='text-xl'>You Guessed: {guess}%</p>
          <p className='text-xl'>Actual Score: {actualScore}%</p>
          {/* <p className='text-xl'>
            Actual Score: {Math.round(currentMovie.imdb_rating * 10)}%
          </p> */}

          <p className='text-lg'>You earned {roundScore} points this round.</p>
          <button
            onClick={nextRound}
            className='mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'>
            Next Round
          </button>
        </div>
      )}

      {gameOver && (
        <div className='flex flex-col justify-center items-center mt-6'>
          <h2 className='text-3xl font-bold'>Game Over!</h2>
          <p className='text-xl mt-2'>Your total score: {totalScore}</p>
          <div className='flex flex-col items-center justify-center gap-4 mt-4'>
            <button
              onClick={replayGame}
              className='flex items-center justify-center rounded-md px-4 py-2 bg-accent hover:bg-white hover:text-accent font-bold'>
              Replay
            </button>
            <Link
              href="/"
              className='flex items-center justify-center rounded-md px-4 py-2 bg-accent hover:bg-white hover:text-accent font-bold'
            >
              Main Menu
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};

export default Play;
