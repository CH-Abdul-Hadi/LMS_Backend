import multer from "multer";
import { Router } from "express";
import {
  cerateLesson,
  getLessonByCourse,
  updateLesson,
  toggleLessonStatus,
} from "../controllers/Lesson.controller.js";
import { ApiError } from "../Utils/ApiError.js";
import { verifyJWT, verifyPermission } from "../middlewares/auth.middleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: 50 * 1024 * 1024,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "video") {
      if (!file.mimetype.startsWith("video/")) {
        return cb(new ApiError(400, "Upload a valid video file"), false);
      }
    } else if (file.fieldname === "thumbnail") {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new ApiError(400, "Upload a valid image file"), false);
      }
    }
    cb(null, true);
  },
});

const router = Router()

router.route("/").get(
    verifyJWT,
    verifyPermission(["Instructor", "Student"]),
    getLessonByCourse,
  ).post(
    verifyJWT,
    verifyPermission(["Instructor"]),
    upload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    cerateLesson,
  );


router.route("/:id").patch(
  verifyJWT,
  verifyPermission(["Instructor"]),
  updateLesson,
);

router.route("toggle-status/:id").patch(toggleLessonStatus);

export default router

