"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import type { RoomState } from "@/types/versus";

export default function CreateRoomPage() {
  const [folders, setFolders] = useState<{ _id: string; name: string }[]>([]);
  const [folderId, setFolderId] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/folders`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
      .then((data) => setFolders(Array.isArray(data) ? data : []))
      .catch((e) => setError(`Failed to load folders: ${e.message || e}`));
  }, []);

  function onCreate() {
    const name = username.trim();
    if (!folderId || !name) return;

    setLoading(true);
    setError(null);

    const socket = getSocket();
    socket.emit("createRoom", { folderId, username: name });

    const onRoomState = (rs: RoomState) => {
      if (rs.code) {
        socket.off("roomState", onRoomState);
        router.push(`/versus/room/${rs.code}?me=${encodeURIComponent(name)}`);
      }
    };

    socket.on("roomState", onRoomState);
  }

  return (
    <div className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create a room</h1>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <label className="block text-sm">Your name</label>
        <input
          className="border rounded p-2 w-full"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. Alex"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm">Folder</label>
        <select
          className="border rounded p-2 w-full"
          value={folderId}
          onChange={(e) => setFolderId(e.target.value)}
        >
          <option value="">Select a folder…</option>
          {folders.map((f) => (
            <option key={f._id} value={f._id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onCreate}
        disabled={!username.trim() || !folderId || loading}
        className="rounded-2xl px-4 py-2 shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating…" : "Create room"}
      </button>
    </div>
  );
}