const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Folder', folderSchema);
// Exports the Folder model as 'Folder'
