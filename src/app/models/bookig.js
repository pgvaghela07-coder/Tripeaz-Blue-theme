import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
    {
        tripType: String,
        from: String,
        to: String,
        date: String,
        time: String,
        tripEndDate: String, 
        passengers: Number,
        carType: String,
        phone: String,
        assignedTo: String, // Field to store assignment/comment
    },
    { timestamps: true }
);


const Booking =
    mongoose.models.Booking ||
    mongoose.model("Booking", BookingSchema);

export default Booking;


