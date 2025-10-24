// backend/app.js
require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const Folder = require("./models/Folder");
const Flashcard = require("./models/Flashcard");
const attachVersus = require("./sockets/versus");

const jwt = require("jsonwebtoken");
const User = require("./models/User");

const auth = require("./middleware/auth");

//chec
// --- Express
const app = express();
app.use(express.json());

// Build allowed origins list from env
// kojo
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

//swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


/**
 * @swagger
 * /:
 *  get:
 *      summary: Root ping
 *      description: Simple response to see if API is up
 *      tags: [Health]
 *      responses:
 *          200:
 *            description: Plain text OK
 *            content:
 *              text/plain:
 *                schema:
 *                  type: string
 *                   example: API OK
 */
app.get("/", (_req, res) => res.status(200).send("API OK"));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns service health and process uptime (seconds).
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 uptime:
 *                   type: number
 *                   description: Seconds the process has been up
 *                   example: 12.345
 */
app.get("/health", auth, (_req, res) =>
  res.status(200).json({ ok: true, uptime: process.uptime() })
);

/**
 * @swagger
 * /api/folders:
 *   get:
 *     summary: List folders
 *     description: Returns all folders sorted by name ascending.
 *     tags: [Folders]
 *     responses:
 *       200:
 *         description: Array of folders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Folder'
 *       500:
 *         description: Server error
 */
app.get("/api/folders", auth, async (req, res) => {
  try {
    const folders = await Folder.find({user: req.user._id}).sort({ name: 1 }).lean();
    res.json(folders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @swagger
 * /api/folders:
 *   post:
 *     summary: Create a folder
 *     tags: [Folders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *           example:
 *             name: "Biology"
 *     responses:
 *       201:
 *         description: Created folder
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Folder'
 *       400:
 *         description: Missing required field(s)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: "name is required"
 *       409:
 *         description: Folder already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: "folder exists"
 *       500:
 *         description: Server error
 */
app.post("/api/folders", auth, async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ error: "name is required" });
    const folder = await Folder.create({ name, user: req.user._id }); // {name} same as {name: name}
    res.status(201).json(folder); //returns folder
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: "folder exists" });
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/register", async(req, res) => {
  try{
    const{username, password} = req.body;
    if(!username?.trim() || !password?.trim()){
      return res.status(400).json({error:"Username and password required"});
    }

    const exists = await User.findOne({username});
    if(exists){
      return res.status(409).json({error:"Username exists already"});
    }

    const user = new User({username, password});
    await user.save();

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({token, username: user.username});
  } catch(err){
    res.status(500).json({error: "Server error: " + err.message})
  }
});

app.post("/api/login", async(req, res) => {
  try{
    const {username, password} = req.body;
    const user = await User.findOne({username});
    if(!user || !(await user.comparePassword(password))){
      return res.status(401).json({error: "invalid credentials"});
    }

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({token, username: user.username});
  } catch(err){
    res.status(500).json({error: "Server error"});
  }
});
/**
 * @swagger
 * /api/folders/{id}:
 *   patch:
 *     summary: Rename a folder
 *     tags: [Folders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Folder ID (Mongo ObjectId)
 *         schema:
 *           type: string
 *           example: "66f1b2a3c4d5e6f7890a1b2c"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *           example:
 *             name: "Biology A1"
 *     responses:
 *       200:
 *         description: Updated folder
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Folder'
 *       400:
 *         description: Missing required field(s)
 *       404:
 *         description: Folder not found
 *       500:
 *         description: Server error
 */
