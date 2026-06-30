import { ApiResponse } from "../Utils/ApiResponse.js";
import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { Course } from "../models/course.model.js";
import { Lesson } from "../models/lesson.model.js";
import { uploadToCloudinary } from "../configs/cloudinary.config.js";

/*
cerate 
getAll
getSingle
update
enable&disable
*/

/*
createCourse
check fields
check if same course exist
make imageUrl
create course
*/
const createCourse = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "All fields are required");
  }

  const existingCourse = await Course.findOne({
    $or: [{ title }],
  });

  if (existingCourse)
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Product already exists"));

  let thumbnailURL = "";

  if (req?.file?.buffer) {
    try {
      const result = await uploadToCloudinary(req.file.buffer);
      thumbnailURL = result.secure_url;
    } catch (error) {
      return res
        .status(500)
        .json(
          new ApiResponse(
            500,
            null,
            error.message || "Error while uploading course Thumbnail",
          ),
        );
    }
  }

  const course = await Course.create({
    title,
    description,
    thumbnail: thumbnailURL,
    instructor: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, course, "New course successfully created"));
});

/*
getAllCourse
if status is true 
query to search through name
trough search
*/

const getAllCourse = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  let query = {};

  if (status) {
    query.status = status === "true";
  }

  if (search) {
    query.title = {
      $regex: search,
      $options: "i",
    };
  }

  const courses = await Course.find(query).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, courses, "Course successfully fetched"));
});

/*
get id 
see if id present 
return
*/
const getCourseById = asyncHandler(async (req, res) => {
  
  const courseId = req.params.id;

  const course = await Course.findById(courseId);

  if (!course) {
    return res.status(404).json(new ApiResponse(404, null, "Course not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, course, "Course Successfully fetched"));
});

/*
updateCourse
get id
see if id present
take new values 
update
*/
const updateCourse = asyncHandler(async (req, res) => {
  const courseId = req.params.id;

  const course = await Course.findById(courseId);

  if (!course) {
    return res.status(404).json(new ApiResponse(404, null, "Course not found"));
  }

  const updatedCourse = await Course.findByIdAndUpdate(courseId, req.body, {
    new: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCourse, "course successfully update"));
});

const toggleCourseStatus = asyncHandler(async (req, res) => {
  
  const id  = req.params.id;

  const course = await Course.findById(id);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (String(course.instructor) !== String(req.user._id)) {
    throw new ApiError(403, "You are not authorized to modify this course");
  }

  course.status = !course.status;

  await course.save();

  const action = course.status ? "enabled" : "disabled";

  return res
    .status(200)
    .json(new ApiResponse(200, course, `Course ${action} successfully`));
});

/*
  getMyCourses
  - instructor fetches only the courses they created
  - supports ?search= and ?status= query params
*/
const getMyCourses = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const query = { instructor: req.user._id };

  if (status !== undefined) {
    query.status = status === "true";
  }

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  const courses = await Course.find(query)
    .populate("lectures", "title lectureNo duration status")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, courses, "Your courses fetched successfully"));
});

/*
  deleteCourse
  - only the instructor who created it can delete
  - hard-deletes the document (use toggleCourseStatus for soft disable)
*/

const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (String(course.instructor) !== String(req.user._id)) {
    throw new ApiError(403, "You are not authorized to delete this course");
  }

  // Delete all lessons belonging to this course
  await Lesson.deleteMany({ course_id: id });

  await Course.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Course and its lessons deleted successfully"));
});

export {
  createCourse,
  getAllCourse,
  getCourseById,
  updateCourse,
  toggleCourseStatus,
  getMyCourses,
  deleteCourse,
};
