import mongoose from "mongoose";

const blogRevisionSchema = new mongoose.Schema(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog",
            required: true,
        },
        editorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            default: null,
        },
        contentHtml: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        metaTitle: {
            type: String,
            default: "",
        },
        metaDescription: {
            type: String,
            default: "",
        },
        excerpt: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Index for fast lookup
blogRevisionSchema.index({ postId: 1, createdAt: -1 });
blogRevisionSchema.index({ editorId: 1 });

const BlogRevision = mongoose.models.BlogRevision || mongoose.model("BlogRevision", blogRevisionSchema);

export default BlogRevision;









