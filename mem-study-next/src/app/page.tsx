"use client";
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Flashcard from "@/components/Flashcard";
import QuizGame from "@/components/QuizGame";

// 1. Type for a flashcard object
type Card = {
  _id: string; // or number, depending on backend
  question: string;
  answer: string;
};

const App: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Card[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [quizMode, setQuizMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');


  useEffect(() => {
    fetch('http://localhost:5000/api/flashcards')
      .then(res => res.json())
      .then((data: Card[]) => setFlashcards(data));
  }, []);

  // Add new flashcard
  const handleAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/flashcards', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer })
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
    fetch(`http://localhost:5000/api/flashcards/${editingId}`, {
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

  const handleEditCancel = () => {
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
  };



  // Delete a flashcard
  const handleDelete = (id: string) => {
    fetch(`http://localhost:5000/api/flashcards/${id}`, { method: 'DELETE' })
      .then(() => setFlashcards(flashcards.filter(card => card._id !== id)));
  };

  return (
  <div className="min-h-screen bg-gray-900 text-white font-sans p-4">
    <h1 className="text-3xl font-bold mb-4">Flashcards</h1>
    <div>
      {quizMode ? (<></>): (<>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          onClick={() => setQuizMode(true)}
        >
          Quiz
        </button>
      </>)}
      
    </div>
    
    {quizMode ? (
      <QuizGame
        flashcards={flashcards}
        onQuit={() => setQuizMode(false)}
      />
    ) : (
      <>
        {editingId ? (
          <form onSubmit={handleEditSubmit} className="my-4 flex flex-col sm:flex-row gap-2">
            <input
              value={editQuestion}
              onChange={e => setEditQuestion(e.target.value)}
              placeholder="Edit Question"
              required
              className="p-2 rounded bg-gray-800 text-white placeholder-gray-400"
            />
            <input
              value={editAnswer}
              onChange={e => setEditAnswer(e.target.value)}
              placeholder="Edit Answer"
              required
              className="p-2 rounded bg-gray-800 text-white placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
            >
              Save
            </button>
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              onClick={handleEditCancel}
            >
              Cancel
            </button>
          </form>
        ) : (
          <form onSubmit={handleAdd} className="my-4 flex flex-col sm:flex-row gap-2">
            <input
              value={question}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
              placeholder="Question"
              required
              className="p-2 rounded bg-gray-800 text-white placeholder-gray-400"
            />
            <input
              value={answer}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAnswer(e.target.value)}
              placeholder="Answer"
              required
              className="p-2 rounded bg-gray-800 text-white placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Add Card
            </button>
          </form>
        )}

        <div className="flex flex-col items-center gap-6">
          {flashcards.map(card =>
            <Flashcard
              key={card._id}
              card={card}
              onDelete={handleDelete}
              onEdit={handleEditStart} 
            />
          )}
        </div>
      </>
    )}
  </div>
  );

};

export default App;
