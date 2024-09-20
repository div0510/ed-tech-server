const Course = require('../models/courseModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const {uploadImageToCloudinary} = require('../utils/imageUploader');
const {modelConstants} = require("../utils/constants");


// create course
exports.createCourse = async (req, res) => {
    try {
        const userId = req.user.id;

        let {courseName, courseDescription, whatYouWillLearn, price, tag, category, status, instructions} = req.body;
        const {thumbnail} = req.files.thumbnailImage
        //validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !category || !thumbnail) {
            return res.status(400).send({
                status: false,
                message: 'Please enter all details in course creation. Please try again'
            })
        }

        if (!status || status === undefined) {
            status = "Draft";
        }

        //check for instructor

        const instructorDetails = await User.findById(userId, {accountType: "Instructor"});
        console.log("Instructor Details :: ", instructorDetails);
        if (!instructorDetails) {
            return res.status(400).send({
                status: false,
                message: 'Instructor Details not found'
            })
        }

        // check category validation
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(404).json({
                status: false,
                message: 'Category Details not found'
            })
        }

        // upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME)

        console.log("Thumbnail Image :: ", thumbnailImage)
        // creat entry for course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag: tag,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            status: status,
            instructions: instructions,
        })


        const updatedUser = await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new: true})

        const updateCategory = await Category.findByIdAndUpdate(
            {_id: categoryDetails._id},
            {
                $push: {
                    course: newCourse._id
                }
            },
            {new: true}
        )

        return res.status(200).send({
            status: true,
            message: 'Course Created Successfully',
            data: newCourse
        })

    } catch (err) {
        console.log("Error in creating Course", err);
        return res.status(500).send({
            success: false,
            message: `Error in creating course ${err.message}`
        })
    }
}

//getAllCourses
exports.showAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find(
            {},
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true
            }).populate(modelConstants.instructor).exec()
        return res.status(200).send({
            success: true,
            message: 'All Courses returned successfully!',
            data: allCourses
        })

    } catch (err) {
        console.log("Error in getting All Courses :: ", err);
        return res.status(500).send({
            success: false,
            message: `Error in getting All Courses :: ${err.message}`,
        })
    }
}

exports.getCourseDetails = async (req, res) => {
    try {
        const {courseId} = req.body;
        const courseDetails = await Course.find({_id: courseId})
            .populate({
                path: modelConstants.instructor,
                populate: {path: modelConstants.additionalDetails},
            })
            .populate(modelConstants.category)
            .populate(modelConstants.ratingAndReview)
            .populate({
                path: "courseContent",
                populate: {path: modelConstants.subSection}
            }).exec();

        if (!courseDetails) {
            return res.status(404).json({
                status: false,
                message: 'Course Details not found'
            })
        }
        return res.status(200).send({
            status: true,
            message: 'Course Details found!',
            data: courseDetails,
        })

    } catch (err) {
        console.log("Error in getting courseDetails :: ", err);
        res.status(500).json({
            status: false,
            message: `Error in getting CourseDetails :: ${err.message}`,
        })
    }
}