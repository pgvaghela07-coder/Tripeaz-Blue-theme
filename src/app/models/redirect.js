import mongoose from "mongoose";

const redirectSchema = new mongoose.Schema(
    {
        fromPath: {
            type: String,
            required: true,
            trim: true,
        },
        toPath: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: Number,
            enum: [301, 302],
            default: 301,
        },
        active: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            default: null,
        },
        notes: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Create unique index for fromPath (prevents duplicates and enables fast lookup)
redirectSchema.index({ fromPath: 1 }, { unique: true });
// Index for active status lookup
redirectSchema.index({ active: 1 });

const Redirect = mongoose.models.Redirect || mongoose.model("Redirect", redirectSchema);

export default Redirect;
















