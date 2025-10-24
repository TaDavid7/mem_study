const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true},
  user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
});

folderSchema.index({name:1, user:1}, {unique:true});
module.exports = mongoose.model('Folder', folderSchema);
// Exports the Folder model as 'Folder'
