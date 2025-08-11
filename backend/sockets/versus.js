// backend/sockets/versus.js
const Flashcard = require("../models/Flashcard");

function createCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // skip confusing chars if desired
  let s = "";
  for (let i = 0; i < 6; i++) s += letters[Math.floor(Math.random() * letters.length)];
  return s;
}

function normalize(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
}

/** rooms: Map<code, Room>
 * Room = {
 *   code, hostId, folderId,
 *   started: boolean,
 *   currentIndex: number,
 *   // deck holds current game's card IDs + normalized answers for quick checks
 *   deck: Array<{ id: string, answerNorm: string }>,
 *   // players keyed by socketId
 *   players: Map<string, { socketId: string, username: string, score: number, lastScoredIndex: number }>,
 * }
 */
const rooms = new Map();

function serialize(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    folderId: room.folderId,
    started: room.started,
    currentIndex: room.currentIndex,
    players: Array.from(room.players.values()).map(p => ({
      socketId: p.socketId,
      username: p.username,
      score: p.score,
    })),
  };
}

module.exports = function attachVersus(io) {
  io.on("connection", (socket) => {
    // Create a room with a chosen folder. The creator becomes host.
    socket.on("createRoom", async ({ folderId, username }) => {
      const code = createCode();
      const room = {
        code,
        hostId: socket.id,
        folderId: folderId || null,
        started: false,
        currentIndex: 0,
        deck: [],
        players: new Map(),
      };
      rooms.set(code, room);

      socket.join(code);
      room.players.set(socket.id, {
        socketId: socket.id,
        username: username || "Host",
        score: 0,
        lastScoredIndex: -1,
      });

      io.to(code).emit("roomState", serialize(room));
    });

    // Join an existing room and receive the latest state
    socket.on("joinRoom", async ({ code, username }) => {
      code = String(code || "").toUpperCase();
      const room = rooms.get(code);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }
      socket.join(code);
      if (username) {
        room.players.set(socket.id, {
          socketId: socket.id,
          username,
          score: 0,
          lastScoredIndex: -1,
        });
      }
      io.to(code).emit("roomState", serialize(room));
    });

    // Host starts the game; lock a deck order and broadcast index 0
    socket.on("startGame", async ({ code }) => {
      code = String(code || "").toUpperCase();
      const room = rooms.get(code);
      if (!room) return;
      if (room.hostId !== socket.id) return; // host only
      if (room.started) return;

      const cards = await Flashcard
        .find({ folder: room.folderId })
        .select("_id answer") // question not needed server-side for checks
        .lean();

      room.deck = cards.map((c) => ({ id: String(c._id), answerNorm: normalize(c.answer) }));
      room.currentIndex = 0;
      room.started = true;
      io.to(code).emit("roomState", serialize(room));
    });

    // Client sends a guess; server validates and, if correct, awards a point once per question
    socket.on("submitGuess", ({ code, guess }) => {
      code = String(code || "").toUpperCase();
      const room = rooms.get(code);
      if (!room || !room.started) return;

      const current = room.deck[room.currentIndex];
      if (!current) return; // no cards

      const player = room.players.get(socket.id);
      if (!player) return; // not tracked

      const g = normalize(guess);
      const correct = g && g === current.answerNorm;

      if (correct) {
        // Prevent multiple scores by the same player on the same index
        if (player.lastScoredIndex !== room.currentIndex) {
          player.score += 1;
          player.lastScoredIndex = room.currentIndex;
          io.to(code).emit("roomState", serialize(room));
        }
        io.to(socket.id).emit("guessResult", { correct: true });
      } else {
        io.to(socket.id).emit("guessResult", { correct: false });
      }
    });

    // Advance to the next question (host-controlled by default)
    socket.on("nextQuestion", ({ code }) => {
      code = String(code || "").toUpperCase();
      const room = rooms.get(code);
      if (!room || !room.started) return;
      if (socket.id !== room.hostId) return; // keep control centralized

      if (room.currentIndex < Math.max(0, room.deck.length - 1)) {
        room.currentIndex += 1;
        io.to(code).emit("roomState", serialize(room));
      }
    });

    // Optional legacy event (support older client): manually award points
    socket.on("correctAnswer", ({ code, delta = 1 }) => {
      code = String(code || "").toUpperCase();
      const room = rooms.get(code);
      if (!room || !room.started) return;
      const p = room.players.get(socket.id);
      if (!p) return;
      if (p.lastScoredIndex !== room.currentIndex) {
        p.score += Number(delta) || 1;
        p.lastScoredIndex = room.currentIndex;
        io.to(code).emit("roomState", serialize(room));
      }
    });

    // Clean up on disconnect; transfer host or delete empty room
    socket.on("disconnect", () => {
      for (const room of rooms.values()) {
        if (!room.players.has(socket.id)) continue;
        room.players.delete(socket.id);

        if (room.hostId === socket.id) {
          const next = room.players.values().next().value;
          if (next) room.hostId = next.socketId; else { rooms.delete(room.code); continue; }
        }
        io.to(room.code).emit("roomState", serialize(room));
      }
    });
  });
};