const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../prismaClient");

const router = express.Router();

const TITLE_MAX = 100;
const CONTENT_MAX = 5000;
const GUEST_PASSWORD_MIN = 4;
const BOARD_TYPES = ["FREE", "MEMBER"];

function serializePost(post) {
  return {
    id: post.id,
    boardType: post.boardType,
    title: post.title,
    author: post.author,
    content: post.content,
    authorMemberId: post.authorMemberId,
    isGuest: !post.authorMemberId,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

// 회원 전용 게시판은 로그인(회원 또는 관리자)해야 조회 가능
function canAccessBoard(req, boardType) {
  if (boardType === "MEMBER") {
    return Boolean(req.session.memberId || req.session.isAdmin);
  }
  return true;
}

function validatePostContent(body) {
  const errors = [];
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!title) {
    errors.push("제목은 필수입니다.");
  } else if (title.length > TITLE_MAX) {
    errors.push(`제목은 ${TITLE_MAX}자를 초과할 수 없습니다.`);
  }

  if (!content) {
    errors.push("내용은 필수입니다.");
  } else if (content.length > CONTENT_MAX) {
    errors.push(`내용은 ${CONTENT_MAX}자를 초과할 수 없습니다.`);
  }

  return { errors, title, content };
}

// GET /api/posts?boardType=FREE|MEMBER
router.get("/", async (req, res, next) => {
  try {
    const boardType = req.query.boardType === "MEMBER" ? "MEMBER" : "FREE";
    if (!canAccessBoard(req, boardType)) {
      return res
        .status(401)
        .json({ error: "회원 전용 게시판은 로그인 후 이용할 수 있습니다." });
    }

    const posts = await prisma.post.findMany({
      where: { boardType },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { comments: true, reactions: true } } },
    });

    res.json(
      posts.map((p) => ({
        ...serializePost(p),
        commentCount: p._count.comments,
        reactionCount: p._count.reactions,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "잘못된 게시글 ID입니다." });
    }
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }
    if (!canAccessBoard(req, post.boardType)) {
      return res
        .status(401)
        .json({ error: "회원 전용 게시판은 로그인 후 이용할 수 있습니다." });
    }
    res.json(serializePost(post));
  } catch (err) {
    next(err);
  }
});

// POST /api/posts
router.post("/", async (req, res, next) => {
  try {
    const boardType = BOARD_TYPES.includes(req.body.boardType)
      ? req.body.boardType
      : "FREE";
    const { errors, title, content } = validatePostContent(req.body);

    const memberId = req.session.memberId || null;

    if (boardType === "MEMBER" && !memberId) {
      return res
        .status(401)
        .json({ error: "회원 전용 게시판은 로그인 후 글을 작성할 수 있습니다." });
    }

    let author;
    let authorMemberId = null;
    let guestPasswordHash = null;

    if (memberId) {
      const member = await prisma.member.findUnique({ where: { id: memberId } });
      if (!member) {
        return res.status(401).json({ error: "로그인이 필요합니다." });
      }
      author = member.name;
      authorMemberId = member.id;
    } else {
      const name = typeof req.body.author === "string" ? req.body.author.trim() : "";
      const guestPassword = req.body.guestPassword;
      if (!name) errors.push("작성자 이름은 필수입니다.");
      if (!guestPassword || String(guestPassword).length < GUEST_PASSWORD_MIN) {
        errors.push(
          `비밀번호는 ${GUEST_PASSWORD_MIN}자 이상 입력해주세요. (글 수정·삭제 시 필요합니다)`
        );
      }
      author = name;
      if (guestPassword) {
        guestPasswordHash = await bcrypt.hash(String(guestPassword), 10);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    const post = await prisma.post.create({
      data: {
        boardType,
        title,
        content,
        author,
        authorMemberId,
        guestPasswordHash,
      },
    });

    res.status(201).json(serializePost(post));
  } catch (err) {
    next(err);
  }
});

// 게시글 수정/삭제 권한 확인: 관리자 > 작성자 회원 본인 > 비회원 글은 비밀번호 확인
async function checkOwnership(req, post) {
  if (req.session.isAdmin) return { ok: true };

  if (post.authorMemberId) {
    if (req.session.memberId === post.authorMemberId) return { ok: true };
    return {
      ok: false,
      status: 403,
      error: "본인이 작성한 글만 수정·삭제할 수 있습니다.",
    };
  }

  const password = req.body ? req.body.guestPassword : undefined;
  if (!password) {
    return { ok: false, status: 400, error: "글 비밀번호를 입력해주세요." };
  }
  const match = await bcrypt.compare(String(password), post.guestPasswordHash || "");
  if (!match) {
    return { ok: false, status: 403, error: "비밀번호가 일치하지 않습니다." };
  }
  return { ok: true };
}

// PUT /api/posts/:id
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "잘못된 게시글 ID입니다." });
    }
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    const ownership = await checkOwnership(req, existing);
    if (!ownership.ok) {
      return res.status(ownership.status).json({ error: ownership.error });
    }

    const { errors, title, content } = validatePostContent(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    const post = await prisma.post.update({ where: { id }, data: { title, content } });
    res.json(serializePost(post));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/posts/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "잘못된 게시글 ID입니다." });
    }
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    const ownership = await checkOwnership(req, existing);
    if (!ownership.ok) {
      return res.status(ownership.status).json({ error: ownership.error });
    }

    await prisma.post.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
