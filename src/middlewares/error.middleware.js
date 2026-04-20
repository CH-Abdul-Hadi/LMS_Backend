import { ApiResponse } from "../Utils/ApiResponse.js";
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  if (err.name === "CastError") {
    message = `Resource not found. Invalid: ${err.path}`;
    statusCode = 404;
  }

  if (err.code === 11000) {
    message = ` Duplicate field value entered:${Object.keys(err.keyValue)}`;
    statusCode = 400;
  }

  if (err.name === "JsonWebTokenError") {
    message = "JSON Web Token is invalid. Try again!!!";
    statusCode = 400;
  }

  if (err.name === "TokenExpiredError") {
    message = "JSON Web Token is expired. Try again!!!";
    statusCode = 400;
  }

  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, null, message));
};

export { errorHandler };
