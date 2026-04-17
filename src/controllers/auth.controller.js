import { ApiResponse } from "../Utils/ApiResponse.js";
import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { User } from "../models/users.model.js";
import jwt from "jsonwebtoken";

/*
generate access token
refresh access token
register user for new signin 
login to check if user exists
logout user
*/

const generateAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating Access or refresh token",
    );
  }
};

/*
registerUser
take data from body
check if user exists 
create user
check if user created 
*/
const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, role, password } = req.body;

  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!existingUser) {
    throw new ApiError(409, "Username or email already exists");
  }

  const user = await User.create({
    username: userName.toLowerCase(),
    email,
    role,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while creating new user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "user successfully created"));
});

/*
loginUser
check if user or email given
check if user/email exists
check if password is correct
give access token to user
remove password and tokens from api
send response 
*/

const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if (!userName && !email) {
    throw new ApiError(400, "Username And Email required");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(400, "user does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessToken(user._id);

  const loggedInUser = await user
    .findOne(user._id)
    .select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "login Successfully",
      ),
    );
});

/*
logoutUser
find and update refreshToken 
*/

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true },
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logout Successful"));
});

/*
refreshToken
check if refreshToken is valid
check if token is expired or not
check is token matches the user token
*/

const refreshAccessToken = asyncHandler(async (req, res) => {
  const inComingToken = req.cookie.refreshToken || req.body.refreshToken;

  if (!inComingToken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      inComingToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "invalid token");
    }

    if (inComingToken !== user?.refreshToken) {
      throw new ApiError(401, "Token is expired login again");
    }

    const { accessToken, refreshToken } = await generateAccessToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(200, { accessToken, refreshToken }, "Access token refreshed");
  } catch (error) {
    throw new ApiError(401, error?.message || "failed to refresh token");
  }
});

export { loginUser, logoutUser, registerUser, refreshAccessToken };
