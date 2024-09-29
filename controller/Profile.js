const Profile = require('../models/profileModel');
const User = require('../models/userModel');
const {modelConstants} = require("../utils/constants");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const {scheduleJob} = require("node-schedule");
exports.updateProfile = async (req, res) => {
    try {
        const {dateOfBirth = "", about = "", gender, contactNumber} = req.body;
        const id = req.user.id;
        if (!contactNumber || !id) {
            return res.status(400).json({
                status: false,
                message: 'Please enter all details while updating profile. Please try again'
            })
        }
        const userDetails = await User.findById(id);
        const profileDetails = await Profile.findById(userDetails.additionalDetails);
        // profileDetails.dateOfBirth = dateOfBirth === "" ? profileDetails.dateOfBirth : dateOfBirth;
        // profileDetails.about = about === "" ? profileDetails.about : about;
        // profileDetails.gender = gender === "" ? profileDetails.gender : gender;
        // profileDetails.contactNumber = contactNumber === "" ? profileDetails.contactNumber : contactNumber;

        // Merge only non-empty values from req.body with existing profile details
        const updatedProfileDetails = {
            ...profileDetails._doc,  // Current profile details from the DB
            ...(dateOfBirth && {dateOfBirth}),
            ...(about && {about}),
            ...(gender && {gender}),
            ...(contactNumber && {contactNumber}),
        };
        Object.assign(profileDetails, updatedProfileDetails);
        await profileDetails.save();
        return res.status(200).json({
            status: true,
            message: 'Profile updated successfully',
            profileDetails,
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Error in updating profile ${err.message}`
        });

    }
}
//delete account
exports.deleteAccount = async (req, res) => {
    try {
        // const job = scheduleJob("10 * * * * *", function () {
        //     console.log("The answer to life, the universe, and everything!");
        // });
        // console.log("Cron JOB for delete account ::", job);
        const id = req.user.id;
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(404).send({
                success: false,
                message: 'User does not exist'
            })
        }
        await Profile.findByIdAndDelete({_id: userDetails.additionalDetails});
        await User.findByIdAndDelete({_id: userDetails._id});
        //todo : un-enroll user from all enrolled courses
        return res.status(200).json({
            status: true,
            message: 'Account deleted successfully'
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Error in deleting Account. Please try again`
        })
    }
}

exports.getAllUserDetails = async (req, res) => {
    try {
        const id = req.user.id;
        const userDetails = await User.findById(id).populate(modelConstants.additionalDetails).exec();
        console.log(`User Details ::`, userDetails);
        if (!userDetails) {
            return res.status(400).send({
                success: false,
                message: 'User does not exist'
            })
        }
        return res.status(200).json({
            status: true,
            message: 'User details found successfully',
            data: userDetails,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Error in getAllUsersDetails : ${err.message}`
        })
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture
        const userId = req.user.id

        const image = await uploadImageToCloudinary(displayPicture, process.env.FOLDER_NAME, 1000, 1000);
        console.log("Display Picture :: ", image);

        const updatedProfile = await User.findByIdAndUpdate({_id: userId}, {
            image: image.secure_url,
        }, {new: true});

        return res.status(200).json({
            status: true,
            message: 'Profile updated successfully',
            data: updatedProfile
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error updating display picture',
        })
    }
}

exports.getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id;
        const userDetails = await User.findById(userId).populate(modelConstants.courses).exec();
        if (!userDetails) {
            return res.status(400).send({
                success: false,
                message: 'User does not exist'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Enrolled Courses Found successfully',
            data: userDetails.courses,
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            message: `Error in getEnrolledCourses :: ${err.message}`
        })
    }
}