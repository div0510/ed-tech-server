const RatingAndReview = require('../models/ratingAndReviewModel');
const Course = require('../models/courseModel');
const mongoose = require("mongoose");
const {modelConstants} = require("../utils/constants");

//create Rating
exports.createRating = async (req, res) => {
    try {
        const {courseId, rating, review} = req.body;
        const userId = req.user._id;
        const courseDetails = await Course.findOne({_id: courseId, studentsEnrolled: {$elemMatch: {$eq: userId}}});
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: 'Please Student is not enrolled in the course'
            })
        }

        const alreadyReviewed = await RatingAndReview.findOne({user: userId, course: courseId})
        if (alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: `Course is already reviewed by user`,
            })
        }

        const ratingReview = await RatingAndReview.create({
            rating, review,
            user: userId,
            course: courseId,
        });

        const updatedCourseDetails = await Course.findByIdAndUpdate({_id: courseId}, {
            $push: {
                ratingReview: ratingReview._id
            }
        }, {new: true});

        console.log("Updated CourseDetails Successfully in create rating ::", updatedCourseDetails);

        return res.status(200).json({
            status: true,
            message: 'Successfully added rating and review',
        })

    } catch (err) {
        console.log("Error creating rating", err);
        return res.status(400).json({
            success: false,
            message: `Error creating rating ${err.message}`
        })
    }
}
//get Average Rating

exports.getAverageRating = async (req, res) => {
    try {
        const {courseId} = req.body;
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId)
                }
            }, {
                $group: {
                    _id: null,
                    averageRating: {
                        $avg: "$rating"
                    }
                }
            }])

        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                message: 'Successfully calculated average rating ',
                averageRating: result[0].averageRating
            })
        }
        return res.status(200).json({
            success: true,
            message: 'Average rating  is 0 no ratings found',
            avgRating: 0
        })

    } catch (err) {
        console.log("error in getting average rating", err);
        return res.status(500).json({
            success: false,
            message: `Error in getting avg ratings for review ${err.message}`,
        })
    }
}
//get All Rating and reviews
exports.getAllRating = async (req, res) => {
    try {
        const response = await RatingAndReview.find({}).sort({rating: "desc"})
            .populate({
                path: modelConstants.user,
                select: "firstName lastName email image",
            }).populate({
                path: "course",
                select: "courseName",
            }).exec();
        return res.status(200).json({
            success: true,
            message: 'Successfully fetched all ratings',
            data: response,
        })
    } catch (err) {
        return res.status(500).send({
            success: false,
            message: `Unable to get ratings ${err.message}`,
        })
    }
}
//todo find ratings based on courseId
