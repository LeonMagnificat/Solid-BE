import express from "express";
import UserModel from "../user/model.js";
import GroupModel from "../group/model.js";
import ContributionModel from "../contribution/model.js";
import TaskModel from "./model.js";

const taskRouter = express.Router();

taskRouter.post("/:groupId", async (req, res, next) => {
  const groupId = req.params.groupId;
  const group = await GroupModel.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }
  const task = new TaskModel({ title: req.body.title, group: groupId });
  await task.save();
  return res.status(201).json(task);
});

taskRouter.get("/:groupId", async (req, res, next) => {
  const groupId = req.params.groupId;
  const group = await GroupModel.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }
  const tasks = await TaskModel.find({ group: groupId });
  return res.status(200).json(tasks);
});

taskRouter.put("/:taskId", async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const task = await TaskModel.findByIdAndUpdate(taskId, req.body, { new: true, runValidators: true });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});
taskRouter.delete("/:taskId", async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const task = await TaskModel.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(200).json("task deleted");
  } catch (error) {
    next(error);
  }
});

export default taskRouter;
