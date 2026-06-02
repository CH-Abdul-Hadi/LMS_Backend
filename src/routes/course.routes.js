import multer from "multer";
import { Router } from "express";
import {
  createCourse,
  getAllCourse,
  getCourseById,
  updateCourse,
  toggleCourseStatus,
  getMyCourses,
  deleteCourse,
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

// Instructor: fetch only their own courses
router
  .route("/my")
  .get(verifyJWT, verifyPermission(["Instructor"]), getMyCourses);

router
  .route("/:id")
  .get(verifyJWT, verifyPermission(["Instructor", "Student"]), getCourseById)
  .patch(verifyJWT, verifyPermission(["Instructor"]), updateCourse)
  .delete(verifyJWT, verifyPermission(["Instructor"]), deleteCourse);

router
  .route("/toggle-status/:id")
  .patch(verifyJWT, verifyPermission(["Instructor"]), toggleCourseStatus);

export default router;
