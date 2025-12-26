import mongoose from "mongoose";
import { type } from "os";
import { types } from "util";

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },

    image: {
        type: String,
        require: true
    },

    // used to delete image in cloudinary when delete bolg

    img_publicId: {
        type: String,
    },

    description: {
        type: String,
        require: true
    },

    slug: {
        type: String,
        required: true,
    },

    metaTitle: {
        type: String,
        maxlength: 60,
    },

    metaDescription: {
        type: String,
        maxlength: 160,
    },

    metaKeywords: {
        type: [String],
        default: [],
    },

    extra_metatag: {
        type: String,
    },

    // Publish / Draft / Scheduled / Archived
    status: {
        type: String,
        enum: ["draft", "scheduled", "published", "archived"],
        default: "draft",
    },

    // FAQs array
    faqs: {
        type: [
            {
                question: {
                    type: String,
                    required: true,
                },
                answer: {
                    type: String,
                    required: true,
                },
            }
        ],
        default: [],
    },

    // Categories (many-to-many)
    categories: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Category",
        default: [],
    },

    // Tags (many-to-many)
    tags: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Tag",
        default: [],
    },

    // Scheduling
    scheduledAt: {
        type: Date,
        default: null,
    },

    // Canonical URL
    canonicalUrl: {
        type: String,
        default: null,
    },

    // Author reference
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null,
    },

    // Featured image alt text
    featuredImageAlt: {
        type: String,
        default: "",
    },
}, { timestamps: true })

// Create unique index on slug (only once)
blogSchema.index({ slug: 1 }, { unique: true });
const BLOG = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

export default BLOG