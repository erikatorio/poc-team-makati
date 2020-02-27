const mongoose = require('mongoose');

// Define Schema
const FileSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  file0: {
    type: Array
  },
})

const File = mongoose.model("tbl_file", FileSchema);
module.exports = File;