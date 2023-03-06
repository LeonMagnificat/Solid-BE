import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import userRouter from "./api/user/user.js";
import groupRouter from "./api/group/group.js";
import { badRequestHandler, unauthorizedHandler, notFoundHandler, genericHandler } from "./errorHandler.js";
import mongoose from "mongoose";

const server = express();
const port = 3002;

server.use(express.json());
server.use(cors());

server.use("/user", userRouter);
server.use("/group", groupRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notFoundHandler);
server.use(genericHandler);

const mongoURL = process.env.MONGODB_URL;
console.log(`Mongo URL: ${mongoURL}`);

mongoose.connect(mongoURL);

mongoose.connection.on("connected", () => {
  console.log("DB Connected");
  server.listen(port, () => {
    console.log(`listening on port ${port}`);
    console.table(listEndpoints(server));
  });
});
