import mongoose from "mongoose";

const bookingCounterSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true,
    unique: true,
  },
  sequence: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  year: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

// Index for fast lookups by month and year
bookingCounterSchema.index({ month: 1, year: 1 }, { unique: true });

const BookingCounter =
  mongoose.models.BookingCounter ||
  mongoose.model("BookingCounter", bookingCounterSchema);

export default BookingCounter;

