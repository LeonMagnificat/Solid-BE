import mongoose from "mongoose";
import bcrypt from "bcrypt";

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

userSchema.pre("save", async function (next) {
  const currentUser = this;
  if (currentUser.isModified("password")) {
    const plainPW = currentUser.password;
    const hashedPW = await bcrypt.hash(plainPW, 10);
    currentUser.password = hashedPW;
  }
  return next();
});

userSchema.methods.toJSON = function () {
  const userDocument = this;
  const userObject = userDocument.toObject();
  delete userObject.password;
  delete userObject.createdAt;
  delete userObject.updatedAt;
  delete userObject.__v;
  return userObject;
};

userSchema.static("checkCredentials", async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
});

export default model("Member", userSchema);
