const mongoose = require('mongoose');

const connectDb = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Mongodb connected successfullyyyy");
    }catch(err){
        console.error("Error connecting to MongoDB:", err);
    }
};

module.exports = connectDb;