const mongoose = require('mongoose');
const {modelConstants} = require("../utils/constants");
const profileSchema = new mongoose.Schema({
    gender: {
        type: String,
    },
    dateOfBirth: {
        type: String,
    },
    about: {
        type: String,
        trim: true
    },
    contactNumber: {
        type: Number,
        trim: true
    }
})

module.exports = mongoose.model(modelConstants.profile, profileSchema);