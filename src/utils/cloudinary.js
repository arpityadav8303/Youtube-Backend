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
    
    // ✅ DELETE FILE AFTER SUCCESSFUL UPLOAD
    fs.unlinkSync(localFilePath);
    
    return response;
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
    
    // ✅ CLEANUP WITH ERROR HANDLING
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
        console.log("✅ Temp file deleted after failure");
      } catch (unlinkError) {
        console.log("⚠️ Could not delete temp file:", unlinkError.message);
      }
    }
    
    return null;
  }
};

export { uploadOnCloudinary };