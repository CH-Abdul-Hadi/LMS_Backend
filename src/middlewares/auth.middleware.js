import jwt from "jsonwebtoken";
import { User } from "../models/users.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken",
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const verifyPermission = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user?._id) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "unauth.jsorized request"));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(new ApiResponse(403, null, "Access Denied"));
    }

    next();
  });
};
