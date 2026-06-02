import mongoose, { Schema } from "mongoose";

/*
make enrollment Schema [course_id, student_id, progress]
using validator to see if role is student
*/

const enrollmentSchema = new Schema(
  {
    student_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (value) {
          const student = await mongoose.model("User").findById(value);
          return student && student.role === "Student";
        },
        message: "You must be student to take Lesson",
      },
    },
    course_id: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedLessons: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
  },
  { timestamps: true },
);

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
