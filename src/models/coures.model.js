import mongoose, { Schema } from "mongoose";

/*
make schema based on role of user 
[instructor,title,  thumbnail ,  description ]
using validator insure role is instructor
*/

const courseSchema = new Schema(
  {
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (value) {
          const user = mongoose.model("User").findById(value);
          return user && user.role === "Instructor";
        },
        message: "Role must be Instructor to upload course",
      },
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const Course = mongoose.model("Course", courseSchema);
