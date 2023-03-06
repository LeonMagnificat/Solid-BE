import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    firstName: { type: "string", required: true },
    lastName: { type: "string", required: true },
    email: { type: "string", required: true },
    password: { type: "string", required: true },
    role: { type: "string", enum: ["Member", "Admin"], required: true },
    contribution: [{ type: Schema.Types.ObjectId, ref: "contribution" }],
  },

  { timestamps: true }
);

export default model("user", userSchema);
