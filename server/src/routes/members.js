const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../prismaClient");

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;

function serializeMember(member) {
  return { id: member.id, email: member.email, name: member.name };
}

// POST /api/members/register (회원가입)
router.post("/register", async (req, res, next) => {
  try {
    const { email, name, password } = req.body || {};
    const trimmedEmail = typeof email === "string" ? email.trim() : "";
    const trimmedName = typeof name === "string" ? name.trim() : "";

    const errors = [];
    if (!trimmedEmail) {
      errors.push("이메일은 필수입니다.");
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.push("올바른 이메일 형식이 아닙니다.");
    }
    if (!trimmedName) {
      errors.push("이름은 필수입니다.");
    }
    if (!password || typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
      errors.push(`비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`);
    }
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    const existing = await prisma.member.findUnique({
      where: { email: trimmedEmail },
    });
    if (existing) {
      return res.status(409).json({ error: "이미 가입된 이메일입니다." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const member = await prisma.member.create({
      data: { email: trimmedEmail, name: trimmedName, passwordHash },
    });

    req.session.memberId = member.id;

    res.status(201).json(serializeMember(member));
  } catch (err) {
    next(err);
  }
});

// POST /api/members/login (회원 로그인)
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "이메일과 비밀번호를 입력해주세요." });
    }

    const member = await prisma.member.findUnique({
      where: { email: String(email).trim() },
    });
    if (!member) {
      return res
        .status(401)
        .json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const match = await bcrypt.compare(password, member.passwordHash);
    if (!match) {
      return res
        .status(401)
        .json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    req.session.memberId = member.id;
    res.json(serializeMember(member));
  } catch (err) {
    next(err);
  }
});

// POST /api/members/logout
router.post("/logout", (req, res) => {
  if (req.session) {
    delete req.session.memberId;
  }
  res.status(204).send();
});

// GET /api/members/me (로그인 상태 확인)
router.get("/me", async (req, res, next) => {
  try {
    if (!req.session || !req.session.memberId) {
      return res.status(401).json({ error: "로그인이 필요합니다." });
    }
    const member = await prisma.member.findUnique({
      where: { id: req.session.memberId },
    });
    if (!member) {
      delete req.session.memberId;
      return res.status(401).json({ error: "로그인이 필요합니다." });
    }
    res.json(serializeMember(member));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
