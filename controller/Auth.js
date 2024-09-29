const bcrypt = require("bcrypt");
const User = require('../models/userModel');
const OTP = require('../models/OTPModel');
const otpGenerator = require('otp-generator');
const Profile = require('../models/profileModel');
const jwt = require('jsonwebtoken');
const mailSender = require("../utils/mailSender");
const {passwordUpdated} = require("../mail/templates/passwordUpdate");
const {modelConstants} = require("../utils/constants");
require('dotenv').config();


//send OTP
exports.sendOTP = async (req, res) => {
    try {
        // fetch email from req body
        const {email} = req.body;
        // Checks if user exist in db
        const checkUserExist = await User.findOne({email});
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
            // digits: true
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
            result = await OTP.findOne({otp: otp}); //todo check for this line at testing
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
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
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
        const checkUserExists = await User.findOne({email})
        if (checkUserExists) {
            return res.status(403).json({
                success: false,
                message: 'User already exists. Please sign in to continue.'
            })
        }

        // find recent otp
        const recentOtp = await OTP.find({email}).sort({createdAt: -1}).limit(1);
        console.log("Recent Otp ::", recentOtp);
        //validate OTP
        if (recentOtp.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Otp Not Found'
            })
        } else if (otp !== recentOtp[0].otp) {
            return res.status(403).json({
                success: false,
                message: 'INVALID Otp '
            })
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)
        // Create the user
        let approved = "";
        approved === "Instructor" ? (approved = false) : (approved = true);

        // Create the Additional Profile For User
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType: accountType,
            approved: approved,
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

//login
exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: 'Please enter all details. Please try again'
            })
        }
        const user = await User.findOne({email}).populate(modelConstants.additionalDetails).exec();
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User does not exist. Please Signup'
            })
        }

        // Generate JWT token and Compare Password
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                {email: user.email, id: user._id, accountType: user.accountType},
                process.env.JWT_SECRET,
                {expiresIn: "2h"});

            user.token = token
            user.password = undefined
            const options = {
                expires: new Date(Date.now() + 3 * 24  * 60 * 60 * 1000),
                httponly: true
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                message: 'Login successful',
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
exports.changePassword = async (req, res) => {
    try {
        //     get data from req body
        const userDetails = await User.findById(req.user.id);

        const {oldPassword, newPassword, confirmPassword} = req.body;

        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        );
        if (!isPasswordMatch) {
            // If old password does not match, return a 401 (Unauthorized) error
            return res
                .status(401)
                .json({success: false, message: "The password is incorrect"});
        }

        if (newPassword !== confirmPassword) {
            return res.status(401).json({
                success: false,
                message: 'New password and confirm password do not match'
            })
        }
        // get oldPassword newPassword confirmPassword
        // const userDetails = User.findOne({email: email});
        if (!userDetails) {
            return res.status(401).json({
                success: false,
                message: 'User does not exist'
            })
        }
        // const compareResult =  bcrypt.compare(newPassword, userDetails.password);
        // if (compareResult) {
        //     return res.status(401).json({
        //         success: false,
        //         message: 'Password changed successfull',
        //     })
        // }

        //validation
        // const updatedUserDetails = await  User.findByIdAndUpdate({})

        const encryptedPassword = await bcrypt.hash(newPassword, 10)
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            {password: encryptedPassword},
            {new: true}
        );

        const emailResponse = await mailSender(updatedUserDetails.email, passwordUpdated(
            updatedUserDetails.email,
            `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        ));
        console.log("Email sent successfully:", emailResponse.response);
        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        })
        // update pwd in db
        // send mail password updated
        // return response
    } catch (err) {
        console.log("Error in changePassword :: ", err)
        return res.status(500).json({
            success: false,
            message: `Error in changePassword :: ${err.message}`,
        })
    }

}