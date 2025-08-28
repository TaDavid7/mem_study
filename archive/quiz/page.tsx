"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import QuizGame, { FlashcardType } from "@/components/QuizGame";
import Flashcard from "@/components/Flashcard";
import Link from "next/link";


type Card = {
  _id: string; 
  question: string;
  answer: string;
  folder: string;
};

type Folder = {
  _id: string;
  name: string;
};

export default function QuizPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [loading, setLoading] = useState(true);


  //load folders
  useEffect( () => {
      fetch("http://localhost:5000/api/folders")
        .then(res => res.json())
        .then((folders: Folder[]) => setFolders(folders));
    }, []);
  
  //check if there are folders
  useEffect(() => {
    if (!folders) {
      setFlashcards([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`http://localhost:5000/api/flashcards?folderId=${selectedFolder}`)
      .then(res => res.json())
      .then((cards: FlashcardType[]) => {
        setFlashcards(cards);
        setLoading(false);
      });
  }, [selectedFolder]);

  const exitingQuizGame = () => {
    setSelectedFolder("");
    router.push("/home")
  }

  if (loading) {
    return <div className="p-6">Loading quiz...</div>;
  }

  return (
    <div>
      {!selectedFolder ? (
        <div className="p-6">
        <div className="mb-6 items-center gap-4">
          <label className="mr-2">Select Folder:</label>
          <>
            <select
              value={selectedFolder}
              onChange={e => setSelectedFolder(e.target.value)}
              className="p-2 rounded bg-gray-200 text-gray-600"
              style={{ minWidth: "180px" }}
            >
              <option value="">-- Select --</option>
              {folders.map(folder => (
                <option key={folder._id} value={folder._id}>{folder.name}</option>
              ))}
            </select> <br></br>
            <button
              className = "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition" 
              onClick={exitingQuizGame} style={{ marginTop: "1rem" }}>Quit Quiz
            </button>
          </>
        </div>
      </div>
      ): 
        (<QuizGame
          flashcards={flashcards}
          onQuit={exitingQuizGame}
        />)}

    </div>
  );
}
