const path = require("path");
const express = require("express");
const cors = require("cors");
const session = require("express-session");

const productsRouter = require("./routes/products");
const postsRouter = require("./routes/posts");
const authRouter = require("./routes/auth");
const membersRouter = require("./routes/members");
const commentsRouter = require("./routes/comments");
const reactionsRouter = require("./routes/reactions");

const isProduction = process.env.NODE_ENV === "production";

const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN ||
  process.env.RENDER_EXTERNAL_URL ||
  "http://localhost:5173";

const app = express();

// Render(및 대부분의 PaaS)는 리버스 프록시 뒤에서 앱을 실행하므로,
// 프록시가 붙인 X-Forwarded-Proto 헤더를 신뢰해야 secure 쿠키가 올바르게 동작한다.
app.set("trust proxy", 1);

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET || "amway-champion-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction, // 배포 환경(HTTPS)에서만 secure 쿠키 사용
      maxAge: 1000 * 60 * 60 * 8, // 8시간
    },
  })
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/posts", postsRouter);
app.use("/api/members", membersRouter);
app.use("/api/posts/:postId/comments", commentsRouter);
app.use("/api/posts/:postId/reactions", reactionsRouter);

// /api 하위 404 처리 (그 외 정적 파일/SPA 라우트에는 영향 없음)
app.use("/api", (req, res) => {
  res.status(404).json({ error: "요청하신 리소스를 찾을 수 없습니다." });
});

if (isProduction) {
  // 프로덕션에서는 client 빌드 결과물(client/dist)을 같은 서버에서 함께 서빙한다.
  const clientDistPath = path.join(__dirname, "..", "..", "client", "dist");
  app.use(express.static(clientDistPath));

  // /api 로 시작하지 않는 모든 경로는 React Router가 처리하도록 index.html을 반환한다.
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// 공통 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "서버 오류가 발생했습니다." });
});

module.exports = app;
