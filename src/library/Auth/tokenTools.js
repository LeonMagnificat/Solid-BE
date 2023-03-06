import jwt from "jsonwebtoken";

export const createAccessToken = (payload) => {
  return new Promise((resolve, reject) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1 week" }, (err, token) => {
      if (err) reject(err);
      else resolve(token);

      console.log(token);
      console.log("payload", payload);
    });
  });
};

export const verifyAccessToken = (token) => {
  return new Promise((resolve, reject) => {
    return jwt.verify(token, process.env.JWT_SECRET, (err, originalPayload) => {
      if (err) {
        reject(err);
      } else {
        resolve(originalPayload);
      }
    });
  });
};
