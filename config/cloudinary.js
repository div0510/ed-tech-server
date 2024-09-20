const cloudinary = require('cloudinary').v2

exports.cloudConnect = () => {
    try {
        cloudinary.config(
            {
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            }
        )
    } catch (err) {
        console.log("Error in connecting to cloudinary ", err);
    }
}