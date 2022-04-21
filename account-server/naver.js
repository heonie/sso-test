import express from "express";
import axios from "axios";
import users from "./users";
import { jwtIssue } from "./token";

const router = express.Router();
const logger = (...args) => console.log("NAVER", ...args);

const NAVER_AUTHAPI_ENDPOINT = "https://nid.naver.com";
const NAVER_API_ENDPOINT = "https://openapi.naver.com";
const CLIENT_ID = "IUigGI3VfVZBMOYYCkKo";
const CLIENT_SECRET = "K3HFFjOgmr";

router.get("/auth", (req, res) => {
  const redirectUri =
    req.protocol + "://" + req.get("host") + "/naver/redirect";
  const state = "N" + Date.now();
  const authUrl = `${NAVER_AUTHAPI_ENDPOINT}/oauth2.0/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&state=${state}`;
  res.redirect(authUrl);
});

router.get("/redirect", async (req, res) => {
  logger("redirect", req.query);
  const redirectUri =
    req.protocol + "://" + req.get("host") + "/naver/redirect";
  const tokenUrl = `${NAVER_AUTHAPI_ENDPOINT}/oauth2.0/token`;
  const userInfoUrl = `${NAVER_API_ENDPOINT}/v1/nid/me`;

  const { code } = req.query;

  const params = {
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    state: "N" + Date.now(),
    redirect_uri: redirectUri,
  };
  const headers = {
    //"X-Naver-Client-Id": CLIENT_ID,
    //"X-Naver-Client-Secret": CLIENT_SECRET,
  };
  logger("params", params);
  logger("headers", headers);

  try {
    const tokenResponse = await axios({
      method: "post",
      url: tokenUrl,
      headers,
      params,
    });
    logger("response", tokenResponse);
    const accessToken = tokenResponse.data.access_token;
    logger("access_token", accessToken);

    const userResponse = await axios({
      method: "get",
      url: userInfoUrl,
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });
    const userInfo = userResponse.data.response;
    logger(userInfo);

    const matchedUser = users.find(
      (user) => user.naver_uid && user.naver_uid == userInfo.id
    );
    if (matchedUser) {
      const token = jwtIssue(matchedUser.uid);
      logger("login token", token);
      res.send(
        `<script>window.opener.postMessage({ method: 'setToken', args: ["${token}"] }, '*'); window.close();</script>`
      );
    } else {
      const nickName = userInfo.name; // "name"은 개발자설정에서 필수항목으로 지정되어있음
      res.send(
        `<script>alert('"${nickName}" 네이버 계정에 해당하는 사용자가 없습니다'); window.close();</script>`
      );
    }
  } catch (ex) {
    logger("ERROR", ex);
    res.send(
      `<script>alert('오류가 발생했습니다\n'+${ex}); window.close();</script>`
    );
  }
});

export default router;
