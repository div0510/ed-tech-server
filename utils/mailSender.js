const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        })
        let info = await transporter.sendMail({
            from: 'StudyNotion || Divyansh Verma',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        })
        console.log("Mail INFO :: ", info);
        return info;
    } catch (error) {
        console.error("Error in sending mail", error, "\t->  ", error.message);
    }
}
module.exports = mailSender;