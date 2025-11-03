const mongoose = require("../connection");

const topicSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      default: "",
    },
    numDays: {
      type: Number,
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    progressStatus: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subtopicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subtopic",
      unique: true, // ensures one-to-one
      default: null,
    },
  },
  { timestamps: true }
);

const Topic = mongoose.model("topic", topicSchema);
module.exports = Topic;
