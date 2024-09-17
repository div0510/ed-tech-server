const SubSection = require("../models/subSectionModel");
const Section = require("../models/sectionModel");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const {modelConstants} = require("../utils/constants");


// create Sub section
exports.createSubSection = async (req, res) => {
    try {
        const {sectionId, title, timeDuration, description,} = req.body;
        const video = req.files.videoFile;
        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                status: false,
                message: 'Please enter all details in sub-section creation. Please try again'
            })
        }

        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        const subSectionDetails = new SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            video: uploadDetails.secure_url,
        });
        const sectionUpdatedDetails = await Section.findByIdAndUpdate(
            {_id: sectionId},
            {
                $push: {
                    subSection: subSectionDetails._id
                }
            }, {new: true}).populate(modelConstants.subSection);
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
        const {sectionId, subSectionId, title, timeDuration, description,} = req.body;
        const video = req.files.videoFile;
        if (!title || !timeDuration || !description || !video) {
            return res.status(400).send({
                status: false,
                message: 'Please enter all details in sub-section creation. Please try again'
            })
        }
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        const subSectionDetails = await SubSection.findById(subSectionId);
        subSectionDetails.title = title;
        subSectionDetails.timeDuration = timeDuration;
        subSectionDetails.description = description;
        subSectionDetails.video = uploadDetails.secure_url;
        await subSectionDetails.save();
        return res.status(200).json({
            status: true,
            message: 'Subsection updated successfully',
        })
    } catch (err) {
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
                _id: subSectionId
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