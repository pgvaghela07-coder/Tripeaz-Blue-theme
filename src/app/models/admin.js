import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({

    userName: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        default: null,
    },

    // For backward compatibility, also store role slug
    roleSlug: {
        type: String,
        default: "admin", // Default role
    },

}, { timestamps: true });


const Admin =
    mongoose.models.Admin ||
    mongoose.model("Admin", adminSchema);

export default Admin;

