import createHttpError from "http-errors";
import { verifyAccessToken } from "../Auth/tokenTools.js";

export const JWTAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createHttpError(401, "Please provide credentials"));
  } else {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const payload = await verifyAccessToken(token);
      req.user = {
        _id: payload._id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        token,
      };
      next();
    } catch (error) {
      next(createHttpError(401, "Please provide credentials"));
    }
  }
};
