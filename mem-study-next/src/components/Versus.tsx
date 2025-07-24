"use client";
import React, { useEffect, useRef, useState, ChangeEvent } from "react";

type Message = {
  type?: string;
  payload?: string;
  [key: string]: any;
};

const SocketTest: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket backend
    const socket = new window.WebSocket("ws://localhost:5000");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event: MessageEvent) => {
      try {
        const data: Message = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { payload: event.data }
        ]);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    socket.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    // Cleanup on unmount
    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN &&
      input.trim() !== ""
    ) {
      socketRef.current.send(
        JSON.stringify({ type: "chat", payload: input })
      );
      setInput("");
    }
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div>
      <h2>WebSocket Demo</h2>
      <div>
        {messages.map((msg, idx) => (
          <div key={idx}>
            {msg.type ? <strong>{msg.type}: </strong> : null}
            {msg.payload || JSON.stringify(msg)}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={handleInput}
        placeholder="Type message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default SocketTest;
