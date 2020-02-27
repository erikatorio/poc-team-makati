const mongoose = require('mongoose');

const URI = 'mongodb+srv://admin:atlasadmin@cluster0-sxaex.mongodb.net/reporter?retryWrites=true&w=majority';


const connectDB = async()=>{
    await mongoose.connect(URI, {useUnifiedTopology: true, useNewUrlParser: true});
    console.log('db connected...');
}

module.exports = connectDB;