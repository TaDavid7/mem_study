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

  // Delete a flashcard
  const handleDelete = (id: string) => {
    fetch(`http://localhost:5000/api/flashcards/${id}`, { method: 'DELETE' })
      .then(() => setFlashcards(flashcards.filter(card => card._id !== id)));
  };

  return (
    <div style = {{
      minHeight: "100vh",
      background: "#fff",//light backgd
      color: "#222",    //Dark text
      padding: "1rem"
    }}>
      <h1>Flashcards</h1>
      <button onClick={() => setQuizMode(true)}>Quiz Me!</button>
      {!quizMode ? (
        <>
          <form onSubmit={handleAdd}>
            <input
              value={question}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
              placeholder="Question"
              required
            />
            <input
              value={answer}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAnswer(e.target.value)}
              placeholder="Answer"
              required
            />
            <button type="submit">Add Card</button>
          </form>

          <div style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "flex-start"
          }}>
            {flashcards.map(card =>
              <Flashcard key={card._id} card={card} onDelete={handleDelete} />
            )}
          </div>
        </>
      ) : (
        <QuizGame
          flashcards={flashcards}
          onQuit={() => setQuizMode(false)}
        />
      )}
    </div>
  );
};

export default App;
