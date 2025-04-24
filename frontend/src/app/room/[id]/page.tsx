"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Movie } from "@/types/Movie";
import YoutubeEmbed from "@/components/YouTubeEmbed";

const Room = () => {
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [users, setUsers] = useState<Record<string, string>[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [roundEnd, setRoundEnd] = useState(false);
  const [scoreboard, setScoreBoard] = useState<Record<string, number>>({});
  const [actualScore, setActualScore] = useState(0);
  const [guess, setGuess] = useState("");
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);

  const showMessage = (message: string) => {
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.bottom = "20px";
    modal.style.right = "20px";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    modal.style.color = "white";
    modal.style.padding = "10px 20px";
    modal.style.borderRadius = "8px";
    modal.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    modal.style.zIndex = "1000";
    modal.textContent = message;

    document.body.appendChild(modal);

    setTimeout(() => {
      modal.style.transition = "opacity 0.5s";
      modal.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 500);
    }, 2000);
  };

  const readyUp = () => {
    const r = JSON.stringify({
      type: "ready",
      player_name: username,
      room_code: roomCode,
    });
    console.log("Ready up message:", r);
    socket?.send(r);
  };

  useEffect(() => {
    const code = window.location.pathname.split("/").pop() || "";
    setRoomCode(code);
  }, [roomCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Joining room with code:", roomCode);
    const socket = new WebSocket(
      `wss://${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms/join`
    );
    console.log("Socket connected:", socket);
    socket.onopen = () => {
      console.log("Socket opened");
      socket.send(
        JSON.stringify({ player_name: username, room_code: roomCode })
      );
      console.log("Socket message sent");
      setSocket(socket);
    };

    socket.onclose = (event) => {
      console.warn("Socket closed:", event);
      showMessage("Connection lost. Attempting to reconnect...");
      setSocket(null);
    };

    socket.onerror = (error) => {
      console.error("Socket error:", error);
      showMessage("A connection error occurred.");
    };
  };

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Socket message received:", data);
      if (data.type === "user_join") {
        setUsers(data.data.connected_users);
      }
      if (data.type === "user_ready") {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.player_name === data.data.user
              ? { ...user, status: "ready" }
              : user
          )
        );
      }
      if (data.type === "round_start") {
        setGameStarted(true);
        setRoundEnd(false);
        setCurrentRound(data.data.round);
        const movie = data.data.movie_data as Movie;
        setCurrentMovie(movie);
        showMessage(`Round ${data.data.round} has started!`);
      }
      if (data.type === "round_end") {
        setRoundEnd(true);
        setActualScore(data.data.correct_score * 10);
        setScoreBoard(data.data.scores);
        setTimeout(() => {
          setRoundEnd(false);
        }, 5000);
      }
      if (data.type === "game_end") {
        setGameOver(true);
        setGameStarted(false);
        setRoundEnd(false);
        setCurrentRound(0);
        setCurrentMovie(null);
        setScoreBoard(data.data.scores);
      }
      showMessage(data.data.message);
    };
  }, [socket]);

  const getVideoId = (url: string): string | null => {
    const match = url?.match(/v=([^&]+)/);
    return match ? match[1] : null;
  };

  const videoId = getVideoId(currentMovie?.youtube_url || "");

  const submitGuess = () => {
    const guessNum = parseInt(guess);
    socket?.send(
      JSON.stringify({
        type: "guess",
        data: {
          guess: guessNum,
        },
      })
    );
  };

  return (
    <main className='flex items-center justify-center h-screen'>
      {!users.length ? (
        <div className='flex flex-col items-center relative z-10 p-8 rounded-2xl mx-auto  bg-white/10 border backdrop-blur border-white/30 shadow-lg'>
          <h1 className='text-2xl font-bold'>Join the Room!</h1>
          <form onSubmit={handleSubmit} className='flex items-center space-x-4'>
            <input
              type='text'
              placeholder='Enter your name'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='p-2 rounded border text-white'></input>
            <button
              type='submit'
              className='px-4 py-2 rounded bg-accent text-white cursor-pointer'>
              Join
            </button>
          </form>
        </div>
      ) : gameStarted ? (
        !roundEnd ? (
          <div className='flex flex-col items-center'>
            <h1 className='text-4xl font-bold mb-4'>Round {currentRound}</h1>
            <h2 className='text-2xl mb-4'>
              Guess the score of {currentMovie?.title || "Unknown Movie"}
            </h2>
            {videoId && <YoutubeEmbed videoId={videoId} />}
            <input
              type='number'
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder='Your guess (0-100)'
              className='p-2 rounded border text-white'
            />
            <button
              onClick={submitGuess}
              className='ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
              Submit
            </button>
          </div>
        ) : (
          <div className='flex flex-col items-center'>
            <h1 className='text-4xl font-bold mb-4'>
              Round {currentRound} Ended
            </h1>
            <h2 className='text-2xl mb-4'>Correct Score: {actualScore}</h2>
            <h3 className='text-xl font-bold mb-4'>Scoreboard:</h3>
            <ul className='list-disc list-inside'>
              {Object.entries(scoreboard).map(([playerName, score], index) => (
                <li key={index} className='font-liberation font-bold'>
                  {index + 1}. {playerName}: {score} points
                </li>
              ))}
            </ul>
            <button
              className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
              onClick={() => setRoundEnd(false)}>
              Continue
            </button>
          </div>
        )
      ) : !gameOver ? (
        <div className='mt-8 flex flex-col items-center'>
          <h2 className='text-lg font-bold'>Connected Users:</h2>
          <ul className='list-disc list-inside'>
            {users.map((user, index) => (
              <li key={index} className='font-liberation font-bold flex'>
                {index + 1}. {user.player_name} -{" "}
                {user.status === "ready" ? "READY" : "WAITING"}
              </li>
            ))}
          </ul>
          <button
            className='bg-accent px-4 py-2 text-white font-liberation rounded mt-4'
            onClick={readyUp}>
            Ready!
          </button>
        </div>
      ) : (
        <div className='mt-8 flex flex-col items-center'>
          <h2 className='text-lg font-bold'>Game Over!</h2>
          <h3 className='text-xl font-bold mb-4'>Final Scoreboard:</h3>
          <ul className='list-disc list-inside'>
            {Object.entries(scoreboard).map(([playerName, score], index) => (
              <li key={index} className='font-liberation font-bold'>
                {index + 1}. {playerName}: {score} points
              </li>
            ))}
          </ul>
          <Link
            className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
            href='/'>
            Back to Home
          </Link>
        </div>
      )}
    </main>
  );
};

export default Room;
