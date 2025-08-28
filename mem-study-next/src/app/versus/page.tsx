"use client";
import Link from "next/link";

export default function VersusLanding() {
  return (
    <div className="border-2 border-gray-200 rounded-2xl p-6 sm:p-8 md:p-10 max-w-5xl mx-auto ">
      <div className="p-6 space-y-6">
      <h1 className="text-3xl text-left font-bold">Versus</h1>
      <p className = "text-lg text-left font-medium">Versus is a fast-paced multiplayer flashcard game where you can challenge friends to test your knowledge. 
        Pick a folder of flashcards, create a room or join one to answer questions correctly. 
        Every correct answer boosts your score but only the quickest players can stay ahead. Learn, compete, and see who comes out on top!</p>
        <br></br>
      <p className="text-sm opacity-80">
        Create a room (choose the folder) or join an existing one with a code.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/versus/create" className="rounded-2xl shadow p-6 hover:shadow-md">
          <div className="text-xl font-semibold">Create room</div>
          <div className="text-sm opacity-70">Pick a folder and host the match.</div>
        </Link>
        <Link href="/versus/join" className="rounded-2xl shadow p-6 hover:shadow-md">
          <div className="text-xl font-semibold">Join room</div>
          <div className="text-sm opacity-70">Enter a code and your name.</div>
        </Link>
      </div>
      </div>
    </div>
  );
}