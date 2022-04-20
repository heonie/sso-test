import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const JWT_PRIVATE_KEY = fs.readFileSync(
  path.join(__dirname, "../jwtRS256.key"),
  "utf8"
);
const JWT_PUBLIC_KEY = fs.readFileSync(
  path.join(__dirname, "../jwtRS256.key.pub"),
  "utf8"
);

export const jwtIssue = (uid) => {
  return jwt.sign({ uid }, JWT_PRIVATE_KEY, {
    issuer: "ndotlight corp.",
    expiresIn: "1y",
    algorithm: "RS256",
  });
};

export const jwtVerify = (token) => {
  return jwt.verify(token, JWT_PUBLIC_KEY, {
    expiresIn: "1y",
    algorithm: ["RS256"],
  });
};
