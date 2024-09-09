const mongoose = require('mongoose');
const mailSender = require("../utils/mailSender");
const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 * 60,
    }
})

async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "Verification Email from study Notion", otp);
        console.log("Email Sent Successfully :: ", mailResponse);
    } catch (err) {
        console.error("Error in send Verification Email :: ", err);
        throw err;
    }
}

OTPSchema.pre("save", async function (next) {
    await  sendVerificationEmail(this.email, this.otp);
    next();

})
module.exports = mongoose.model('OTP', OTPSchema);