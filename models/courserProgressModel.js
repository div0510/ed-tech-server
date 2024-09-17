const mongoose = require('mongoose');
const {Mongoose} = require("mongoose");
const {modelConstants} = require("../utils/constants");
const courseProgressSchema = new mongoose.Schema({
    courseID:{
        type : mongoose.Schema.Types.ObjectId,
        ref : modelConstants.courses
    },
    completedVideos:[
        {
            type : Mongoose.Schema.Types.ObjectId,
            ref: modelConstants.subSection
        }
    ]
})
module.exports = mongoose.model(modelConstants.courseProgress,courseProgressSchema);