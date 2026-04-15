import connectDB from "./configs/db.config.js";
import express from "express";
import dotenv from "dotenv";

const app = express();
dotenv.config();
app.use(express.json());

const port = process.env.PORT || 3000;

connectDB();

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.send("<h1>LMS Backend </h1>");
});

export default app;
