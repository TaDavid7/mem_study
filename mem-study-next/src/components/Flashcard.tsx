import React, { useState } from "react";

// 1. Define the Flashcard type (adjust _id type as needed)
type Card = {
  _id: string;            
  question: string;
  answer: string;
  folder: string;
};

// 2. Define props type for the component
type FlashcardProps = {
  card: Card;
  onDelete: (id: string) => void;   // match the _id type
  onEdit: (id: string, question: string, answer: string ) => void;
};

const Flashcard: React.FC<FlashcardProps> = ({ card, onDelete, onEdit }) => {
  const [flipped, setFlipped] = useState(false);

  return (
  <div className="flex flex-col items-center w-full max-w-2xl mx-auto mb-8">
    <div
      onClick={() => setFlipped(!flipped)}
      className="rounded-xl p-6 w-full min-h-[200px] text-center border border-gray-500 bg-gray-800 text-white cursor-pointer hover:shadow-lg transition flex flex-col justify-center items-center"
    >
      {flipped ? (
        <>
          <strong className="text-xl">{card.answer}</strong>
        </>
      ) : (
        <>
          <strong className="text-xl">{card.question}</strong>
        </>
      )}
    </div>
      <div className="flex gap-4 justify-center mt-4">
      <button
        className = "mt-3 bg-blue-500 text-white px-4 py-2 hover:bg-blue-600 transition"
        onClick={() => onEdit(card._id, card.question, card.answer)}
      >
        Edit
      </button> &nbsp; &nbsp; &nbsp;
      <button
        className="mt-3 bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600 transition"
        onClick={() => onDelete(card._id)}
      >
        Delete
      </button>
    </div>
  </div>
);



};

export default Flashcard;
