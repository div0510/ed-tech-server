const User = require('../models/userModel');
const OTP = require('../models/OTPModel');
const otpGenerator = require('otp-generator');
const bcrypt = require("bcrypt");
const Profile = require('../models/profileModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();
//send OTP
exports.sendOTP = async (req, res) => {
    try {
        // fetch email from req body
        const {email} = req.body;
        // Checks if user exist in db
        const checkUserExist = await User.findOne({email: email});
// if exists return response
        if (checkUserExist) {
            return res.status(401).json({
                success: false,
                message: 'User already exists'
            })
        }

        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
            digits: true
        });
        console.log("Otp GEnerated :: ", otp);

        // check otp uniqueness
        let result = await OTP.findOne({otp: otp});
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
                digits: true
            });
            result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email, otp};

        // create otp entry in db
        const otpBody = await OTP.create(otpPayload);
        console.log("Otp Body :: ", otpBody);
        return res.status(200).json({
            success: true,
            message: 'Otp Sent Successfully',
        });
    } catch (error) {
        console.log("Error in sending OTP body :: ", error);

        return res.status(500).json({
            success: false,
            message: `Error in sending OTP body :: ${error.message}`,
        })
    }
}

//sign up
exports.signUp = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;
// check empty fields
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return res.status(403).json({
                success: false,
                message: 'Please enter all details'
            })
        }

        // match password and confirm password
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            })
        }

        // check user existence
        const checkUserExists = await User.findOne({email: email})
        if (checkUserExists) {
            return res.status(403).json({
                success: false,
                message: 'User already exists'
            })
        }

        // find recent otp
        const recentOtp = await OTP.findOne({email: email}).sort({createdAt: -1}).limit(1)
        console.log("Recent Otp", recentOtp);
        //validate OTP
        if (recentOtp.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Otp Not Found'
            })
        } else if (otp !== recentOtp.otp) {
            return res.status(403).json({
                success: false,
                message: 'INVALID Otp '
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })
        const user = await User.create({
            firstName,
            lastName,
            email, contactNumber,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,

        })
        return res.status(200).json({
            success: true,
            message: 'User Registered Successfully',
            user
        })

    } catch (err) {
        console.log("Error in creating User :: ", err)
        return res.status(500).json({
            success: false,
            message: `Error in registering User please try again :: ${err.message}`,
        })
    }
}

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: 'Please enter all details. Please try again'
            })
        }
        const user = User.findOne({email}).populate('additionalDetails');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User does not exist. Please Signup'
            })
        }
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                accountType: user.accountType,
                id: user._id
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "2h"})
            user.token = token
            user.password = undefined
            const options = {
                expires: new Date(Date.now() + 3 * 34 * 60 * 1000),
                httponly: true
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                message: 'Login successfull',
                token,
                user
            })

        } else {
            return res.status(401).json({
                success: false,
                message: 'Password is incorrect'
            })
        }

    } catch (err) {
        console.log("Error in login :: ", err)
        return res.status(500).json({
            success: false,
            message: `Error in login :: ${err.message}`,
        })
    }
}

//change Password
exports.exchangePassword = async (req, res) => {
//     get date from req body
    // get oldPassword newPassword confirmPassword
    //validation
    // update pwd in db
    // send mail password updated
    // return response
}