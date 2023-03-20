import mongoose from "mongoose";

const { Schema, model } = mongoose;

const contributionSchema = new Schema(
  {
    user: { type: "string", required: true },
    group: { type: "string", required: true },
    amount: { type: "number", required: true, default: 0, null: false },
  },

  { timestamps: true }
);

export default model("Contribution", contributionSchema);
