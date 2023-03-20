import mongoose from "mongoose";

const { Schema, model } = mongoose;

const taskSchema = new Schema(
  {
    title: { type: "string", required: true },
    group: { type: "string", required: true },
  },

  { timestamps: true }
);

export default model("Task", taskSchema);
