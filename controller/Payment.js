const {instance} = require('../config/razorpay');
const Course = require('../models/courseModel');
const User = require('../models/userModel');
const mailSender = require('../utils/mailSender');
const {courseEnrollmentEmail} = require('../mail/templates/courseEnrollmentEmail');
const {default: mongoose} = require("mongoose");

//capture the payment

exports.capturePayment = async (req, res) => {
    // try {
    const {courseId} = req.body;
    const userId = req.user.id;
    if (!courseId) {
        return res.status(400).json({
            success: false,
            message: 'Please provide valid course id'
        })
    }
    let courseDetails;
    try {

        courseDetails = await Course.findById(courseId);
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: 'Unable to find course'
            })
        }
        const uid = new mongoose.Types.ObjectId(userId);
        if (courseDetails.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success: false,
                message: 'Student already enrolled',
            })
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Error in fetching course details at capture Payment ${err.message}`,
        })
    }

    const amount = courseDetails.price;
    const currency = "INR"
    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            courseId: courseId,
            userId
        }
    };

    try {
        const paymentResponse = await instance.orders.create(options);
        console.log("Payment Response", paymentResponse);
        return res.status(200).json({
            status: true,
            message: 'Payment created successfully',
            courseName: courseDetails.courseName,
            courseDescription: courseDetails.courseDescription,
            thumbnail: courseDetails.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        })
    } catch (err) {
        console.log(error);
        res.json({
            success: false,
            message: "Could not initiate order",
        });
    }
}

//verify signature
exports.verifySignature = async (req, res) => {
    try {

        const webhookSecret = "12345678"
        const signature = req.headers['x-razorpay-signature'];
        const digest = crypto.createHmac('sha256', webhookSecret).update(JSON.stringify(req.body)).digest('hex')
        if (signature === digest) {
            console.log("Payment Authorized");
            const {courseId, userId} = req.body.payload.payment.entity.notes;
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id: courseId},
                {$push: {studentsEnrolled: userId}},
                {new: true});

            if (!enrolledCourse) {
                return res.status(500).json({
                    success: false,
                    message: 'Course not found'
                })
            }
            console.log("Enrolled course :: ", enrolledCourse)

            const enrolledUser = await User.findOneAndUpdate(
                {_id: userId},
                {$push: {courses: courseId}},
                {new: true})
            console.log("Enrolled user :: ", enrolledUser)

            const emailResponse = await mailSender(enrolledUser.email, "Course Enrollment Confirmation", "Congratulations, you are onboarded into new Course");
            console.log("Email response ", emailResponse);

            return res.status(200).json({
                status: true,
                message: 'Signature was successfully verified, and student enrolled in course',
            })
        } else {
            return res.status(500).json({
                status: false,
                message: 'Invalid request',
            })
        }

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Unable to verify your Payment'
        })
    }
}