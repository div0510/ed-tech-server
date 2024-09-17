const mongoose = require('mongoose')
const {modelConstants} = require("../utils/constants");
const CourseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        trim: true,
        required: true
    },
    courseDescription: {
        type: String,
        trim: true,
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: modelConstants.user,
        required: true
    },
    whatYouWillLearn: {
        type: String,
    },
    courseContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: modelConstants.section
        }
    ],
    ratingAndReviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: modelConstants.ratingAndReview
        }

    ],
    price: {
        type: Number,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: modelConstants.category
    },
    tag: {
        type: [String],
        required: true
    },
    studentsEnrolled: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: modelConstants.user
        }

    ],
    instructions: {
        type: [String],
    },
    status: {
        type: String,
        enum: ["Draft", "Published"],
    },
})

module.exports = mongoose.model(modelConstants.courses, CourseSchema)