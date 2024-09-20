const express = require("express");
const router = express.Router();
const {login, signUp, sendOTP, changePassword} = require("controller/Auth");
const {resetPassword, resetPasswordToken} = require("../controller/ResetPassword");
const {auth} = require("../middleware/auth");

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

//Route for user login
router.post("/login", login)

// Route for user signup
router.post("/signUp", signUp)

// Route for sending OTP to the user's email
router.post("/sendOTP", sendOTP)

// Route for Changing the password
router.post("/changePassword", auth, changePassword)

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
router.post('/resetPasswordToken', resetPasswordToken)

// Route for resetting user's password after verification
router.post('/resetPassword', resetPassword)

// Export the router for use in the main application
module.exports = router;
