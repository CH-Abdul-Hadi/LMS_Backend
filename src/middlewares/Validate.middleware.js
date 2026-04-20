import { validationResult } from "express-validator";
import { ApiResponse } from "../Utils/ApiResponse.js";
// Sequential processing, stops at first error
const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res
      .status(400)
      .json(new ApiResponse(400, null, errors.array()[0].msg));
  };
};

export { validate };
