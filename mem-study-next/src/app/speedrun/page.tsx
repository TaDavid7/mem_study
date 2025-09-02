"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Speedrun, {FlashcardType } from "@/components/speedrun"


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
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState<string>("");
  const [gameReady, setGameReady] = useState<boolean>(false);


  //load folders
  useEffect( () => {
      fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/folders`)
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
    fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/flashcards?folderId=${selectedFolder}`)
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
      {!gameReady ? (
        <div className = "border-2 border-gray-200 rounded-2xl p-6 sm:p-8 md:p-10 max-w-5xl mx-auto">
          <div className="p-6 space-y-6">
            <h1 className="text-3xl text-left font-bold">Speedrun</h1>
            <div className = "text-lg text-left font-medium">A fast-paced game where you try to answer as many questions as possible. 
              Each card presents a question, and you type in your answer before moving to the next one. 
              The deck randomizes and recycles.</div> <br></br>
            <label className="text-lg font-medium">Select Folder: </label>
            <>
              <select
                value={selectedFolder}
                onChange={e => setSelectedFolder(e.target.value)}
                className="p-2 rounded-2xl bg-gray-200 text-gray-600"
                style={{ minWidth: "180px" }}
              >
                <option value="">-- Select --</option>
                {folders.map(folder => (
                  <option key={folder._id} value={folder._id}>{folder.name}</option>
                ))}
              </select> <br></br><br></br>
            </>
                <input
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  placeholder="Type time in seconds"
                  className="w-50 px-3 py-1 border-2 border-gray-300 rounded-lg 
                        text-m bg-gray-50 outline-none transition duration-300
                        focus:border-blue-500 focus:shadow-md placeholder-gray-400 italic"
              autoFocus
            /> <br></br> 
            
              <button
                className = "bg-blue-400 rounded-2xl text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled = {!selectedFolder || !time}
                onClick={() => {setGameReady(true)}} style={{ marginTop: "1rem" }}> Start
              </button> &nbsp; &nbsp;

              <button
                className = "bg-red-400 rounded-2xl text-white px-4 py-2 rounded hover:bg-red-600 transition" 
                onClick={exitingQuizGame} style={{ marginTop: "1rem" }}> Exit
              </button>
          </div>
        </div>
      ): 
        (<Speedrun
          flashcards={flashcards}
          time = {time}
          onQuit={exitingQuizGame}
        />)}

    </div>
  );
}
