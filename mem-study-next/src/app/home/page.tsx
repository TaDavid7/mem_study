"use client";
import React, { useState, useEffect, FormEvent } from "react";
import Flashcard from "@/components/Flashcard";

//Type for a flashcard object
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

const App: React.FC = () => {
  //Flashcards
  const [flashcards, setFlashcards] = useState<Card[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  //Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  //Folders
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [newFolder, setNewFolder] = useState("");

  //Edit Folders
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderDropdownOpen, setFolderDropdownOpen] = useState<string | null>(null);

  //Index
  const [cardindex, setCardIndex] = useState(0);



  //loads folders
  useEffect( () => {
    fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/folders`)
      .then(res => res.json())
      .then((folders: Folder[]) => setFolders(folders));
  }, []);
  

  //load flashcards when folder changes
  useEffect(() => {
    if(!selectedFolder){
      setFlashcards([]);
      return;
    }
    setCardIndex(0);
    fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/flashcards?folderId=${selectedFolder}`)
      .then(res => res.json())
      .then((cards: Card[]) => setFlashcards(cards));
  }, [selectedFolder]);

  //Add a folder
  const handleAddFolder = (e: FormEvent) => {
    e.preventDefault();
    fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/folders`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({name: newFolder}),
    })
    .then(async res => {
      if (!res.ok) {
        const data = await res.json();
        setNewFolder(data.error || "Could not add folder");
        return;
      }
      const folder: Folder = await res.json();
      setFolders([...folders, folder]);
      setNewFolder("");
    });
  };

  // Add new flashcard
  const handleAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!selectedFolder) return;
    fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/flashcards`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer, folder: selectedFolder, }),
    })
      .then(res => res.json())
      .then((newCard: Card) => setFlashcards([...flashcards, newCard]));
    setQuestion('');
    setAnswer('');
  };

  // Edit flashcard start
  const handleEditStart = (id: string, question: string, answer: string) => {
    setEditingId(id);
    setEditQuestion(question);
    setEditAnswer(answer);
  };

  // Edit handle edit
  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingId) return;
    fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/flashcards/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: editQuestion, answer: editAnswer }),
    })
      .then(res => res.json())
      .then((updatedCard: Card) => {
        setFlashcards(flashcards.map(card =>
          card._id === editingId ? updatedCard : card
        ));
        setEditingId(null);
        setEditQuestion('');
        setEditAnswer('');
      });
  };

  //Edit cancel button
  const handleEditCancel = () => {
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  //Edit Folder name
  const handleRenameFolder = (e: FormEvent) => {
    e.preventDefault();
    if (!renamingFolderId) return;
    fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/folders/${renamingFolderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName })
    })
      .then(res => res.json())
      .then((updatedFolder: Folder) => {
        setFolders(folders.map(f => f._id === renamingFolderId ? updatedFolder : f));
        setRenamingFolderId(null);
        setNewFolderName("");
      });
  };

  // Delete a flashcard
  const handleDelete = (id: string) => {
    fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/flashcards/${id}`, { method: 'DELETE' })
      .then(() => setFlashcards(flashcards.filter(card => card._id !== id)));
  };

  //Delete a folder
  const handleDeleteFolder = (id: string) => {
    if (!window.confirm("Are you sure? This will delete the folder and all its flashcards.")) return;
    fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/folders/${id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(() => {
        setFolders(folders.filter(f => f._id !== id));
        if (selectedFolder === id) setSelectedFolder("");
        setFlashcards([]);
      });
  };

  const decreaseIndex = (length: number) => {
    if(cardindex === 0){
      setCardIndex(length-1);
    }
    else{
      setCardIndex((l) => l-1);
    }
  }

  const increaseIndex = (length: number) => {
    if(cardindex === length-1){
      setCardIndex(0);
    }
    else{
      setCardIndex((l) => l+1);
    }
  }

  return (
    <div>
    <div className="border-2 border-gray-200 rounded-2xl p-6 sm:p-8 md:p-10 max-w-5xl mx-auto">
      <div className = "p-6 space-y-6">
        <h1 className="text-3xl text-left font-bold">Home</h1>
      {/* Folder dropdown and actions */}
      <div className="mb-6 flex items-center gap-4">
        <label className="mr-2">Select Folder:</label>
        <select
          value={selectedFolder}
          onChange={e => setSelectedFolder(e.target.value)}
          className="p-2 rounded bg-gray-200 border-transparent text-gray-600"
          style={{ minWidth: "180px" }}
        >
          <option value="">-- Select --</option>
          {folders.map(folder => (
            <option key={folder._id} value={folder._id}>{folder.name}</option>
          ))}
        </select>
        
        {/* Dropdown menu for folder actions */}
        {selectedFolder && (
          <div className="relative">
            <button
              className="text-black px-2 rounded bg-gray-200"
              onClick={() => setFolderDropdownOpen(folderDropdownOpen === selectedFolder ? null : selectedFolder)}
            >
              ⋮
            </button>
            {folderDropdownOpen === selectedFolder && (
              <div className="absolute left-0 mt-2 z-10 bg-gray-200 shadow-lg rounded p-2 flex flex-col min-w-[100px]">
                <button
                  className="text-gray-600 hover:bg-gray-300 px-2 py-1 rounded text-left"
                  onClick={() => {
                    setRenamingFolderId(selectedFolder);
                    setNewFolderName(
                      folders.find(f => f._id === selectedFolder)?.name || ""
                    );
                    setFolderDropdownOpen(null);
                  }}
                >
                  Rename
                </button>
                <button
                  className="text-gray-600 hover:bg-gray-300 px-2 py-1 rounded text-left"
                  onClick={() => {
                    setFolderDropdownOpen(null);
                    handleDeleteFolder(selectedFolder);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>


      {/* Rename Folder Form */}
      {renamingFolderId && (
        <form
          onSubmit={handleRenameFolder}
          className="flex gap-2 items-center mt-2 p-3 rounded max-w-xs"
          style={{ zIndex: 50 }}
        >
          <input
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            required
            className="p-1 rounded bg-gray-200 text-gray-600"
            autoFocus
          />
          <button type="submit" className="bg-yellow-500 px-2 py-1 rounded text-xs">Save</button>
          <button
            type="button"
            className="bg-gray-500 px-2 py-1 rounded text-xs"
            onClick={() => setRenamingFolderId(null)}
          >Cancel</button>
        </form>
      )}


      {/*Add Folder*/}
      <form onSubmit={handleAddFolder} className="mb-4 flex gap-2">
        <input
          value={newFolder}
          onChange={e => setNewFolder(e.target.value)}
          placeholder="New folder name"
          required
          className="p-2 rounded bg-gray-200 text-black placeholder-gray-400"
        />
        <button type="submit" className="bg-indigo-500 text-white px-3 py-2 rounded">Add Folder</button>
      </form>


      {/* Add or Edit Card*/}
      {editingId ? (
        <form onSubmit={handleEditSubmit} className="my-4 flex flex-col sm:flex-row gap-2">
          <input
            value={editQuestion}
            onChange={e => setEditQuestion(e.target.value)}
            placeholder="Edit Question"
            required
            className="p-2 rounded bg-gray-200 text-black placeholder-gray-400"
          />
          <input
            value={editAnswer}
            onChange={e => setEditAnswer(e.target.value)}
            placeholder="Edit Answer"
            required
            className="p-2 rounded bg-gray-200 text-black placeholder-gray-400"
          />
          <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">Save</button>
          <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition" onClick={handleEditCancel}>Cancel</button>
        </form>
      ) : (
        <form onSubmit={handleAdd} className="my-4 flex flex-col sm:flex-row gap-2">
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Question"
            required
            className="p-2 rounded bg-gray-200 text-black placeholder-gray-400"
          />
          <input
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Answer"
            required
            className="p-2 rounded bg-gray-200 text-black placeholder-gray-400"
          />
          <button type="submit" className="bg-green-500 text-gray-500 px-4 py-2 rounded hover:bg-green-600 transition">Add Card</button>
        </form>
      )}


      
    </div>
    </div>
    {/* Card list */}
    <br></br>
      
      <div>
        {flashcards.length > 0 ? (
          <div className="relative w-full max-w-2xl mx-auto">
            <Flashcard
              card={flashcards[cardindex]}
              onDelete={handleDelete}
              onEdit={handleEditStart}
            />

            <button
              type="button"
              onClick={() => decreaseIndex(flashcards.length)}
              className="absolute -left-16 top-1/2 -translate-y-1/2 -mt-8
                        bg-blue-400 text-white px-3 py-1 rounded-2xl hover:bg-blue-600 z-10"
            >&lt;
            </button>

            <button
              type="button"
              onClick={() => increaseIndex(flashcards.length)}
              className="absolute -right-16 top-1/2 -translate-y-1/2 -mt-8
                        bg-blue-400 text-white px-3 py-1 rounded-2xl hover:bg-blue-600 z-10"
            >&gt;
            </button>
          </div>
        ) : (null)}
      </div>
    </div>
  );
};

export default App;
