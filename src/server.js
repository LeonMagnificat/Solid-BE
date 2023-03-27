import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import userRouter from "./api/user/user.js";
import groupRouter from "./api/group/group.js";
import taskRouter from "./api/task/task.js";
import contributionRouter from "./api/contribution/contribution.js";
import { badRequestHandler, unauthorizedHandler, notFoundHandler, genericHandler } from "./errorHandler.js";
import mongoose from "mongoose";

const server = express();
const port = 3002;

server.use(express.json());

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

// const corsOpts = {
//   origin: (origin, corsNext) => {
//     console.log("CURRENT ORIGIN: ", origin);
//     if (!origin || whitelist.indexOf(origin) !== -1) {
//       // If current origin is in the whitelist you can move on
//       corsNext(null, true);
//     } else {
//       // If it is not --> error
//       corsNext(createHttpError(400, `Origin ${origin} is not in the whitelist!`));
//     }
//   },
// };

//server.use(cors(corsOpts));
server.use(cors());

server.use("/user", userRouter);
server.use("/group", groupRouter);
server.use("/contribution", contributionRouter);
server.use("/task", taskRouter);

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
