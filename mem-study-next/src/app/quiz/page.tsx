"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import QuizGame, { FlashcardType } from "@/components/QuizGame";

export default function QuizPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const folder = searchParams.get("folder") || "";
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!folder) {
      setFlashcards([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`http://localhost:5000/api/flashcards?folderId=${folder}`)
      .then(res => res.json())
      .then((cards: FlashcardType[]) => {
        setFlashcards(cards);
        setLoading(false);
      });
  }, [folder]);

  if (!folder) {
    return (
      <div className="p-6 text-red-400">
        No folder selected for quiz.<br />
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          onClick={() => router.push("/")}
        >
          Back to Flashcards
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6">Loading quiz...</div>;
  }

  return (
    <div className="p-6">
      <QuizGame
        flashcards={flashcards}
        onQuit={() => router.push("/")}
      />
    </div>
  );
}
