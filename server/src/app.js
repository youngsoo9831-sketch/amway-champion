const express = require("express");
const cors = require("cors");
const session = require("express-session");

const productsRouter = require("./routes/products");
const postsRouter = require("./routes/posts");
const authRouter = require("./routes/auth");
const membersRouter = require("./routes/members");
const commentsRouter = require("./routes/comments");
const reactionsRouter = require("./routes/reactions");

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();

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
      secure: false,
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

// 404 처리
app.use("/api", (req, res) => {
  res.status(404).json({ error: "요청하신 리소스를 찾을 수 없습니다." });
});

// 공통 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "서버 오류가 발생했습니다." });
});

module.exports = app;
