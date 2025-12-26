import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
    {
        filePath: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            required: true,
        },
        mimeType: {
            type: String,
            required: true,
        },
        width: {
            type: Number,
        },
        height: {
            type: Number,
        },
        size: {
            type: Number, // File size in bytes
        },
        sizes: {
            type: {
                thumbnail: String,
                medium: String,
                large: String,
            },
            default: {},
        },
        altText: {
            type: String,
            default: "",
        },
        caption: {
            type: String,
            default: "",
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            default: null,
        },
        usageCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Index for search
mediaSchema.index({ altText: "text", caption: "text" });
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ createdAt: -1 });

const Media = mongoose.models.Media || mongoose.model("Media", mediaSchema);

export default Media;









