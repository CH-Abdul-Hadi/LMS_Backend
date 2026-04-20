import { ApiResponse } from "../Utils/ApiResponse.js";
import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { Course } from "../models/course.model.js";
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

  if (!title && !description) {
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
      thumbnailURL = result;
    } catch (error) {
      return res
        .status(500)
        .json(
          500,
          null,
          error.message || "Error while uploading course Thumbnail",
        );
    }

    const course = await Course.create({
      title,
      description,
      thumbnail: thumbnailURL,
      instructor: req.body?.user._id,
    });

    return res.status(200).json(200, course, "New course successfully created");
  }
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
  const courseId = req.params._id;

  const course = await Course.findById(courseId);

  if (!course) {
    return res.status(400).json(new ApiError(400, "Course not found"));
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
  const courseId = req.params._id;

  const course = await Course.findById(courseId);

  if (!course) {
    return res.status(400).json(new ApiError(400, "Course not found"));
  }

  const updatedCourse = await Course.findByIdAndUpdate(courseId, req.body, {
    new: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCourse, "course successfully update"));
});

const toggleCourseStatus = asyncHandler(async (req, res) => {
  const { _id } = req.params;

  const course = await Course.findById(_id);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  course.status = !course.status;

  await course.save();

  const action = course.status ? "enabled" : "disabled";

  return res
    .status(200)
    .json(new ApiResponse(200, course, `Course ${action} successfully`));
});

export {
  createCourse,
  getAllCourse,
  getCourseById,
  updateCourse,
  toggleCourseStatus,
};
