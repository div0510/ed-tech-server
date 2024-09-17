const User = require('../models/userModel');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');
// reset Password Token
exports.resetPasswordToken = async (req, res) => {
    try {
        const {email} = req.body;
        // get user from email and validate it
        const user = User.findOne({email: email});
        if (!user) {
            return res.status(400).send({
                success: false,
                message: 'User does not exist'
            })
        }

        //generate token with expiration time
        const token = crypto.randomBytes(20).toString("hex");
        ;
// update user with expiretoken
        const updatedDetails = await User.findOneAndUpdate({email: email}, {
            token: token,
            resetPasswordExpires: Date.now() + 3600000
        }, {new: true})
        console.log("Details :: ", updatedDetails)
        // create url

        const url = `https://localhost:3000/update-password/${token}`
        // send mail
        await mailSender(email, "Password Reset Link", `Password reset link : ${url}`)
        //send response
        return res.status(200).json({
            success: true,
            message: 'Email Sent Successfully',
        })
    } catch (err) {
        console.log('Error in sending reset password mail :: ', err)
        return res.status(400).json({
            success: false,
            message: `Error in sending reset password mail :: ${err.message}`,
        })
    }

}
//reset Password
exports.resetPassword = async (req, res) => {
    try {
        const {password, confirmPassword, token} = req.body;
        if (!token || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please enter all details in reset password'
            })

        } else if (password !== confirmPassword) {
            return res.status(403).json({
                success: false,
                message: 'Password and confirm password do not match'
            })
        }

        const userDetails = await User.findOne({token: token});
        if (!userDetails) {
            return res.status(403).json({
                success: false,
                message: 'Token invalid'
            })
        }

        if (!(userDetails.resetPasswordExpires > Date.now())) {
            return res.status(403).json({
                success: false,
                message: 'Password reset Token expired. Please regenerate one'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        await User.findOneAndUpdate({token: token}, {password: hashedPassword}, {new: true})
        return res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        })
    } catch (err) {
        console.log("Error in  reset password  :: ", err)
        return res.status(500).json({
            success: false,
            message: `Error in reset password  :: ${err.message}`,
        })
    }
}