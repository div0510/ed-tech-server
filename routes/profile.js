const express = require("express");
const router = express.Router();
const {auth, isInstructor} = require("../middleware/auth");
const {
    deleteAccount,
    updateProfile,
    getAllUserDetails,
    updateDisplayPicture,
    getEnrolledCourses
} = require("../controller/Profile");

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************
// Delete User Account
router.post('/deleteProfile', deleteAccount);
router.put('/updateProfile', auth, updateProfile);
router.get('/getAllUserDetails', auth, getAllUserDetails);

// Get Enrolled Courses
router.get('/getEnrolledCourses', auth, getEnrolledCourses);
router.put('/updateDisplayPicture', auth, updateDisplayPicture);

module.exports = router;