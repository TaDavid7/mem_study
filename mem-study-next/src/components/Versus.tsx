"use client";
import {useEffect, useState, useRef} from "react";
import {io, Socket} from "socket.io-client";

interface FlashcardType {
  _id: string;
  question: string;
  answer: string;
  folder: string;
};

interface MultiplayerProps {
  roomCode: string;
  username: string;
  flashcards: FlashcardType[];
};

export default function Multiplayer({roomCode, username, flashcards} : {roomCode:string, username: string, flashcards: FlashcardType[]}) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const socket = useRef<Socket | undefined>(undefined);

  const[current, setCurrent] = useState<number>(0);

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
      {flashcards[current]?.question}
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