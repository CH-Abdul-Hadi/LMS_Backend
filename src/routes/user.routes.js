import multer from "multer";
import { Router } from "express";
import {
  getCurrentUser,
  updateProfile,
  changePassword,
  updateAvatar,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { ApiError } from "../Utils/ApiError.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: 5 * 1024 * 1024,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new ApiError(400, "Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

// All user routes require authentication
router.use(verifyJWT);

router.route("/me").get(getCurrentUser);
router.route("/update-profile").patch(updateProfile);
router.route("/change-password").patch(changePassword);
router.route("/update-avatar").patch(upload.single("avatar"), updateAvatar);

export default router;
