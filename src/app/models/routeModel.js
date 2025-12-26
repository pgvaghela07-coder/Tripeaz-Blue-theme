import mongoose from "mongoose";

const routeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    from: {
      type: String,
      required: true,
      trim: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      default: null,
    },
  },
  { timestamps: true }
);

// Index is automatically created by unique: true in field definition

const ROUTE = mongoose.models.Route || mongoose.model("Route", routeSchema);

export default ROUTE;

