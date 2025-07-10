import React, {useState} from "react";

function QuizGame({flashcards, onQuit}){
    const [current, setCurrent] = useState(0);
    const[userAnswer, setUserAnswer] = useState('');
    const[feedback, setFeedback] = useState('');
    const[score, setScore] = useState(0);

    if(!flashcards.length) return <div> No flashcards available.</div>
    if(current >= flashcards.length)
        return(
            <div>
                <h2>Quiz Complete!</h2>
                <h2>Score is: {score}/{flashcards.length} </h2>
                <button onClick = {onQuit}>Back to Cards</button>
            </div>
    )

    const checkAnswer = (e) => {
        e.preventDefault();
        const correct = flashcards[current].answer.trim().toLowerCase();
        const guess = userAnswer.trim().toLowerCase();
        if(guess === correct){
            setFeedback("Correct");
            setScore(score + 1);
        } else{
            setFeedback(`Incorrect. The answer was: ${flashcards[current].answer}`);
        }
        setTimeout(() => {
            setFeedback('');
            setUserAnswer('');
            setCurrent(current + 1);
        }, 1400);
    }

    return (
    <div style={{margin: "2rem 0", padding: "2rem", border: "1px solid #aaa", borderRadius: 8}}>
      <h2>Quiz Mode</h2>
      <p><strong>Question:</strong> {flashcards[current].question}</p>
      <form onSubmit={checkAnswer}>
        <input
          value={userAnswer}
          onChange={e => setUserAnswer(e.target.value)}
          placeholder="Type your answer"
          autoFocus
        />
        <button type="submit">Submit</button>
      </form>
      <div>{feedback}</div>
      <button onClick={onQuit} style={{marginTop: "1rem"}}>Quit Quiz</button>
    </div>
  );
}
export default QuizGame;