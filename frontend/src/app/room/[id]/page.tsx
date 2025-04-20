"use client";

import { useEffect, useState } from "react";

const Room = () => {
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  // const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const code = window.location.pathname.split("/").pop() || "";
    setRoomCode(code);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Joining room with code:", roomCode);
    const socket = new WebSocket(
      `ws://${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms/join`
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
  };

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Socket message received:", data);
      if (data.type === "user_join") {
        setUsers(data.connected_users);
        // Message that all a user has joined
        // setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    };
  }, [socket]);

  return (
    <div className='font-liberation flex flex-col items-center justify-center min-h-screen bg-gradient-to-t to-accent from-black text-white px-4'>
      <div>
        <div>Join the Room!</div>
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

      <div className='mt-8'>
        <h2 className='text-lg font-bold'>Connected Users:</h2>
        <ul className='list-disc list-inside'>
          {users.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Room;
