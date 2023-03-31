import express from "express";
import UserModel from "../user/model.js";
import GroupModel from "../group/model.js";
import ContributionModel from "../contribution/model.js";
import { JWTAuthMiddleware } from "../../library/JWTMiddleware/jwtAuth.js";

const contributionRouter = express.Router();

contributionRouter.post("/:groupId/:userId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.params.userId;

    const member = await UserModel.findById(userId)
      .populate("group")
      .populate({ path: "group", populate: [{ path: "members", populate: [{ path: "contributions" }] }], populate: [{ path: "tasks" }] })
      .populate({ path: "contributions" });
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

    const userContributions = await ContributionModel.find({ user: userId });
    const userTotal = userContributions.reduce((acc, curr) => acc + curr.amount, 0);
    member.total = userTotal;
    await member.save();

    const groupContributions = await ContributionModel.find({ group: groupId }).populate({ path: "group" }).populate({ path: "user" });
    const groupTotal = groupContributions.reduce((acc, curr) => acc + curr.amount, 0);
    group.total = groupTotal;
    await group.save();

    const updatedMember = await UserModel.findByIdAndUpdate(userId, { $push: { contributions: newContribution } }, { new: true, runValidators: true })
      .populate("group")
      .populate({ path: "group", populate: [{ path: "members", populate: [{ path: "contributions" }] }, { path: "tasks" }] })
      .populate({ path: "contributions" });

    const loggedInUser = await UserModel.findById(req.user._id)
      .populate("group")
      .populate({ path: "group", populate: [{ path: "members", populate: [{ path: "contributions" }] }, { path: "tasks" }] })
      .populate({ path: "contributions" });

    res.status(201).json(loggedInUser);
  } catch (error) {
    next(error);
  }
});

contributionRouter.get("/:groupId", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const contributions = await ContributionModel.find({ group: groupId });
    if (contributions.length !== 0) {
      const sum = contributions.reduce((acc, curr) => acc + curr.amount, 0);
      const group = await GroupModel.findById(groupId);
      group.total = sum;
      await group.save();
      res.send({ contributions, group });
    }
  } catch (error) {
    next(error);
    res.status(500).send(error);
  }
});

contributionRouter.get("/:groupId/:userId", async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.params.userId;
    const contributions = await ContributionModel.find({ user: userId, group: groupId });
    if (contributions.length !== 0) {
      const sum = contributions.reduce((acc, curr) => acc + curr.amount, 0);
      const user = await UserModel.findById(userId);
      user.total = sum;
      await user.save();
      res.send({ contributions, user });
    }
  } catch (error) {
    next(error);
    res.status(500).send(error);
  }
});

contributionRouter.put("/:contributionId", async (req, res, next) => {
  try {
    const contributionId = req.params.contributionId;

    const updatedContribution = await ContributionModel.findByIdAndUpdate(contributionId, { amount: req.body.amount }, { new: true });

    if (!updatedContribution) {
      res.status(404).json({ message: "Contribution not found" });
      return;
    }

    res.status(200).json(updatedContribution);
  } catch (error) {
    next(error);
    res.status(500).send(error);
  }
});

contributionRouter.delete("/:contributionId", async (req, res, next) => {
  try {
    const contributionId = req.params.contributionId;

    const deletedContribution = await ContributionModel.findByIdAndRemove(contributionId);

    if (!deletedContribution) {
      res.status(404).json({ message: "Contribution not found" });
      return;
    }
    res.status(204).send({ message: "Contribution Deleted" });
  } catch (error) {
    next(error);
    res.status(500).send(error);
  }
});

export default contributionRouter;
