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

// --- Express ---
const app = express();
app.use(express.json());
app.use(cors({ origin: (process.env.CORS_ORIGIN || "*").split(",") }));


// --- REST: Folders ---
app.get("/api/folders", async (req, res) => {
  try {
    const folders = await Folder.find({}).sort({ name: 1 }).lean();
    res.json(folders);
  } catch (e) { res.status(500).json({ error: e.message }); }
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
    const updated = await Folder.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!updated) return res.status(404).json({ error: "not found" });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/folders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Flashcard.deleteMany({ folder: id });
    const del = await Folder.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- REST: Flashcards ---
app.get("/api/flashcards", async (req, res) => {
  try {
    const q = {};
    if (req.query.folderId) q.folder = req.query.folderId;
    const cards = await Flashcard.find(q).sort({ _id: 1 }).lean();
    res.json(cards);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/flashcards", async (req, res) => {
  try {
    const { question, answer, folder } = req.body || {};
    if (!question || !answer || !folder) return res.status(400).json({ error: "question, answer, folder required" });
    const card = await Flashcard.create({ question, answer, folder });
    res.status(201).json(card);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch("/api/flashcards/:id", async (req, res) => {
  try {
    const { question, answer, folder } = req.body || {};
    const card = await Flashcard.findByIdAndUpdate(
      req.params.id,
      { ...(question && { question }), ...(answer && { answer }), ...(folder && { folder }) },
      { new: true }
    );
    if (!card) return res.status(404).json({ error: "not found" });
    res.json(card);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/flashcards/:id", async (req, res) => {
  try {
    const del = await Flashcard.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- DB ---
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/memstudy";
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ Mongo connected"))
  .catch((err) => { console.error("❌ Mongo connection error", err); process.exit(1); });

// --- HTTP + Socket.IO ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: (process.env.CORS_ORIGIN || "*").split(",") } });
attachVersus(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));

process.on("SIGINT", async () => { await mongoose.connection.close(); server.close(() => process.exit(0)); });