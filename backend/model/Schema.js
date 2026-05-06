import mongoose from "mongoose";
const ImageSchema = new mongoose.Schema({
    ImageName: { type: String, required: true },
    File: { type: String, required: true },
});

export const ImageData = mongoose.model('Image', ImageSchema);
const ReelSchema = new mongoose.Schema({
    ReelName: { type: String, required: true },
    File: { type: String, required: true },
});

export const ReelData = mongoose.model('reel', ReelSchema);

const adminSchema = new mongoose.Schema({
    Email: { type: String, required: true },
    Password: { type: String, required: true },
    otp:{type:String},
    otpExpiry: {type:String}
});

export const adminData = mongoose.model('admin', adminSchema);