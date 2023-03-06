import mongoose from "mongoose";

const { Schema, model } = mongoose;

const groupSchema = new Schema(
  {
    name: { type: "string", required: true },
    currency: { type: "string", enum: ["USD", "EUR"], required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "user" }],
    total: { type: "number", required: true, default: 0, null: false },
    invitation: { type: "string", required: false },
  },

  { timestamps: true }
);

export default model("Group", groupSchema);
