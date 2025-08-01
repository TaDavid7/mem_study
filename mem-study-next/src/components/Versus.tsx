"use client";
import {useEffect, useState, useRef} from "react";
import {io, Socket} from "socket.io-client";

interface MultiplayerProps {
  roomCode: string;
  username: string;
}

export default function Multiplayer({roomCode, username} : {roomCode:string, username: string}) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const socket = useRef<Socket | undefined>(undefined);

  useEffect(() => {
    socket.current = io("http://localhost:5000");

    socket.current.emit("join-room", roomCode, username);

    socket.current.on("chat", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.current?.disconnect();
    };
  }, [roomCode, username]);

  const sendMessage = () => {
    if(input.trim()){
      socket.current?.emit("chat", roomCode, input, username);
      setInput("");
    }
  };

  return(
    <div>
      <div>
      {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}