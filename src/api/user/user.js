import express from "express";
import UserModel from "./model.js";
import GroupModel from "../group/model.js";
import bcrypt from "bcrypt";
import { createAccessToken } from "../../library/Auth/tokenTools.js";
import { basicAuthMiddleware } from "../../library/JWTMiddleware/basicAuth.js";
import { JWTAuthMiddleware } from "../../library/JWTMiddleware/jwtAuth.js";

const userRouter = express.Router();

userRouter.post("/register", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    //if user exist
    if (user) {
      return res.status(400).send({ message: "User already exists, Login instead" });
    }
    //if user do not exist, create one
    const newUser = new UserModel(req.body);

    //Hash password before saving it
    // const hashedPassword = await bcrypt.hash(password, 11);
    // newUser.password = hashedPassword;
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
  try {
    const { email, password } = req.body;
    //check if the user exists
    const user = await UserModel.findOne({ email: email });
    if (!user) res.status(400).send({ message: "Invalid Email or Password!" });

    // check password

    const member = await UserModel.checkCredentials(email, password);

    if (member) {
      const payload = { _id: member._id, role: member.role };
      const accessToken = await createAccessToken(payload);
      res.status(200).send({ message: "Logged In successfully", user: member, accessToken });
    } else {
      res.status(400).send({ message: "Invalid Email or Password!" });
    }
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) res.status(400).send({ message: "Invalid Email or Password!" });
    // const accessToken = await createAccessToken(payload);
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

    user.group.push(groupId);
    await user.save();

    res.status(200).send({ message: "Logged In successfully, and Added to the group", user: user, group: group, accessToken });
  } catch (error) {
    next(error);
  }
});

userRouter.get("/:userId", JWTAuthMiddleware, async (req, res, next) => {
  const user = await UserModel.findById(req.params.userId)
    .populate("group")
    .populate({ path: "group", populate: { path: "members" } });
  res.status(200).send(user);
});

userRouter.delete("/deleteMember/:groupId/:userId", async (req, res, next) => {
  const groupId = req.params.groupId;
  const userId = req.params.userId;
  try {
    const group = await GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    group.members = group.members.filter((member) => member.toString() !== userId);
    await GroupModel.findByIdAndUpdate({ _id: groupId }, { $set: { members: group.members } });
    await group.save();

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.group = user.group.filter((group) => group.toString() !== groupId);
    await UserModel.findByIdAndUpdate({ _id: userId }, { $set: { group: user.group } });
    await user.save();
    res.status(200).send({ message: "User deleted successfully" });
  } catch {
    next(error);
  }
});

export default userRouter;
