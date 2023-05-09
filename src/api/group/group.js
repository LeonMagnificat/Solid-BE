import express from "express";
import GroupModel from "./model.js";
import UserModel from "../user/model.js";
import { sendEmail } from "../../library/tools/emailTools.js";
import { createAccessToken } from "../../library/Auth/tokenTools.js";
import { JWTAuthMiddleware } from "../../library/JWTMiddleware/jwtAuth.js";
const groupRouter = express.Router();

groupRouter.post("/newGroup/:userId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const newGroup = new GroupModel(req.body);
    const userId = req.params.userId;
    const groupId = newGroup._id;

    const existingGroup = await GroupModel.findOne({ name: newGroup.name, members: userId });
    if (existingGroup) {
      return res.status(400).send({ message: "Group name already exists, please choose another name" });
    }
    newGroup.members.push(userId);
    newGroup.admins.push(userId);
    await newGroup.save();

    const user = await UserModel.findById(userId)
      .populate("group")
      .populate({ path: "group", populate: [{ path: "members", populate: [{ path: "contributions" }] }, { path: "tasks" }] })
      .populate({ path: "contributions" });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    if (user.role !== "Admin") {
      user.role = "Admin";
      await user.save();
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, { $push: { group: groupId } }, { new: true, runValidators: true })
      .populate("group")
      .populate({ path: "group", populate: [{ path: "members", populate: [{ path: "contributions" }] }, { path: "tasks" }] })
      .populate({ path: "contributions" });

    res.status(200).send(updatedUser);
  } catch (error) {
    next(error);
  }
});

groupRouter.post("/inviteGroup/:groupId", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const { email } = req.body;
    const group = await GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).send({ message: "Group not found" });
    }
    const frontEndUrl = process.env.FE_PROD_URL;
    const frontEndUrlLocal = process.env.FE_DEV_URL;
    const groupName = group.name;
    const user = await UserModel.findOne({ email });
    const invitationLinkRegister = `${frontEndUrl}/register/${groupId}/${email}`;
    const invitationLinkLogin = `${frontEndUrl}/login/${groupId}/${email}`;

    const payload = { email };

    const token = await createAccessToken(payload);
    if (!user) {
      sendEmail(email, invitationLinkRegister, groupName);
    } else {
      sendEmail(email, `${invitationLinkLogin}?token=${token}`, groupName);
    }

    res.status(200).send({ message: "Email sent" });
  } catch (error) {
    next(error);
  }
});

groupRouter.post("/:groupId/join/:userId", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.params.userId;
    const group = await GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).send({ message: "Group not found" });
    }
    if (group.members.includes(userId)) {
      return res.status(400).send({ message: "User is already in group" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
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

groupRouter.put("/:groupId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user._id;
    const group = await GroupModel.findByIdAndUpdate(groupId, req.body, { new: true, runValidators: true });
    if (!group) {
      return res.status(404).send({ message: "Group not found" });
    }

    const user = await UserModel.findById(userId)
      .populate("group")
      .populate({ path: "group", populate: [{ path: "members", populate: [{ path: "contributions" }] }, { path: "tasks" }] })
      .populate({ path: "contributions" });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
});
groupRouter.delete("/:groupId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user._id;
    const group = await GroupModel.findByIdAndDelete(groupId);
    const result = await UserModel.updateMany({ group: groupId }, { $pull: { group: groupId } });

    const user = await UserModel.findById(userId)
      .populate("group")
      .populate({ path: "group", populate: [{ path: "members", populate: [{ path: "contributions" }] }, { path: "tasks" }] })
      .populate({ path: "contributions" });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send({ user, message: "Group successfully deleted" });
  } catch (error) {
    next(error);
  }
});

export default groupRouter;
