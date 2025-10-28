import {asyncHandler} from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {ApiError} from "../utils/Apierrors.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";


const registerUser=asyncHandler(async(req,res)=>{
    //get user data from frontend
    //check validation:not empty
    //check user is pre registrerd
    //check for imagesand avatars
    //upload them on cloudinary
    //create a user object-create a entry in db
    //remove password and refresh token field from response
    // check user creation
    //reaturn res

    const {fullname,username,email,password}=req.body;
    console.log(email)
    //validation
    // if(fullname===" "){
    //     throw new ApiError(400,"Fullname is required")

    // }
    if(
        [fullname,username,email,password].some((field)=>field?.trim()===" ")
    ){
       throw new ApiError(400,"All fields are required")
    }

    //check user existence

    const existedUser= User.findOne(
    {
        $or:[{username},{email}],
    
    })
    if(existedUser){
        throw new ApiError(409,"User already exists")
    }
    
       //check for imagesand avatars
     const avatarLocalPath= req.files?.avatar[0]?.path;
     const coverImageLocalPath= req.files?.coverimage[0]?.path;
     console.log(avatarLocalPath,coverImageLocalPath)


     if(!avatarLocalPath||!coverImageLocalPath){
        throw new ApiError(400,"Images are required")

     }

     //upload them on cloudinary
     const avatar=await uploadOnCloudinary(avatarLocalPath)
     const coverImage= await uploadOnCloudinary(coverImageLocalPath)
     if(!avatar){
        throw new ApiError(400,"Avatar upload failed")
     }
     if(!coverImage){
        throw new ApiError(400,"Cover image upload failed")
     }

     //create a user object-create a entry in db
      const user=await User.create({
        fullname,
        username,
        email,
        password,
        avatar:{
            avatar:avatar.url
        },
        coverImage:{
            coverImage:coverImage?.url||" "
        }
     })
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"User creation failed")

    }

    //reaturn res
    return res.status(201).json(
        new ApiResponse(200,"User created successfully",createdUser)

    )
}) 

export {registerUser} 