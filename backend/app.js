  import express from "express";
  import cors from "cors";
  import multer from "multer";
  import mongoose from "mongoose";
  import fs from "fs";
  import { addAdmin, addImage, addReel, deleteImage, deleteReel, getImage, Login, sendOTP, verifyOTP } from "./controller/conroller.js";
  import { authMiddleware } from "./middleware/authMiddleware.js";
  import dotenv from "dotenv";
  
const app = express();

  dotenv.config();

  // DB
  mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));



  // Create uploads folder
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
  }

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static
  app.use("/uploads", express.static("uploads"));

  // Multer
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) =>
      cb(null, Date.now() + "-" + file.originalname),
  });

  const upload = multer({ storage });

  // Routes
  app.post("/addimage",authMiddleware, upload.single("file"), addImage);
  app.post("/addreel",authMiddleware, upload.single("file"), addReel);
  app.post("/addadmin", authMiddleware, addAdmin);
  app.post("/login",Login)
  app.get("/getlist",getImage)

  // delete
  app.delete("/delete-image/:id", authMiddleware, deleteImage);
  app.delete("/delete-reel/:id", authMiddleware, deleteReel);
  // otp

  app.post("/send-otp", sendOTP);
  app.post("/verify-otp", verifyOTP);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });