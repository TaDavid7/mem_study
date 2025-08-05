"use client";
import { useState, useEffect } from "react";
import Versus from "@/components/Versus";
import Flashcard from "@/components/Flashcard";

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

interface FlashcardType {
  _id: string;
  question: string;
  answer: string;
  folder: string;
};

export default function Multi() {
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);

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

  //check if folders
  useEffect( () => {
    if(!folders){
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

  if(loading){
    return <div className = "p-6">Loading quiz...</div>
  }
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
          <div className="mb-6 items-center gap-4">
            <label className="mr-2">Select Folder:</label>
            <>
              <select
                value={selectedFolder}
                onChange={e => setSelectedFolder(e.target.value)}
                className="p-2 rounded bg-gray-200 text-gray-600"
                style={{ minWidth: "180px" }}
                required
              >
                <option value="">-- Select --</option>
                {folders.map(folder => (
                  <option key={folder._id} value={folder._id}>{folder.name}</option>
                ))}
              </select>
            </>
          </div>
          <button type="submit">Join</button>
        </form>
      </div>
    );
  }

  return <Versus roomCode={roomCode} username={username} flashcards = {flashcards} />;
}
