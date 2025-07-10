import React, {useState, useEffect} from "react";
import Flashcard from "./Flashcard";
import QuizGame from "./QuizGame";

function App(){
    const[flashcards, setFlashcards] = useState([]);
    const[question, setQuestion] = useState('');
    const[answer, setAnswer] = useState('');
    const[quizMode, setQuizMode] = useState(false); //track in in quiz mode

    useEffect(() => {
        fetch('http://localhost:5000/api/flashcards')
            .then(res => res.json())
            .then(data => setFlashcards(data));
    }, []);

    //add new flashcard
    const handleAdd = (e) => {
        e.preventDefault(); //stop  the default behavior
        fetch('http://localhost:5000/api/flashcards', {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({question, answer})
        })
            .then(res => res.json())
            .then(newCard => setFlashcards([...flashcards, newCard]))
        setQuestion('');
        setAnswer('');
    }

    //delete a flashcard
    const handleDelete = (id) => {
        fetch(`http://localhost:5000/api/flashcards/${id}`, {method: 'DELETE'})
            .then(() => setFlashcards(flashcards.filter(card => card._id !== id)));
    };

    return (
        <div>
        <h1>Flashcards</h1>
        <button onClick = {() => setQuizMode(true)}>Quiz Me!</button>
        {!quizMode ? (
        <>
            <form onSubmit={handleAdd}>
                <input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Question"
                required
                />
                <input
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Answer"
                required
                />
                <button type="submit">Add Card</button>
            </form>

            <div style = {{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "16px",
                justifyContent: "flex-start"
            }}>
                {flashcards.map(card =>
                    <Flashcard key = {card._id} card = {card} onDelete = {handleDelete} />
                )}
            </div>
        </>
        ) : (
            <QuizGame
                flashcards = {flashcards}
                onQuit={() => setQuizMode(false)}
                />
        )}
        </div>
  );
}
export default App;