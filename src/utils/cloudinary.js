import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("✅ File uploaded successfully:", response.url);
    return response;
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
    fs.unlinkSync(localFilePath); // optional: cleanup local file
    return null;
  }
};

export { uploadOnCloudinary };