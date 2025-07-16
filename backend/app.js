const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Flashcard = require('./models/Flashcard'); //import model

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
        const cards = await Flashcard.find();
        res.json(cards);
    } catch (err){
        res.status(500).send('DB error');
    }
});

//Add a new flashcard
app.post('/api/flashcards', async (req, res) =>{
    try{
        const {question, answer} = req.body;
        const newCard = new Flashcard({question, answer});
        await newCard.save(); //save to DB
        res.status(201).json(newCard);
    } catch(err){
        res.status(400).json({error: err.message});
    }
});

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

//delete a flashcard
app.delete('/api/flashcards/:id', async (req, res) =>{
    try{
        await Flashcard.findByIdAndDelete(req.params.id)
        res.status(204).send();
    } catch(err){
        res.status(500).send('DB error');
    }
});


