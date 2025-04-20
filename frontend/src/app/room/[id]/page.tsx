"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Room = () => {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [users, setUsers] = useState<Record<string, string>[]>([]);
  // const [messages, setMessages] = useState<string[]>([]);

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
    // fetch(
    //   `https://${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms/validate/${roomCode}`,
    //   {
    //     method: "GET",
    //   }
    // )
    //   .then((response) => {
    //     if (!response.ok) {
    //       // router.push("/");
    //       throw new Error("Failed to validate room code");
    //     }
    //     return response.json();
    //   })
    //   .then((data) => {
    //     if (!data.exists) {
    //       router.push("/");
    //       throw new Error("Invalid room code");
    //     }
    //     console.log("Room validated:", data);
    //     // Handle successful validation (e.g., navigate to the room)
    //     // window.location.href = `/room/${roomCode}`;
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //     // Handle validation error (e.g., show an error message)
    //   });
  }, [roomCode, router]);

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
      // console.log("Connected users:", data.data.connected_users);
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
      showMessage(data.data.message);
      // Message that all a user has joined
      // setMessages((prevMessages) => [...prevMessages, data.message]);
    };
  }, [socket]);

  return (
    <div className='font-liberation flex flex-col items-center justify-center min-h-screen bg-gradient-to-t to-accent from-black text-white px-4'>
      {!users.length ? (
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
      ) : (
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
      )}
    </div>
  );
};

export default Room;
