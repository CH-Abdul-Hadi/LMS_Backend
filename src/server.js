import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./configs/db.config.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import lessonRouter from "./routes/lesson.routes.js";
import courseRouter from "./routes/course.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 3000;

connectDB();

const corsOriginEnv = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (!corsOriginEnv || corsOriginEnv === "*") {
        return callback(null, origin);
      }

      const allowed = corsOriginEnv.split(",").map((o) => o.trim());
      return callback(null, allowed.includes(origin) ? origin : false);
    },
    credentials: true,
  }),
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/lesson", lessonRouter);
app.use("/api/v1/course", courseRouter);

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.send("<h1>LMS Backend </h1>");
});

export default app;
