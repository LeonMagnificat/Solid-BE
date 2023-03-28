import mongoose from "mongoose";

const { Schema, model } = mongoose;

const groupSchema = new Schema(
  {
    name: { type: "string", required: true },
    currency: { type: "string", enum: ["USD", "EUR", "PLN"], required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    contribution: [{ type: Schema.Types.ObjectId, ref: "Contribution" }],
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    admins: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    total: { type: "number", required: true, default: 0, null: false },
  },

  { timestamps: true }
);

export default model("Group", groupSchema);
