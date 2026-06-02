import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { ApiError } from "../Utils/ApiError.js";
import { User } from "../models/users.model.js";
import { uploadToCloudinary } from "../configs/cloudinary.config.js";

/*
  getCurrentUser  — return the logged-in user's profile
  updateProfile   — update userName / email
  changePassword  — verify old password then set new one
  updateAvatar    — upload a new profile picture to Cloudinary
*/

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

/*
  updateProfile
  - accept userName and/or email from body
  - check for conflicts with other users
  - update and return the cleaned user object
*/
const updateProfile = asyncHandler(async (req, res) => {
  const { userName, email } = req.body;

  if (!userName && !email) {
    throw new ApiError(400, "Provide at least one field to update");
  }

  // Check uniqueness against other users
  if (userName || email) {
    const conflict = await User.findOne({
      _id: { $ne: req.user._id },
      $or: [
        ...(userName ? [{ userName }] : []),
        ...(email ? [{ email }] : []),
      ],
    });

    if (conflict) {
      throw new ApiError(409, "Username or email is already taken");
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        ...(userName && { userName }),
        ...(email && { email }),
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

/*
  changePassword
  - verify old password with bcrypt
  - hash and save the new password
*/
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  if (oldPassword === newPassword) {
    throw new ApiError(400, "New password must differ from old password");
  }

  // Need the password field which is excluded by default via verifyJWT
  const user = await User.findById(req.user._id).select("+password");

  const isValid = await user.isPasswordCorrect(oldPassword);
  if (!isValid) {
    throw new ApiError(401, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

/*
  updateAvatar
  - accept a single image file via multipart
  - upload to Cloudinary
  - save the secure URL on the user document
*/
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file?.buffer) {
    throw new ApiError(400, "Avatar image file is required");
  }

  let avatarUrl;
  try {
    const result = await uploadToCloudinary(req.file.buffer);
    avatarUrl = result.secure_url;
  } catch (error) {
    throw new ApiError(500, error.message || "Error uploading avatar");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { avatar: avatarUrl } },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});

export { getCurrentUser, updateProfile, changePassword, updateAvatar };
