const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/userModel');

const bcrypt = require('bcrypt');

//auth
exports.auth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.body.token || req.headers("Authorisation").replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token is missing'
            })
        }
        try {

            const decode = await jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
            console.log("Decoded Token :: ", decode)
            req.user = decode;
        } catch (e) {
            console.log("Error in verifying token", e);
            return res.status(401).json({
                success: false,
                message: 'Token is invalid'
            })
        }
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Something went wrong while verifying token'
        })
    }
}

// isStudent
exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType.toLowerCase() !== "student") {
            return res.status(401).json({
                success: false,
                message: 'This route is for student only'
            })
        }
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified please try again'
        })
    }
}

// isInstructor
exports.isInstructor = async (req, res, next) => {
    try {
        if (req.user.accountType.toLowerCase() !== "instructor") {
            return res.status(401).json({
                success: false,
                message: 'This route is for Instructor only'
            })
        }
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified please try again'
        })
    }
}

//isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType.toLowerCase() !== "admin") {
            return res.status(401).json({
                success: false,
                message: 'This route is for Admin only'
            })
        }
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified please try again'
        })
    }
}