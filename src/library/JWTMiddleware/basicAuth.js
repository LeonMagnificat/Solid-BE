import createHttpError from "http-errors";
import atob from "atob";
import UserModel from "../../api/user/model.js";

export const basicAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createHttpError(401, "Please provide credentials"));
  } else {
    try {
      const encoded = req.headers.authorization.split(" ")[1];
      const decoded = atob(encoded);
      const [email, password] = decoded.split(":");
      const user = await UserModel.checkCredentials(email, password);
      console.log(user, "user");
      if (user) {
        req.user = user;
        next();
      } else {
        next(createHttpError(401, "Please provide credentials"));
      }
    } catch (error) {
      next(createHttpError(401, "Please provide credentials"));
    }
  }
};
