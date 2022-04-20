import express from "express";
import axios from "axios";
import users from "./users";
import { jwtIssue } from "./token";

const router = express.Router();

const KAKAO_AUTHAPI_ENDPOINT = "https://kauth.kakao.com";
const KAKAO_API_ENDPOINT = "https://kapi.kakao.com";
const CLIENT_ID = "921b66aa109d8b4c86f52c0fc2f9c71d";
const CLIENT_SECRET = "hbEGazWaRriSQwzflHyFCkJwiwqyNcLw";

router.get("/redirect", async (req, res) => {
  console.log("KAKAO", "redirect", req.query);
  const redirectUri =
    req.protocol + "://" + req.get("host") + "/kakao/redirect";
  const kakaoTokenUrl = `${KAKAO_AUTHAPI_ENDPOINT}/oauth/token`;
  const kakaoUserInfoUrl = `${KAKAO_API_ENDPOINT}/v2/user/me`;

  const { code } = req.query;

  const params = {
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    //client_secret: CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
  };
  console.log("params", params);

  try {
    const tokenResponse = await axios({
      method: "post",
      url: kakaoTokenUrl,
      params: params,
    });
    const accessToken = tokenResponse.data.access_token;
    console.log("access_token", accessToken);

    const userResponse = await axios({
      method: "get",
      url: kakaoUserInfoUrl,
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });
    const userInfo = userResponse.data;
    console.log(userInfo);

    const matchedUser = users.find((user) => user.kakao_uid == userInfo.id);
    if (matchedUser) {
      const token = jwtIssue(matchedUser.uid);
      console.log("login token", token);
      res.send(
        `<script>window.opener.postMessage({ method: 'setToken', args: ["${token}"] }, '*'); window.close();</script>`
      );
    } else {
      res.send(
        `<script>alert('해당하는 사용자가 없습니다'); window.close();</script>`
      );
    }
  } catch (ex) {
    console.log("ERROR", ex);
    res.send(`<script>alert('오류가 발생했습니다'); window.close();</script>`);
  }
});

router.get("/auth", (req, res) => {
  const redirectUri =
    req.protocol + "://" + req.get("host") + "/kakao/redirect";
  const kakaoAuthUrl = `${KAKAO_AUTHAPI_ENDPOINT}/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code`;
  res.redirect(kakaoAuthUrl);
});

export default router;