app.patch("/api/folders/:id", auth, async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ error: "name is required" });
    const updated = await Folder.findByIdAndUpdate(
      {_id: req.params.id, user: req.user._id}, //finds by id
      { name }, //updates name {name: name}
      { new: true }   //returns new folder instead of old one
    );
    if (!updated) return res.status(404).json({ error: "not found" });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @swagger
 * /api/folders/{id}:
 *   delete:
 *     summary: Delete a folder and its flashcards
 *     tags: [Folders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Folder ID (Mongo ObjectId)
 *         schema:
 *           type: string
 *           example: "66f1b2a3c4d5e6f7890a1b2c"
 *     responses:
 *       200:
 *         description: Deletion acknowledged
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Folder not found
 *       500:
 *         description: Server error
 */
app.delete("/api/folders/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    await Flashcard.deleteMany({ folder: id, user: req.user._id});
    const del = await Folder.findByIdAndDelete({_id: id, user: req.user._id});
    if (!del) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @swagger
 * /api/flashcards:
 *   get:
 *     summary: List flashcards
 *     description: Optionally filter by folder using the `folderId` query parameter.
 *     tags: [Flashcards]
 *     parameters:
 *       - in: query
 *         name: folderId
 *         required: false
 *         description: Filter by folder ID (Mongo ObjectId)
 *         schema:
 *           type: string
 *           example: "66f1b2a3c4d5e6f7890a1b2c"
 *     responses:
 *       200:
 *         description: Array of flashcards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Flashcard'
 *       500:
 *         description: Server error
 */
app.get("/api/flashcards", auth, async (req, res) => {
  try {
    const q = {};
    if (req.query.folderId) q.folder = req.query.folderId;
    q.user = req.user._id;
    const cards = await Flashcard.find(q).sort({ _id: 1 }).lean();
    res.json(cards);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @swagger
 * /api/flashcards:
 *   post:
 *     summary: Create a flashcard
 *     tags: [Flashcards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               folder:
 *                 type: string
 *                 description: Folder ID (Mongo ObjectId)
 *           example:
 *             question: "What is ATP?"
 *             answer: "Energy currency of the cell"
 *             folder: "66f1b2a3c4d5e6f7890a1b2c"
 *     responses:
 *       201:
 *         description: Created flashcard
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Flashcard'
 *       400:
 *         description: Missing required field(s)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: "question, answer, folder required"
 *       500:
 *         description: Server error
 */
app.post("/api/flashcards", auth, async (req, res) => {
  try {
    const { question, answer, folder } = req.body || {};
    if (!question || !answer || !folder)
      return res
        .status(400)
        .json({ error: "question, answer, folder required" });
    const card = await Flashcard.create({ question, answer, folder, user: req.user._id });
    res.status(201).json(card);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @swagger
 * /api/flashcards/{id}:
 *   patch:
 *     summary: Update a flashcard (partial)
 *     tags: [Flashcards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Flashcard ID (Mongo ObjectId)
 *         schema:
 *           type: string
 *           example: "66f1b2a3c4d5e6f7890a1b2c"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Any subset of fields to update
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               folder:
 *                 type: string
 *                 description: Folder ID (Mongo ObjectId)
 *           example:
 *             answer: "Updated answer"
 *     responses:
 *       200:
 *         description: Updated flashcard
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Flashcard'
 *       404:
 *         description: Flashcard not found
 *       500:
 *         description: Server error
 */
app.patch("/api/flashcards/:id", auth, async (req, res) => {
  try {
    const { question, answer, folder } = req.body || {};
    const card = await Flashcard.findByIdAndUpdate(
      {_id: req.params.id, user: req.user._id},
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

/**
 * @swagger
 * /api/flashcards/{id}:
 *   delete:
 *     summary: Delete a flashcard
 *     tags: [Flashcards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Flashcard ID (Mongo ObjectId)
 *         schema:
 *           type: string
 *           example: "66f1b2a3c4d5e6f7890a1b2c"
 *     responses:
 *       200:
 *         description: Deletion acknowledged
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Flashcard not found
 *       500:
 *         description: Server error
 */
app.delete("/api/flashcards/:id", auth, async (req, res) => {
  try {
    const del = await Flashcard.findByIdAndDelete({_id: req.params.id, user: req.user._id});
    if (!del) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- DB
const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL && process.env.NODE_ENV !== 'test' ) {
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

io.use((socket, next) => {
  try {
    // Prefer auth field from client
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) return next(new Error("Unauthorized"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.userId = decoded.userId;
    next();
  } catch (e) {
    next(new Error("Unauthorized"));
  }
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
