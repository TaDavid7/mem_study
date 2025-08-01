"use client";
import { useState } from "react";
import Versus from "@/components/Versus";

export default function Multi() {
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);

  if (!joined) {
    return (
      <div>
        <h1>Multiplayer Game Mode</h1>
        <form
          onSubmit={e => {
            e.preventDefault();
            setJoined(true);
          }}
        >
          <input
            placeholder="Room Code"
            value={roomCode}
            onChange={e => setRoomCode(e.target.value)}
            required
          />
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <button type="submit">Join</button>
        </form>
      </div>
    );
  }

  return <Versus roomCode={roomCode} username={username} />;
}
