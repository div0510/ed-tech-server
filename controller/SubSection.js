const SubSection = require("../models/subSectionModel");
const Section = require("../models/sectionModel");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const {modelConstants} = require("../utils/constants");


// create Sub section
exports.createSubSection = async (req, res) => {
    try {
        const {sectionId, title, timeDuration, description,} = req.body;
        const video = req.files.video;
        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                status: false,
                message: 'Please enter all details in sub-section creation. Please try again'
            })
        }

        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        const subSectionDetails = new SubSection.create({
            title: title,
            timeDuration: `${uploadDetails.duration}`,
            description: description,
            video: uploadDetails.secure_url,
        });
        const sectionUpdatedDetails = await Section.findByIdAndUpdate(
            {_id: sectionId},
            {
                $push: {
                    subSection: subSectionDetails._id
                }
            }, {new: true}).populate(modelConstants.subSection).exec();
        return res.status(200).json({
            status: true,
            message: 'Subsection created Successfully',
            sectionUpdatedDetails
        })


    } catch (err) {
        console.log("Error creating SubSection");
        res.status(500).json({
            success: false,
            message: `Error in creating SubSection ${err.message}`
        });

    }
}

// todo : update Sub-section

exports.updateSubSection = async (req, res) => {
    try {
        const {sectionId, subSectionId, title, description,} = req.body;
        const subSection = await SubSection.findById(sectionId)
        if (!subSection) {
            return res.status(400).json({
                status: false,
                message: `Unable to fetch sub-section. Please try again`
            })
        }

        if (title !== undefined) {
            subSection.title = title
        }
        if (description !== undefined) {
            subSection.description = description
        }
        if (req.files && req.files.video !== undefined) {
            const video = req.files.videoFile;
            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            subSection.videoUrl = uploadDetails.secure_url
            subSection.timeDuration = `${uploadDetails.duration}`
        }
        await subSection.save();
        return res.status(200).json({
            status: true,
            message: 'Subsection updated Successfully',
        })
    } catch (err) {
        console.log(`Error in updating SubSection ${err.message}`)
        res.status(500).json({
            success: false,
            message: `Error in updating SubSection ${err.message}`
        })
    }
}

// todo : delete Sub-section
exports.deleteSubSection = async (req, res) => {
    try {

        const {sectionId, subSectionId} = req.body;
        if (!sectionId || !subSectionId) {
            return res.status(400).send({
                status: false,
                message: 'Please enter all details in sub-section deletion. Please try again'
            })
        }

        const updatedSection = await Section.findByIdAndUpdate({_id: sectionId}, {
            $pull: {
                subSection: subSectionId
            }
        }, {new: true})
        console.log(`Updated section :: ${updatedSection}`);
        await SubSection.findByIdAndDelete(subSectionId);
        return res.status(200).json({
            status: true,
            message: 'Subsection deleted successfully'
        })
    } catch (err) {
        res.status(500).send({
            status: false,
            message: `Unable to delete SubSection ${err.message}`,
        })
    }
}