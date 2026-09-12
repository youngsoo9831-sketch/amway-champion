const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../prismaClient");

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "아이디와 비밀번호를 입력해주세요." });
    }

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      return res
        .status(401)
        .json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      return res
        .status(401)
        .json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }

    req.session.isAdmin = true;
    req.session.username = admin.username;

    res.json({ username: admin.username });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    res.status(204).send();
  });
});

// GET /api/auth/me
router.get("/me", (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.json({ username: req.session.username });
  }
  return res.status(401).json({ error: "로그인이 필요합니다." });
});

module.exports = router;
