const mongoose = require("../connection");
const { nanoid } = require("nanoid");

const subtopicSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      unique: true,
      default: () => nanoid(10), // short, URL-safe unique id
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["data", "group", "not-decided"],
      default: "not-decided",
    },
    status: {
      type: String,
      enum: ["not_generated", "generated"],
      default: "not_generated",
    },
    meta: {
      level: Number,
      parentId: { type: mongoose.Schema.Types.ObjectId, ref: "subtopic", default: null },
      topicId: { type: mongoose.Schema.Types.ObjectId, ref: "topic", default: null },
      context: String,
      generationGoal: String,
      experienceLevel: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
      },
      timelinePortion: Number,
      additionalHints: Object,
    },
    data: {
      type: String,
      default: null,
    },
    children: {
      type: [
        {
          name: { type: String, required: true },
          subtopicId: { type: mongoose.Schema.Types.ObjectId, ref: "subtopic", required: true },
          publicId : {type : String , required : true }
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const Subtopic = mongoose.model("subtopic", subtopicSchema);
module.exports = Subtopic;
