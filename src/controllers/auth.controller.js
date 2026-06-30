import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { User } from "../models/users.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import sentEmail from "../Utils/email.js";

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

  if (existingUser) {
    throw new ApiError(409, "Username or email already exists");
  }

  const user = await User.create({
    userName: userName,
    email,
    password,
    role,
  });

  try {
    await sentEmail({
      to: email,
      subject: `Thanks for registering to lms`,
      text: "We welcome you to our lms",
    });
  } catch (error) {
    console.error("error while sending email: ", error);
  }

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
    throw new ApiError(400, "Username or Email required");
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

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const cookieOptions = {
    httpOnly: true,
    sameSite: "strict",
    // secure: true,  // Uncomment in production (requires HTTPS)
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
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

  const cookieOptions = {
    httpOnly: true,
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logout Successful"));
});

/*
refreshToken
check if refreshToken is valid
check if token is expired or not
check is token matches the user token
*/

const refreshAccessToken = asyncHandler(async (req, res) => {
  const inComingToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!inComingToken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      inComingToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken._id).select("+refreshToken");

    if (!user) {
      throw new ApiError(401, "invalid token");
    }

    const matchStatus =
      String(inComingToken).trim() === String(user?.refreshToken).trim();

    if (!matchStatus) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const { accessToken, refreshToken } = await generateAccessToken(user._id);

    const cookieOptions = {
      httpOnly: true,
      sameSite: "strict",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "failed to refresh token");
  }
});

/*
  forgotPassword
  - generate a secure random token (32 bytes)
  - store its SHA-256 hash + expiry (15 min) on the user document
  - email the raw token to the user as a reset link
*/
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  // Always return 200 to prevent user enumeration
  if (!user) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "If that email exists, a reset link has been sent"));
  }

  // Generate raw token — sent to user
  const rawToken = crypto.randomBytes(32).toString("hex");

  // Store only the hash in the DB
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${rawToken}`;

  try {
    await sentEmail({
      to: user.email,
      subject: "LMS — Password Reset Request",
      text: `You requested a password reset. Click the link below (valid for 15 minutes):\n\n${resetURL}\n\nIf you did not request this, ignore this email.`,
      html: `<p>You requested a password reset.</p><p><a href="${resetURL}">Reset my password</a> (valid for 15 minutes)</p><p>If you did not request this, ignore this email.</p>`,
    });
  } catch {
    // Roll back token if email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, "Failed to send reset email. Please try again.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "If that email exists, a reset link has been sent"));
});

/*
  resetPassword
  - receive raw token from the URL
  - hash it and compare with the stored hash
  - check expiry
  - set new password, clear token fields
*/
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ApiError(400, "Token and new password are required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successful. You can now log in."));
});

export {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
};
