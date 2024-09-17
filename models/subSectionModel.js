const mongoose = require('mongoose');
const {modelConstants} = require("../utils/constants");
const subSectionSchema = new mongoose.Schema({
    title: {type: String},
    timeDuration: {type: String},
    description: {type: String},
    videoUrl: {type: String}
})
module.exports = mongoose.model(modelConstants.subSection, subSectionSchema);