const mongoose = require('mongoose');
require('dotenv').config();
exports.connect = () => {
    mongoose.connect(
        process.env.MONGO_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    ).then(() => {
        console.log("Database Connected");
    }).catch((err) => {
        console.error("Unable to connect to database",err);
        process.exit(1);
    })

}