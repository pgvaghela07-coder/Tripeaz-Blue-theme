import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
        description: {
            type: String,
            default: "",
        },
        seoTitle: {
            type: String,
            maxlength: 60,
        },
        seoDescription: {
            type: String,
            maxlength: 160,
        },
        image: {
            type: String,
        },
    },
    { timestamps: true }
);

// Index for slug is automatically created by unique: true in field definition
// Index for parent lookup
categorySchema.index({ parentId: 1 });

const Category =
    mongoose.models.Category ||
    mongoose.model("Category", categorySchema);

export default Category;
















