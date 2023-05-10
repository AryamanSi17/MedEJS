require('dotenv').config();
const DB_URI=process.env.DB_URI;
const mongoose=require("mongoose");
mongoose.connect(DB_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
});
const db=mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});
module.exports = mongoose;