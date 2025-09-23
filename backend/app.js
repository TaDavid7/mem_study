// backend/app.js
require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const Folder = require("./models/Folder");
const Flashcard = require("./models/Flashcard");
const attachVersus = require("./sockets/versus");


//check
// --- Express
const app = express();
app.use(express.json());

// Build allowed origins list from env (comma-separated)
const allowed = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// CORS middleware: allow listed origins AND no-origin requests (curl/health)
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // server-to-server / curl / health checks
      return cb(null, allowed.includes(origin));
    },
    credentials: true,
  })
);

// Friendly root + health endpoints
app.get("/", (_req, res) => res.status(200).send("API OK"));
app.get("/health", (_req, res) =>
  res.status(200).json({ ok: true, uptime: process.uptime() })
);

// --- Folders
app.get("/api/folders", async (_req, res) => {
  try {
    const folders = await Folder.find({}).sort({ name: 1 }).lean();
    res.json(folders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/folders", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ error: "name is required" });
    const folder = await Folder.create({ name });
    res.status(201).json(folder);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: "folder exists" });
    res.status(500).json({ error: e.message });
  }
});

app.patch("/api/folders/:id", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ error: "name is required" });
    const updated = await Folder.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "not found" });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/folders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Flashcard.deleteMany({ folder: id });
    const del = await Folder.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Flashcards
app.get("/api/flashcards", async (req, res) => {
  try {
    const q = {};
    if (req.query.folderId) q.folder = req.query.folderId;
    const cards = await Flashcard.find(q).sort({ _id: 1 }).lean();
    res.json(cards);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/flashcards", async (req, res) => {
  try {
    const { question, answer, folder } = req.body || {};
    if (!question || !answer || !folder)
      return res
        .status(400)
        .json({ error: "question, answer, folder required" });
    const card = await Flashcard.create({ question, answer, folder });
    res.status(201).json(card);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch("/api/flashcards/:id", async (req, res) => {
  try {
    const { question, answer, folder } = req.body || {};
    const card = await Flashcard.findByIdAndUpdate(
      req.params.id,
      {
        ...(question && { question }),
        ...(answer && { answer }),
        ...(folder && { folder }),
      },
      { new: true } // return updated doc
    );
    if (!card) return res.status(404).json({ error: "not found" });
    res.json(card);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/flashcards/:id", async (req, res) => {
  try {
    const del = await Flashcard.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- DB
const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("MONGO_URL is missing");
  process.exit(1);
}

if(process.env.NODE_ENV !== 'test'){
    mongoose
    .connect(MONGO_URL, { serverSelectionTimeoutMS: 8000 })
    .then(() => console.log("Mongo connected"))
    .catch((err) => {
        console.error("Mongo connection error:", err?.message || err);});
}
// --- HTTP + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowed.length ? allowed : true,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});


attachVersus(io);

// --- Start
const PORT = process.env.PORT || 5000;
if(process.env.NODE_ENV !== 'test'){
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}


// graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  server.close(() => process.exit(0));
});

module.exports = {app, server};
