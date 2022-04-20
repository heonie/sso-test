import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import fs from "fs";
import cors from "cors";

const PORT = 3000;
const JWT_PRIVATE_KEY = fs.readFileSync(
  path.join(__dirname, "../jwtRS256.key"),
  "utf8"
);
const JWT_PUBLIC_KEY = fs.readFileSync(
  path.join(__dirname, "../jwtRS256.key.pub"),
  "utf8"
);

const users = [
  {
    uid: "heonie",
    email: "heonie@gmail.com",
    password: "1234",
  },
  {
    uid: "heonie7",
    email: "heonie7@gmail.com",
    password: "1234",
  },
];

const app = express();

app.use(
  cors({
    origin: ["http://localhost:8000"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json());
app.listen(PORT, () => {
  console.log(`Account Server is listening at port ${PORT}`);
});

app.post("/auth", (req, res) => {
  // TODO: Filter the requester by origin
  try {
    const { email, password } = req.body;
    const matchedUser = users.find(
      (user) => user.email == email && user.password == password
    );
    console.log("matchedUser", matchedUser);
    const uid = matchedUser.uid;
    const payload = { uid };
    console.log("payload", payload);
    const token = jwt.sign(payload, JWT_PRIVATE_KEY, {
      issuer: "ndotlight corp.",
      expiresIn: "1y",
      algorithm: "RS256",
    });
    res.send({ token });
  } catch (ex) {
    console.log(ex);
    res.status(401).send();
  }
});

const getUID = (token) => {
  const verified = jwt.verify(token, JWT_PUBLIC_KEY, {
    algorithm: ["RS256"],
  });
  console.log("verified", verified);
  const { uid } = verified;
  return uid || null;
};

app.get("/me", (req, res) => {
  console.log("GET /me");
  const token = req.headers.authorization.split("Bearer ")[1];
  const uid = getUID(token);
  if (!uid) {
    res.status(401).send();
    return;
  }
  try {
    const user = users.find((data) => data.uid == uid);
    const { password, ...filteredUser } = user; // every properties except password
    res.send(filteredUser);
  } catch (ex) {
    console.log(ex);
    res.status(401).send();
  }
});
