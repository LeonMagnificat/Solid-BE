import express from "express";
import GroupModel from "./model.js";
import UserModel from "../user/model.js";
import { sendEmail } from "../../library/tools/emailTools.js";
import { createAccessToken } from "../../library/Auth/tokenTools.js";
import jwt from "jsonwebtoken";

const groupRouter = express.Router();

groupRouter.post("/newGroup/:userId", async (req, res, next) => {
  const newGroup = new GroupModel(req.body);
  const userId = req.params.userId;
  const groupId = newGroup._id;
  const user = await UserModel.findById(userId);

  newGroup.members.push(userId);
  await newGroup.save();

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.group.push(groupId);
  user.role = "Admin";
  await user.save();

  res.status(200).send({ newGroup, user });

  try {
  } catch (error) {
    next(error);
  }
});

groupRouter.post("/inviteGroup/:groupId", async (req, res, next) => {
  const groupId = req.params.groupId;
  const { email } = req.body;
  try {
    const group = await GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    const groupName = group.name;
    const user = await UserModel.findOne({ email });
    const invitationLinkRegister = `http://localhost:3000/register/${groupId}/${email}`;
    const invitationLinkLogin = `http://localhost:3000/login/${groupId}/${email}`;

    const payload = { email };

    const token = await createAccessToken(payload);
    if (!user) {
      sendEmail(email, invitationLinkRegister, groupName);
    } else {
      sendEmail(email, `${invitationLinkLogin}?token=${token}`, groupName);
    }

    res.status(200).json({ message: "Email sent" });
  } catch (error) {
    next(error);
  }
});

groupRouter.post("/:groupId/join/:userId", async (req, res, next) => {
  const groupId = req.params.groupId;
  const userId = req.params.userId;
  try {
    const group = await GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "User is already in group" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    group.members.push(userId);
    await group.save();
    user.group.push(groupId);
    await user.save();
    res.status(200).send(group);
  } catch (error) {
    next(error);
  }
});

groupRouter.put("/:groupId", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const group = await GroupModel.findByIdAndUpdate(groupId, req.body, { new: true, runValidators: true });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.status(200).send(group);
  } catch (error) {
    next(error);
  }
});
groupRouter.delete("/:groupId", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const group = await GroupModel.findByIdAndDelete(groupId);
    const result = await UserModel.updateMany({ group: groupId }, { $pull: { group: groupId } });

    console.log(`Modified ${result.nModified} user(s)`);

    res.status(200).send({ message: "Group deleted" });
  } catch (error) {
    next(error);
  }
});

export default groupRouter;
