import mongoose from "mongoose";

const studyTaskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 1000 },
    dueDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    status: { type: String, enum: ["todo", "done"], default: "todo" },
    createdBy: { type: String, enum: ["user", "agent"], default: "user" },
  },
  { timestamps: true }
);

const StudyTask = mongoose.model("StudyTask", studyTaskSchema);

export default StudyTask;