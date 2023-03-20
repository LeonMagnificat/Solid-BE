import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    firstName: { type: "string", required: true },
    lastName: { type: "string", required: true },
    email: { type: "string", required: true },
    password: { type: "string", required: true },
    role: { type: "string", enum: ["Member", "Admin"], default: "Member" },
    total: { type: "number", required: true, default: 0, null: false },
    group: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  },

  { timestamps: true }
);

export default model("Member", userSchema);
