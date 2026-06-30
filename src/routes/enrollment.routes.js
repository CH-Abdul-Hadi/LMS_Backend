import { Router } from "express";
import {
  enroll,
  getMyEnrollments,
  getEnrollmentsByCourse,
  unenroll,
  updateProgress,
} from "../controllers/enrollment.controller.js";
import { verifyJWT, verifyPermission } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(verifyPermission(["Student"]), enroll);

router.route("/my").get(verifyPermission(["Student"]), getMyEnrollments);

router.route("/progress").patch(verifyPermission(["Student"]), updateProgress);

router
  .route("/course/:courseId")
  .get(verifyPermission(["Instructor"]), getEnrollmentsByCourse);

router.route("/:courseId").delete(verifyPermission(["Student"]), unenroll);

export default router;
