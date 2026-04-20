import mongoose, { Schema } from "mongoose";

/*
make lesson scheme [course_id, title, content_url, thumbnail, duration]
*/

const lessonSchema = new Schema(
  {
    course_id: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lectureNo: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content_url: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    duration: {
      type: Number,
    },
    status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Lesson = mongoose.model("Lesson", lessonSchema);
