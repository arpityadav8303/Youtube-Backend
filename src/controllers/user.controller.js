import {asyncHandler} from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {ApiError} from "../utils/Apierrors.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessTokenandRefreshToken= async(userId)=>
{
    try{
        const user=await User.findById(userId);
        if(!user){
            throw new ApiError(404,"User not found")
        }
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        
        user.refreshToken=refreshToken;
        await user.save({
            validateBeforeSave:false,
        });
        return {
            accessToken,
            refreshToken,
        }
        
    }
    catch(error){
          throw new ApiError(500,"something went wong while generating tokens")

    }
}

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
        [fullname,username,email,password].some((field)=>field?.trim()==="")
    )
    {
       throw new ApiError(400,"All fields are required")
    }

    //check user existence

    const existedUser= await User.findOne(
    {
        $or:[{username},{email}],
    
    })
    if(existedUser){
        throw new ApiError(409,"User already exists")
    }
    console.log(req.files);
    
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
        avatar: avatar.url,
        coverimage: coverImage?.url || ""
     })
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"User creation failed")

    }

    //return res
    return res.status(201).json(
        new ApiResponse(201,"User created successfully",createdUser)

    )
}) 

const loginUser=asyncHandler(async(req,res)=>{
    //get user data from frontend
    //username or email is in db
    //find user
    //password check
    //generate access token and refresh token
    //send cookie 

    const {username,email,password}=req.body;
    if(!(username || email )){
        throw new ApiError(400,"Username or email is required")
        }
   
    const user= await User.findOne(
        {
            $or:[{username},{email}]
        }
    )
    if(!user){
        throw new ApiError(404,"User not found")
    }
    
    //password check
   const isPasswordValid= await user.isPasswordCorrect(password)
   if(!isPasswordValid){
    throw new ApiError(401,"Invalid credentials")
   }
   
    // access token refresh token
    const {accessToken,refreshToken}=await generateAccessTokenandRefreshToken(user._id)
    
    const loggedinUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )



     //send cookie
     const options={
        httpOnly:true,
        secure:true,
        sameSite:"none",
     }
     return res.status(200)
     .cookie("refreshToken",refreshToken,options)
     .cookie("accessToken",accessToken,options)
     .json(
        new ApiResponse(200,
            {
              user:
                loggedinUser,
                accessToken,
                refreshToken,
            },"User logged in successfully",loggedinUser)
     )

    

})

const logOutUser=asyncHandler(async(req,res)=>{
   await  User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined,
            },
        },
         {new:true},
    )
    const options={
        httpOnly:true,
        secure:true,
        sameSite:"none",
    }
   return res.status(200)
   .clearCookie("refreshToken",options)
   .clearCookie("accessToken",options)
   .json(new ApiResponse(200,"User logged out successfully"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(400,"Refresh token is required")
    }
    try{
   const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
   const user= User.findById(decodedToken?._id)
   if(!user){
    throw new ApiError(404,"User not found")
   }
   if(incomingRefreshToken!==user.refreshToken){
    throw new ApiError(401,"Invalid refresh token")
   }
   const options={
    httpOnly:true,
    secure:true,
    sameSite:"none",
}
   const {accessToken,newrefreshToken}=await generateAccessTokenandRefreshToken(user._id)
   return res.status(200)
   .cookies("refreshToken",newrefreshToken,options)
   .cookies("accessToken",accessToken,options)
   .json(new ApiResponse(200,{
    accessToken,
    refreshToken:newrefreshToken,
    
   }))
}catch(error){
    throw new ApiError(401,"Invalid refresh token")
}

})
export {registerUser,loginUser,logOutUser,refreshAccessToken} 