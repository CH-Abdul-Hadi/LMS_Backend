import mongoose, { Schema } from "mongoose";

/*
make enrollment Schema [course_id, student_id, progress]
using validator to see if role is student
*/

const enrollmentSchema = new Schema(
  {
    Student_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (value) {
          const student = mongoose.model("User").findById(value);
          return student && student.role === "Student";
        },
        message: "You must be student to take Lesson",
      },
    },
    Course_id: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    
  },
  { timestamps: true },
);

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
