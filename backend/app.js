const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Flashcard = require('./models/Flashcard'); //import model
const Folder = require('./models/Folder') //import Folder

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

//Connect to MongoDB with Mongoose
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
    })
    .catch(err => console.error(err));

//Get all flashcards
app.get('/api/flashcards', async (req, res) =>{
    try{
        const {folderId} = req.query;
        let filter = {};
        if(folderId) filter.folder = folderId;
        const cards = await Flashcard.find(filter);
        res.json(cards);
    } catch (err){
        res.status(500).send('DB error');
    }
});

//Get all folders
app.get('/api/folders', async (req, res) => {
    const folders = await Folder.find({});
    res.json(folders);
})

//Add a new flashcard
app.post('/api/flashcards', async (req, res) =>{
    try{
        const {question, answer, folder} = req.body;
        const newCard = new Flashcard({question, answer, folder});
        await newCard.save(); //save to DB
        res.status(201).json(newCard);
    } catch(err){
        res.status(400).json({error: err.message});
    }
});

//Add a folder
app.post('/api/folders', async (req, res) => {
    const {name} = req.body;
    if(!name) return res.status(400).json({error: 'No folder name'});
    try{
        const folder = await Folder.create({name});
        res.status(201).json(folder);
    } catch (err){
        if(err.code === 11000){
            res.status(409).json({error: 'Folder name already exists'});
        }
        else{
            res.status(400).json({error: 'Folder already exists or invalid'});
        }
    }
})

//Edit a flashcard
app.patch('/api/flashcards/:id', async(req, res) => {
    try{
        const updatedFlashcard = await Flashcard.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true, runValidators: true}
        );
        if(!updatedFlashcard){
            return res.status(404).json({message: 'Flashcard not found'});
        }
        res.json(updatedFlashcard);
    } catch(err){
        res.status(500).json({message: err.message});
    }
});

//Edit a folder
app.patch('/api/folders/:id', async(req, res) => {
    const folderId = req.params.id;
    const{name} = req.body;
    if(!name) return res.status(400).json({error: "No new folder name"});

    const existing = await Folder.findOne({name});
    if(existing) return res.status(400).json({error: "Folder name already exists"})

    const folder = await Folder.findByIdAndUpdate(folderId, {name}, {new: true});
    res.json(folder);
})

//delete a flashcard
app.delete('/api/flashcards/:id', async (req, res) =>{
    try{
        await Flashcard.findByIdAndDelete(req.params.id)
        res.status(204).send();
    } catch(err){
        res.status(500).send('DB error');
    }
});

//delete a folder
app.delete('/api/folders/:id', async (req, res) =>{
    const folderId = req.params.id;
    await Folder.findByIdAndDelete(folderId);
    await Flashcard.deleteMany({folder:folderId});
    res.json({success: true});
});


