import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.post("/login", loginUser)
router.post("/signup", registerUser)
router.post("/logout", verifyJWT, logoutUser)
router.post("/refresh-token", verifyJWT, refreshAccessToken)

export default router
