"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import type { RoomState, RoomPlayer } from "@/types/versus";

export default function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const meName = useSearchParams().get("me") ?? "";

  const [state, setState] = useState<RoomState | null>(null);
  const [cards, setCards] = useState<{ _id: string; question: string; answer: string }[]>([]);
  const [guess, setGuess] = useState("");
  const [answered, setAnswered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [showResults, setShowResults] = useState(false);
  const [finalState, setFinalState] = useState<RoomState | null>(null);
  const socketRef = useRef(getSocket());


  // Subscribe to room state and ensure we are joined
  useEffect(() => {
    const socket = socketRef.current;

    function onState(rs: RoomState) {
      setState(rs);
      const base = "http://localhost:5000";
      if (rs.folderId) {
        fetch(`${base}/api/flashcards?folderId=${rs.folderId}`)
          .then((r) => r.json())
          .then((data) => Array.isArray(data) && setCards(data))
          .catch(console.error);
      }
    }
    
    async function onReveal(payload: {index: number}){
      if(state && payload.index !== state.currentIndex ) return;
      setRevealed(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      nextQuestion();
    }
    async function onGuessResult(payload: { correct: boolean }) {
      if (payload.correct) {
        setAnswered(true);
        setFeedback("correct");
        await new Promise(resolve => setTimeout(resolve, 500));
        nextQuestion();
      } else {
        setFeedback("wrong");
      }
    }

    function onResult(rs: RoomState){
      console.log("results payload:", rs);
      setFinalState(rs);
      setShowResults(true);
    }

    socket.emit("joinRoom", { code: String(code).toUpperCase(), username: meName });
    socket.on("roomState", onState);
    socket.on("guessResult", onGuessResult);
    socket.on("revealAnswer", onReveal);
    socket.on("results", onResult);

    return () => {
      socket.off("roomState", onState);
      socket.off("guessResult", onGuessResult);
      socket.off("revealAnswer", onReveal)
      socket.off("results", onResult);
    };
  }, [code, meName]);

  // Reset per-question UI when index changes
  useEffect(() => {
    setGuess("");
    setAnswered(false);
    setRevealed(false);
    setFeedback("idle");
  }, [state?.currentIndex]);

  const meIsHost = state && state.hostId === socketRef.current.id;

  const currentCard = useMemo(() => {
    if (!state || !cards.length) return null;
    const idx = Math.max(0, Math.min(state.currentIndex, cards.length - 1));
    return cards[idx] ?? null;
  }, [state, cards]);

  function startGame() {
    socketRef.current.emit("startGame", { code: String(code).toUpperCase() });
  }
  function nextQuestion() {
    socketRef.current.emit("nextQuestion", { code: String(code).toUpperCase() });
  }

  function stuck(){
    socketRef.current.emit("revealAnswer", { code: String(code).toUpperCase() });
  }

  function submitGuess(e: React.FormEvent) {
    e.preventDefault();
    if (!currentCard) return;
    const g = guess.trim();
    if (!g) return;
    socketRef.current.emit("submitGuess", { code: String(code).toUpperCase(), guess: g });
  }

  const players = (state?.players ?? []).sort((a, b) => b.score - a.score);

  return (
    <div>
      {!showResults ? (<div className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Room {String(code).toUpperCase()}</h1>
        <span className="text-sm opacity-70">{state?.started ? "In game" : "Lobby"}</span>
      </header>

      <section className="rounded-2xl border p-4">
        <div className="font-semibold mb-2">Players</div>
        <ul className="grid grid-cols-2 gap-2">
          {players.map((p: RoomPlayer) => (
            <li key={p.socketId} className="rounded-xl border p-2 flex items-center justify-between">
              <span>{p.username}</span>
              <span className="text-sm opacity-70">{p.score}</span>
            </li>
          ))}
        </ul>
      </section>

      {!state?.started ? (
        <section className="rounded-2xl border p-4 space-y-3">
          <div>Folder: <strong>{state?.folderId ?? "(not set)"}</strong></div>
          {meIsHost ? (
            <button onClick={startGame} className="rounded-2xl px-4 py-2 shadow hover:shadow-md">Start game</button>
          ) : (
            <div className="text-sm opacity-70">Waiting for host to start…</div>
          )}
        </section>
      ) : (
        <section className="rounded-2xl border p-4 space-y-4">
          <div className="text-sm opacity-70">Question {state.currentIndex + 1}</div>
          <div className="text-xl font-semibold min-h-[80px] flex items-center">{currentCard?.question ?? "…"}</div>

          {/* Guess input */}
          <form onSubmit={submitGuess} className="flex gap-2 items-center">
            <input
              className="border rounded p-2 flex-1"
              placeholder="Type your answer and press Enter"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              disabled={!currentCard || answered}
            />
            <button
              type="submit"
              disabled={!currentCard || answered || !guess.trim()}
              className="rounded-2xl px-4 py-2 shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </form>

          {/* Feedback + controls */}
          <div className="text-sm">
            {feedback === "correct" && <span className="text-green-700">Correct!</span>}
            {feedback === "wrong" && <span className="text-red-700">Try again.</span>}
          </div>

          <div className="flex gap-2 items-center">
      
            {meIsHost && (
              <button onClick={stuck} className="rounded-2xl px-4 py-2 shadow hover:shadow-md">Everyone Stuck?</button>
            )}
          </div>

          {revealed && (
            <div className="text-base opacity-80">
              <span className="opacity-70">Answer:</span> <strong>{currentCard?.answer}</strong>
            </div>
          )}
        </section>
      )}
    </div>) : (
      <div>
        {players.map((p: RoomPlayer) => (
            <li key={p.socketId} className="rounded-xl border p-2 flex items-center justify-between">
              <span>{p.username}</span>
              <span className="text-sm opacity-70">{p.score}</span>
            </li>
          ))}
      </div>
    )}
    
  </div>
  );
}