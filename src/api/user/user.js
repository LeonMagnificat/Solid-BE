import express from "express";
import UserModel from "./model.js";
import GroupModel from "../group/model.js";
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

userRouter.post("/register/:groupId", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email: email });
    //if user exist
    if (user) {
      return res.status(400).send({ message: "User already exists, login instead" });
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

    const groupId = req.params.groupId;
    const userId = newUser._id;
    console.log("groupId", groupId, "userId", userId);

    const group = await GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "User is already in group" });
    }

    group.members.push(userId);
    await group.save();

    newUser.group.push(groupId);
    await newUser.save();

    res.status(200).send({ user: newUser, accessToken });
  } catch (error) {
    next(error);
  }
});

userRouter.post("/login/:groupId", async (req, res, next) => {
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

    const groupId = req.params.groupId;
    const userId = user._id;
    console.log("groupId", groupId, "userId", userId);

    const group = await GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "User is already in group" });
    }

    group.members.push(userId);
    await group.save();

    res.status(200).send({ message: "Logged In successfully, and Added to the group", user: user, group: group, accessToken });
  } catch (error) {
    next(error);
  }
});

userRouter.get("/:userId", async (req, res, next) => {
  const user = await UserModel.findById(req.params.userId)
    .populate("group")
    .populate({ path: "group", populate: { path: "members" } });
  res.status(200).send(user);
});

export default userRouter;
