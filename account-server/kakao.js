import express from "express";
import axios from "axios";
import users from "./users";
import { jwtIssue } from "./token";

const router = express.Router();
const logger = (...args) => console.log("KAKAO", ...args);

const KAKAO_AUTHAPI_ENDPOINT = "https://kauth.kakao.com";
const KAKAO_API_ENDPOINT = "https://kapi.kakao.com";
const CLIENT_ID = "921b66aa109d8b4c86f52c0fc2f9c71d";

router.get("/auth", (req, res) => {
  const redirectUri =
    req.protocol + "://" + req.get("host") + "/kakao/redirect";
  const kakaoAuthUrl = `${KAKAO_AUTHAPI_ENDPOINT}/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code`;
  res.redirect(kakaoAuthUrl);
});

router.get("/redirect", async (req, res) => {
  logger("redirect", req.query);
  const redirectUri =
    req.protocol + "://" + req.get("host") + "/kakao/redirect";
  const tokenUrl = `${KAKAO_AUTHAPI_ENDPOINT}/oauth/token`;
  const userInfoUrl = `${KAKAO_API_ENDPOINT}/v2/user/me`;

  const { code } = req.query;

  const params = {
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    //client_secret: CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
  };
  logger("params", params);

  try {
    const tokenResponse = await axios({
      method: "post",
      url: tokenUrl,
      params: params,
    });
    const accessToken = tokenResponse.data.access_token;
    logger("access_token", accessToken);

    const userResponse = await axios({
      method: "get",
      url: userInfoUrl,
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });
    const userInfo = userResponse.data;
    logger("userInfo", userInfo);

    const matchedUser = users.find(
      (user) => user.kakao_uid && user.kakao_uid == userInfo.id
    );
    if (matchedUser) {
      const token = jwtIssue(matchedUser.uid);
      logger("login token", token);
      res.send(
        `<script>window.opener.postMessage({ method: 'setToken', args: ["${token}"] }, '*'); window.close();</script>`
      );
    } else {
      const nickName = userInfo.kakao_account.profile.nickname; // "nickname"은 카카오개발자설정에서 필수항목으로 지정되있음
      res.send(
        `<script>alert('"${nickName}" 카카오 계정에 해당하는 사용자가 없습니다'); window.close();</script>`
      );
    }
  } catch (ex) {
    logger("ERROR", ex);
    `<script>alert('오류가 발생했습니다\n'+${ex}); window.close();</script>`;
  }
});

export default router;
