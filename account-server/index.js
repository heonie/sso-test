import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import kakaoRouter from "./kakao";
import naverRouter from "./naver";
import users from "./users";
import { jwtIssue, jwtVerify } from "./token";

const PORT = 3000;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:8000", "https://4361-61-255-188-98.jp.ngrok.io"], // allowed origin for auth requests
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json());
app.listen(PORT, () => {
  console.log(`Account Server is listening at port ${PORT}`);
});

app.get("/", (req, res) => {
  res.status(403).send();
});
app.post("/auth", (req, res) => {
  try {
    console.log("POST /auth");
    const { email, password } = req.body;
    const matchedUser = users.find(
      (user) => user.email == email && user.password == password
    );
    console.log("matchedUser", matchedUser);
    const uid = matchedUser.uid;
    const payload = { uid };
    console.log("payload", payload);
    const token = jwtIssue(uid);
    res.send({ token });
  } catch (ex) {
    console.log(ex);
    res.status(401).send();
  }
});

const getUID = (token) => {
  const verified = jwtVerify(token);
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

app.use("/kakao", kakaoRouter);
app.use("/naver", naverRouter);
