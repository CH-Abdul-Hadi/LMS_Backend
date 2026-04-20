import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/login").get(loginUser);
router.route("/logout").get(logoutUser);
router.route("/signup").get(registerUser);
router.route("refresh-token").get(refreshAccessToken);

export default router
