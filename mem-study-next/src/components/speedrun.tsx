import React, { useState, useEffect, useRef, FormEvent } from "react";

// Define the Flashcard type
export interface FlashcardType {
  _id: string;
  question: string;
  answer: string;
  folder: string;
}

// Define the props type for QuizGame
interface QuizGameProps {
  flashcards: FlashcardType[];
  onQuit: () => void;
}

const Speedrun: React.FC<QuizGameProps> = ({ flashcards, onQuit }) => {
    const [current, setCurrent] = useState<number>(0);
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [score, setScore] = useState<number>(0);
    const [timer, setTimer] = useState<number>(0);
    const [answered, setAnswered] = useState<boolean>(false);
    const isFirstRender = useRef(true);

    if (!flashcards.length)
        return (
        <div>
            No flashcards available.
            <br></br>
            <button 
            className = "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            onClick={onQuit} style={{ marginTop: "1rem" }}>Quit Speedrun</button>
        </div>);

   
    useEffect(() => {
        if (timer === 0) {
            setFeedback(`Time's up! The answer was: ${flashcards[current].answer}`);
            setAnswered(true);
            return; // Stop timer
        }
        const interval = setInterval(() => {
            setTimer(t => t - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer, answered, current, flashcards]);

    // Reset timer and answered state on new question
    useEffect(() => {
        setTimer(80);
    },[]);
    
    useEffect(() => {
        setAnswered(false);
        setUserAnswer("");
        setFeedback("");
    }, [current, flashcards]);

  if (current >= flashcards.length)
    return (
      <div>
        <h2>Speedrun Complete!</h2>
        <h2>Score is: {score}/{flashcards.length}</h2>
        <button onClick={onQuit}>Back to Cards</button>
      </div>
    );

  // Handle answer submission
  const checkAnswer = async (e: FormEvent) => {
    e.preventDefault();
    if (answered || timer === 0) return; // Prevent double answers or time's up

    const correct = flashcards[current].answer.trim().toLowerCase();
    const guess = userAnswer.trim().toLowerCase();

    if (guess === correct) {
      setFeedback("Correct!");
      setScore(score + 1);
    } else {
      setFeedback(`Incorrect. The answer was: ${flashcards[current].answer}`);
    }
    setAnswered(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    handleNext();
  };

  const handleNext = () => {
    setCurrent(current + 1);
  };

  return (
    <div style={{ margin: "2rem 0", padding: "2rem", border: "1px solid #aaa", borderRadius: 8 }}>
      <h2>Quiz Mode</h2>
      <div><strong>Time Left:</strong> {timer} seconds</div>
      <p><strong>Question:</strong> {flashcards[current].question}</p>
      <form onSubmit={checkAnswer}>
        <input
          value={userAnswer}
          onChange={e => setUserAnswer(e.target.value)}
          placeholder="Type your answer"
          autoFocus
        />
        <input type="submit" value = "Enter"></input>
      </form>
      <div style={{ minHeight: 30, margin: "1em 0" }}>{feedback}</div>
      
      <button 
        className = "bg-green-400 text-black px-4 py-2 rounded hover:bg-green-600 transition"
        onClick={onQuit} style={{ marginTop: "1rem" }}>Quit Speedrun</button>
    </div>
  );
};

export default Speedrun;
