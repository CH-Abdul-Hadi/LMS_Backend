import { ApiResponse } from "../Utils/ApiResponse.js";
import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { Course } from "../models/course.model.js";
import { Lesson } from "../models/lesson.model.js";
import { uploadToCloudinary } from "../configs/cloudinary.config.js";

/*
cerate 
getAll
update
enable
disable
*/

const cerateLesson = asyncHandler(async (req, res) => {
  const { course_id, lectureNo, title, content_url, thumbnail, duration } =
    req.body;

  if (!title || !course_id || !lectureNo || !duration) {
    throw new ApiError(400, "All fields required");
  }

  const courseExist = await Course.findById(course_id);

  if (!courseExist) {
    throw new ApiError(400, "Course not found");
  }

  let thumbnailUrl = "";
  let videoUrl = "";

  if (req.files?.thumbnail?.[0]) {
    try {
      const thumbResult = await uploadToCloudinary(
        req.files.thumbnail[0].buffer,
      );
      thumbnailUrl = thumbResult.secure_url;
    } catch (error) {
      throw new ApiError(
        400,
        error.message || "Error while uploading thumbnail",
      );
    }
  }

  if (req.files?.video?.[0]) {
    try {
      const videoResult = await uploadToCloudinary(req.files.video[0].buffer);
      videoUrl = videoResult.secure_url;
    } catch (error) {
      throw new ApiError(400, error.message || "Error while uploading lecture");
    }
  }

  const lesson = await Lesson.create({
    course_id,
    title,
    lectureNo,
    duration,
    content_url: videoUrl,
    thumbnail: thumbnailUrl,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, lesson, "lesson uploaded successfully"));
});

const getLessonByCourse = asyncHandler(async (req, res) => {
  const { course_id } = req.body;

  const lesson = await Lesson.find({ course_id: course_id }).sort("order");

  if (!lesson) {
    throw new ApiError(400, "lesson not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, lesson, "lesson successfully found"));
});

const updateLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params._id;

  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    throw new ApiError(400, "lesson not found");
  }

  const updatedLesson = await Lesson.findByIdAndUpdate(lessonId, req.body, {
    new: true,
  });

  return res
    .status(200)
    .json(
      200,
      new ApiResponse(200, updatedLesson, "lesson successfully updated"),
    );
});

const toggleLessonStatus = asyncHandler(async (req, res) => {
  const { _id } = req.params;

  const lesson = await Lesson.findById(_id);

  if (!lesson) {
    throw new ApiError(404, "Lesson not found");
  }

  lesson.status = !lesson.status;
  await lesson.save();

  const stateMessage = lesson.status ? "enabled" : "disabled";

  return res
    .status(200)
    .json(new ApiResponse(200, lesson, `Lesson ${stateMessage} successfully`));
});

export { cerateLesson, getLessonByCourse, updateLesson, toggleLessonStatus };
