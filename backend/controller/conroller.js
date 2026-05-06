import nodemailer from "nodemailer";
import { adminData, ImageData, ReelData } from "../model/Schema.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt"





// IMAGE
export const addImage = async (req, res) => {
  try {
    const { ImageName } = req.body;

    if (!ImageName || !req.file) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    const image = await ImageData.create({
      ImageName,
      File: req.file.filename,
    });

    res.status(200).json({
      message: "Image Upload Success",
      data: image,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// REEL (VIDEO)
export const addReel = async (req, res) => {
  try {
    const { ReelName } = req.body;

    if (!ReelName || !req.file) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    const reel = await ReelData.create({
      ReelName,
      File: req.file.filename,
    });

    res.status(200).json({
      message: "Reel Upload Success",
      data: reel,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Login

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    const user = await adminData.findOne({ Email: email });

    if (!user) {
      return res.json({ message: "Email not found" });
    }

    // ✅ check password
    const isMatch = await bcrypt.compare(password, user.Password);

    if (!isMatch) {
      return res.json({ message: "Wrong password" });
    }

    // 🔐 ✅ ADD TOKEN HERE
    const token = jwt.sign(
      { id: user._id, email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ send token to frontend
    res.status(200).json({
      message: "Login Success",
      login: true,
      token: token,   // 🔥 VERY IMPORTANT
      data: user
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};


// OTP to sent


export const sendOTP = async (req, res) => {
  const { email } = req.body;

  const user = await adminData.findOne({ Email: email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min
  await user.save();

  // Email config
  const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

  await transporter.sendMail({
    from: "shamil2k7g@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}`,
  });

  res.json({ message: "OTP sent to email" });
};

//OTP verify

export const verifyOTP = async (req, res) => {
  const { email, otp, password } = req.body;

  const user = await adminData.findOne({ Email: email });

  if (!user || user.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (user.otpExpiry < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  // ✅ hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  user.Password = hashedPassword;
  user.otp = null;
  user.otpExpiry = null;

  await user.save();

  res.json({ message: "Password updated successfully", login: true });
};

// get image list

export const getImage = async (req, res) => {
  try {
    const images = await ImageData.find()
    const videos = await ReelData.find()
    const admin = await adminData.find()
    res.json({ images: images, videos: videos ,admin:admin})
  } catch (error) {
    console.log("error on list image" + error)
  }
}

// delete



// DELETE IMAGE
export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await ImageData.findById(id);

    if (!image) {
      return res.status(404).json({
        message: "Image not found"
      });
    }

    const filePath = path.join("uploads", image.File);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await ImageData.findByIdAndDelete(id);

    res.json({
      message: "Image deleted successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Delete failed"
    });
  }
};

// DELETE VIDEO
export const deleteReel = async (req, res) => {
  try {
    const { id } = req.params;

    const reel = await ReelData.findById(id);

    if (!reel) {
      return res.status(404).json({
        message: "Video not found"
      });
    }

    const filePath = path.join("uploads", reel.File);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await ReelData.findByIdAndDelete(id);

    res.json({
      message: "Video deleted successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Delete failed"
    });
  }
};

// add new admin




export const addAdmin = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await adminData.findOne({ Email });
    if (existing) {
      return res.json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    await adminData.create({
      Email,
      Password: hashedPassword,
    });

    res.json({ message: "Admin created successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};