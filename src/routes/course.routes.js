import multer from "multer";
import { Router } from "express";
import {
  createCourse,
  getAllCourse,
  getCourseById,
  updateCourse,
  toggleCourseStatus,
} from "../controllers/course.controller.js";
import { ApiError } from "../Utils/ApiError.js";
import { verifyJWT, verifyPermission } from "../middlewares/auth.middleware.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: 5 * 1024 * 1024,
  fileFilter: (req, files, cb) => {
    if (!files.mimetype.startsWith("image/")) {
      return cb(new ApiError(400, "only image files are allowed"), false);
    }
    cb(null, true);
  },
});

router
  .route("/")
  .get(verifyJWT, verifyPermission(["Instructor", "Student"]), getAllCourse)
  .post(
    verifyJWT,
    verifyPermission(["Instructor"]),
    upload.single("thumbnail"),
    createCourse,
  );

router
  .route("/:id")
  .get(verifyJWT, verifyPermission(["Instructor", "Student"]), getCourseById)
  .patch(verifyJWT, verifyPermission(["Instructor"]), updateCourse);

router.route("/toggle-status/:id").patch(toggleCourseStatus);

export default router
