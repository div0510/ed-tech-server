const mongoose = require('mongoose');
const {modelConstants} = require("../utils/constants");
const SectionSchema = new mongoose.Schema({
    sectionName: {
        type: String,
    },
    subSection: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: modelConstants.subSection,
            required: true
        }
    ]
})

module.exports = mongoose.model(modelConstants.section, SectionSchema);