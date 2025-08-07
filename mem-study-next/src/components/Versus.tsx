"use client";
import {useEffect, useState, useRef, FormEvent} from "react";
import {io, Socket} from "socket.io-client";

interface FlashcardType {
  _id: string;
  question: string;
  answer: string;
  folder: string;
};

interface MultiplayerProps {
  roomCode: string;
  username: string;
  flashcards: FlashcardType[];
};

export default function Multiplayer({roomCode, username, flashcards} : {roomCode:string, username: string, flashcards: FlashcardType[]}) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const socket = useRef<Socket | undefined>(undefined);

  const[current, setCurrent] = useState<number>(0);
  const[userAnswer, setUserAnswer] = useState<string>('');
  const[feedback, setFeedback] = useState<string>('');
  const[timer, setTimer] = useState<number>(0);
  const[answered, setAnswered] = useState<boolean>(false);

  const[results, setResults] = useState([]);

  useEffect(() => {
    socket.current = io("http://localhost:5000");

    socket.current.emit("join-room", roomCode, username);

    socket.current.on("chat", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.current?.on("next", () => {
      setCurrent((prev) => prev + 1);
    } )

    socket.current.on("wrong-confirm", () => {
      //change this later
      alert("Wrong answer");
    })
    socket.current?.on('allResults', (allScores) => {
      setResults(allScores);
    })

    return () => {
      socket.current?.emit("disconnect");
      socket.current?.disconnect();
    };
  }, [roomCode, username]);

  const sendMessage = () => {
    if(input.trim()){
      socket.current?.emit("chat", roomCode, input, username);
      setInput("");
    }
  };

  const showResults = () => {
    socket.current?.emit('results');
  }

  const checkAnswer = (e: FormEvent) => {
    e.preventDefault();
    const correct = flashcards[current].answer.trim().toLowerCase();
    const guess = userAnswer.trim().toLowerCase();

    if (guess === correct) {
      socket.current?.emit("next-flashcard", roomCode, username);
    } else{
      socket.current?.emit("wrong-answer");
    }
  }

  useEffect(() => {
    setUserAnswer("");
  }, [current, flashcards]);

  return(
    <div>
      <div 
        style = {{textAlign: "center"}}>
      <p><strong>Question:</strong> {flashcards[current]?.question}</p>
      <form onSubmit={checkAnswer}>
        <input
          value={userAnswer}
          onChange={e => setUserAnswer(e.target.value)}
          placeholder="Type your answer"
          className = "bg-gray-100 border border-gray-300 rounded-lg focus:ring-blue-500"
          autoFocus
        />
      </form>
      </div>
      <div>
      {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
      
    </div>
  );
}