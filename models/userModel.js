const mongoose = require('mongoose');
const {modelConstants} = require("../utils/constants");
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    accountType: {
        type: String,
        required: true,
        enum: ['Admin', 'Student', 'Instructor'],
    },
    active: {
        type: Boolean,
        default: true,
    },
    approved: {
        type: Boolean,
        default: true,
    },
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: modelConstants.profile
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: modelConstants.courses
        }
    ],
    image: {
        type: String,
        required: true
    },
    token: {
        type: String
    },
    resetPasswordExpires: {
        type: Date,
    },
    courseProgress: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: modelConstants.courseProgress
        }
    ]
}, {timestamps: true});

module.exports = mongoose.model(modelConstants.user, userSchema);