import express from "express";
import GroupModel from "./model.js";
import shortid from "shortid";
import UserModel from "../user/model.js";
import { sendEmail } from "../../library/tools/emailTools.js";

const groupRouter = express.Router();

groupRouter.post("/newGroup", async (req, res, next) => {
  const newGroup = new GroupModel(req.body);
  //   const hostURL = req.headers.host;
  //   const invitationLink = `${hostURL}/${newGroup._id}/join/${shortid.generate()}`;
  //   newGroup.invitation = invitationLink;

  await newGroup.save();

  res.status(200).send(newGroup);

  try {
  } catch (error) {
    next(error);
  }
});

groupRouter.post("/inviteGroup/:groupId", async (req, res, next) => {
  const groupId = req.params.groupId;
  //const { email } = req.body;
  const email = "leonmagnificat@gmail.com";
  try {
    const group = await GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    const groupName = group.name;
    const user = await UserModel.findOne({ email });
    const invitationLinkRegister = `http://localhost:3000/register/${groupId}/${email}`;
    const invitationLinkLogin = `http://localhost:3000/login/${groupId}/${email}`;
    if (!user) {
      sendEmail(email, invitationLinkRegister, groupName);
    } else {
      sendEmail(email, invitationLinkLogin, groupName);
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

export default groupRouter;
