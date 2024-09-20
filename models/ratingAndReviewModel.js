const mongoose = require('mongoose');
const {modelConstants} = require("../utils/constants");
const RatingAndReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: modelConstants.user,
    },
    rating: {
        type: Number,
        required: true
    },
    review: {
        type: String,
        required: true,
        trim: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: modelConstants.courses,
        index: true,
    },

})

module.exports = mongoose.model(modelConstants.ratingAndReview, RatingAndReviewSchema);