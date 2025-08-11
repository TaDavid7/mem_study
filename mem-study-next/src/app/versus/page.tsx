"use client";
import Link from "next/link";

export default function VersusLanding() {
  return (
    <div className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-3xl font-bold">Versus</h1>
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
  );
}