# Simple SSO test

JWT 기반의 API보안을 위한 구조 설계를 위한 프로토타입.

본 테스트의 목적은,

- 사용자의 JWT 발급을 위한 Account server와, 해당 JWT를 이용하여 사용자를 Verify 하고자 하는 복수개의 Resouce server를 분리시키는 구조의 테스트를 위함.
- Resouce Server로의 API요청시 요청받은 JWT가 유효한지를 매번 Account Server에 Request한다면, Account Server 부하가 너무 크고, Resource Server의 성능저하가 일어날것임. 따라서 Resouce Server가 직접 JWT가 유효한지를 확인 할 수 있어야 한다.

## Sharing JWT Secret VS Using RSA key-pair

Resource Server가 요청받은 JWT가 유효한지를 verify하기 위해서는

- 방법 1: JWT의 발급과 verify시에 동일한 Secret을 이용한다. Secret은 절대 유출되어서는 안된다.
  - 맘먹으면 Resource Server또한 유효한 JWT 토큰의 발급이 가능하다.
- 방법 2: RSA 512bit key-pair를 생성하여, Account Server가 JWT 발급시에는 비밀키를 사용하여 Sign하고, Resource Server가 JWT Verify시엔 공개키를 이용한다.

## RSA Key-pair 의 생성

- http://travistidwell.com/jsencrypt/demo/ (최소 512 bit)
- 또는 아래의 스크립트 이용 (최소 1024 bit)

```sh
ssh-keygen -t rsa -b 1024 -m PEM -f jwtRS256.key
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
cat jwtRS256.key
cat jwtRS256.key.pub
```

## TODO

- Login ID/PW의 입력도 Account Server에서 호스팅하는 웹페이지에서만 입력받고 redirection 한다.
- SAML, OIDC 등의 기존 프로토콜에 비추어 보안상 문제가 없는지 검토 필요.
- 3rd party 앱에서 리소스를 가져가도록 하기 위한 OAuth 지원 필요.
