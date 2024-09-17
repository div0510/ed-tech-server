const mongoose = require('mongoose');
const {modelConstants} = require("../utils/constants");
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: modelConstants.courses
    }]
})


module.exports = mongoose.model(modelConstants.category, categorySchema);