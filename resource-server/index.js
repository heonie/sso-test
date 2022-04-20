import express from "express";
import path from "path";
import jwt from "jsonwebtoken";
import fs from "fs";

const PORT = 8000;
const ACCOUNT_SERVER = "http://localhost:3000";

const JWT_PUBLIC_KEY = fs.readFileSync(
  path.join(__dirname, "../jwtRS256.key.pub"),
  "utf8"
);

const app = express();
app.listen(PORT, () => {
  console.log(`Service Server is listening at port ${PORT}`);
});

app.use(express.static(path.join(__dirname, "public")));

const resource = [
  {
    uid: "heonie",
    items: ["ndotcad", "ndotmarket"],
  },
  {
    uid: "heonie7",
    items: ["ndotcad"],
  },
];

const getUID = (token) => {
  const verified = jwt.verify(token, JWT_PUBLIC_KEY, {
    algorithm: ["RS256"],
  });
  console.log("verified", verified);
  const { uid } = verified;
  return uid || null;
};

app.get("/items", (req, res) => {
  console.log("GET /items");
  const token = req.headers.authorization.split("Bearer ")[1];
  console.log("Requested token: " + token);
  const uid = getUID(token);
  console.log("Verified UID: " + uid);
  if (!uid) {
    res.status(401).send();
    return;
  }
  try {
    const user = resource.find((data) => data.uid == uid);
    res.send(JSON.stringify(user.items));
  } catch (ex) {
    console.log(ex);
    res.status(401).send();
  }
});
