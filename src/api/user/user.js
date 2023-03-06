import express from "express";
import UserModel from "./model.js";
import bcrypt from "bcrypt";
import { createAccessToken } from "../../library/Auth/tokenTools.js";

const userRouter = express.Router();

userRouter.post("/register", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    //if user exist
    if (user) {
      return res.status(400).send({ message: "User already exists" });
    }
    //if user do not exist, create one
    const newUser = new UserModel(req.body);

    //Hash password before saving it
    const hashedPassword = await bcrypt.hash(password, 11);
    newUser.password = hashedPassword;
    await newUser.save();

    //create token

    const payload = { _id: newUser._id, role: newUser.role };
    const accessToken = await createAccessToken(payload);

    res.status(200).send({ user: newUser, accessToken });
  } catch (error) {
    next(error);
  }
});

userRouter.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    //check if the user exists
    const user = await UserModel.findOne({ email: email });
    if (!user) res.status(400).send({ message: "Invalid Email or Password!" });

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) res.status(400).send({ message: "Invalid Email or Password!" });
    const payload = { _id: user._id, role: user.role };
    const accessToken = await createAccessToken(payload);

    res.status(200).send({ message: "Logged In successfully", user: user, accessToken });
  } catch (error) {
    next(error);
  }
});

export default userRouter;
