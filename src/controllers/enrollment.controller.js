import { ApiResponse } from "../Utils/ApiResponse.js";
import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { Enrollment } from "../models/enrollment.model.js";
import { Course } from "../models/course.model.js";

/*
  enroll                  — student enrolls in a course
  getMyEnrollments        — student fetches all their enrolled courses
  getEnrollmentsByCourse  — instructor sees all students enrolled in a course
  unenroll                — student removes themselves from a course
*/

/*
  enroll
  - verify course exists
  - check student is not already enrolled (findOne, NOT findById)
  - create enrollment record
*/
const enroll = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const studentId = req.user._id;

  if (!courseId) {
    throw new ApiError(400, "courseId is required");
  }

  const existingCourse = await Course.findById(courseId);
  if (!existingCourse) {
    throw new ApiError(404, "Course does not exist");
  }

  // Bug fix: was findById({...}) — must use findOne for compound query
  const existingEnrollment = await Enrollment.findOne({
    student_id: studentId,
    course_id: courseId,
  });

  if (existingEnrollment) {
    throw new ApiError(409, "You are already enrolled in this course");
  }

  const enrolled = await Enrollment.create({
    student_id: studentId,
    course_id: courseId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, enrolled, "Enrolled successfully"));
});

/*
  getMyEnrollments
  - return all courses the logged-in student is enrolled in
  - populate course title, thumbnail, instructor
*/
const getMyEnrollments = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const enrollments = await Enrollment.find({ student_id: studentId })
    .populate({
      path: "course_id",
      select: "title description thumbnail instructor status",
      populate: { path: "instructor", select: "userName email" },
    })
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, enrollments, "Enrollments fetched successfully")
    );
});

/*
  getEnrollmentsByCourse
  - instructor fetches all students enrolled in one of their courses
  - verifies the requesting user is the course instructor
*/
const getEnrollmentsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Only the course instructor can see its enrollments
  if (String(course.instructor) !== String(req.user._id)) {
    throw new ApiError(403, "Access denied — you do not own this course");
  }

  const enrollments = await Enrollment.find({ course_id: courseId })
    .populate("student_id", "userName email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        enrollments,
        "Course enrollments fetched successfully"
      )
    );
});

/*
  unenroll
  - student removes themselves from a course
  - cannot unenroll from a course they're not in
*/
const unenroll = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user._id;

  const enrollment = await Enrollment.findOne({
    student_id: studentId,
    course_id: courseId,
  });

  if (!enrollment) {
    throw new ApiError(404, "You are not enrolled in this course");
  }

  await Enrollment.findByIdAndDelete(enrollment._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Unenrolled successfully"));
});

/*
  updateProgress
  - student marks a lesson as completed
  - prevents duplicates via $addToSet
  - auto-calculates progress % from total lessons in the course
*/
const updateProgress = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.body;
  const studentId = req.user._id;

  if (!courseId || !lessonId) {
    throw new ApiError(400, "courseId and lessonId are required");
  }

  const enrollment = await Enrollment.findOne({
    student_id: studentId,
    course_id: courseId,
  });

  if (!enrollment) {
    throw new ApiError(404, "You are not enrolled in this course");
  }

  // Add lesson only if not already completed
  const alreadyDone = enrollment.completedLessons.some(
    (id) => String(id) === String(lessonId)
  );

  if (!alreadyDone) {
    enrollment.completedLessons.push(lessonId);
  }

  // Recalculate % from the course's lecture count
  const course = await Course.findById(courseId).select("lectures");
  const totalLessons = course?.lectures?.length || 0;

  enrollment.progress =
    totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;

  await enrollment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, enrollment, "Progress updated successfully"));
});

export { enroll, getMyEnrollments, getEnrollmentsByCourse, unenroll, updateProgress };
