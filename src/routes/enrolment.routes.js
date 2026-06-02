import { Router } from "express";
import {
  enroll,
  getMyEnrollments,
  getEnrollmentsByCourse,
  unenroll,
  updateProgress,
} from "../controllers/enrolment.controller.js";
import { verifyJWT, verifyPermission } from "../middlewares/auth.middleware.js";

const router = Router();

// All enrollment routes require authentication
router.use(verifyJWT);

// Student: enroll in a course
router.route("/").post(verifyPermission(["Student"]), enroll);

// Student: view all their enrolled courses
router.route("/my").get(verifyPermission(["Student"]), getMyEnrollments);

// Student: mark a lesson as completed / update progress
router.route("/progress").patch(verifyPermission(["Student"]), updateProgress);

// Student: unenroll from a course
router.route("/:courseId").delete(verifyPermission(["Student"]), unenroll);

// Instructor: view all students enrolled in one of their courses
router
  .route("/course/:courseId")
  .get(verifyPermission(["Instructor"]), getEnrollmentsByCourse);

export default router;
