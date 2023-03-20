import express from "express";
import UserModel from "../user/model.js";
import GroupModel from "../group/model.js";
import ContributionModel from "../contribution/model.js";

const contributionRouter = express.Router();

contributionRouter.post("/:groupId/:userId", async (req, res, next) => {
  const groupId = req.params.groupId;
  const userId = req.params.userId;

  const member = await UserModel.findById(userId);
  const group = await GroupModel.findById(groupId);

  if (!member || !group) {
    res.status(404).json({ message: "User or group not found" });
    return;
  }
  if (!group.members.includes(userId)) {
    res.status(403).json({ message: "User is not a member of this group" });
    return;
  }

  const newContribution = new ContributionModel({ user: userId, group: groupId, amount: req.body.amount });
  await newContribution.save();
  res.status(201).json(newContribution);
});

contributionRouter.get("/:groupId", async (req, res, next) => {
  const groupId = req.params.groupId;
  const contributions = await ContributionModel.find({ group: groupId });
  if (contributions.length !== 0) {
    const sum = contributions.reduce((acc, curr) => acc + curr.amount, 0);
    const group = await GroupModel.findById(groupId);
    group.total = sum;
    await group.save();
    res.send({ contributions, group });
  }
});

contributionRouter.get("/:groupId/:userId", async (req, res, next) => {
  const groupId = req.params.groupId;
  const userId = req.params.userId;

  try {
    const contributions = await ContributionModel.find({ user: userId, group: groupId });
    if (contributions.length !== 0) {
      const sum = contributions.reduce((acc, curr) => acc + curr.amount, 0);
      const user = await UserModel.findById(userId);
      user.total = sum;
      await user.save();
      res.send({ contributions, user });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

export default contributionRouter;
