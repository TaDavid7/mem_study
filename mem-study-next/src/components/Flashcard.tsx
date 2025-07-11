import React, { useState } from "react";

// 1. Define the Flashcard type (adjust _id type as needed)
type Card = {
  _id: string;            
  question: string;
  answer: string;
};

// 2. Define props type for the component
type FlashcardProps = {
  card: Card;
  onDelete: (id: string) => void;   // match the _id type
};

const Flashcard: React.FC<FlashcardProps> = ({ card, onDelete }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div style={{
      border: "1px solid #aaa",
      borderRadius: 8,
      padding: 20,
      margin: "16px",
      width: 250,
      minHeight: 80,
      textAlign: "left",
      background: flipped ? "#e6f7ff" : "#fff"
    }}>
      <div>
        {flipped ? (
          <div>
            <strong>Answer:</strong>
            <div>{card.answer}</div>
            <button onClick={() => setFlipped(false)} style={{ marginTop: 8 }}>Show Question</button>
          </div>
        ) : (
          <div>
            <strong>Question:</strong>
            <div>{card.question}</div>
            <button onClick={() => setFlipped(true)} style={{ marginTop: 8 }}>Show Answer</button>
          </div>
        )}
      </div>
      <button
        onClick={() => onDelete(card._id)}
        style={{
          marginTop: 8,
          background: "#ee6666",
          color: "white",
          border: "none",
          borderRadius: 6,
          padding: "4px 12px",
          cursor: "pointer"
        }}>
        X
      </button>
    </div>
  );
};

export default Flashcard;
