const express = require("express");
const prisma = require("../prismaClient");

// { mergeParams: true } - 상위 라우터(/api/posts/:postId/reactions)의 postId 파라미터를 사용하기 위함
const router = express.Router({ mergeParams: true });

const EMOJI_KEYS = ["LIKE", "LOVE", "HAHA", "WOW", "SAD", "CLAP"];

async function loadAccessiblePost(req, res) {
  const postId = Number(req.params.postId);
  if (!Number.isInteger(postId)) {
    res.status(400).json({ error: "잘못된 게시글 ID입니다." });
    return null;
  }
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    return null;
  }
  if (post.boardType === "MEMBER" && !req.session.memberId && !req.session.isAdmin) {
    res
      .status(401)
      .json({ error: "회원 전용 게시판은 로그인 후 이용할 수 있습니다." });
    return null;
  }
  return post;
}

async function buildSummary(postId, viewerMemberId) {
  const reactions = await prisma.reaction.findMany({ where: { postId } });
  const counts = {};
  EMOJI_KEYS.forEach((key) => {
    counts[key] = 0;
  });
  const mine = [];
  reactions.forEach((r) => {
    counts[r.emoji] = (counts[r.emoji] || 0) + 1;
    if (viewerMemberId && r.memberId === viewerMemberId) {
      mine.push(r.emoji);
    }
  });
  return { counts, mine };
}

// GET /api/posts/:postId/reactions
router.get("/", async (req, res, next) => {
  try {
    const post = await loadAccessiblePost(req, res);
    if (!post) return;
    const summary = await buildSummary(post.id, req.session.memberId || null);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:postId/reactions - 로그인한 회원이 반응을 토글(추가/취소)
router.post("/", async (req, res, next) => {
  try {
    const post = await loadAccessiblePost(req, res);
    if (!post) return;

    if (!req.session.memberId) {
      return res.status(401).json({ error: "로그인 후 반응을 남길 수 있습니다." });
    }

    const emoji = req.body.emoji;
    if (!EMOJI_KEYS.includes(emoji)) {
      return res.status(400).json({ error: "지원하지 않는 이모지입니다." });
    }

    const memberId = req.session.memberId;
    const existing = await prisma.reaction.findUnique({
      where: {
        postId_memberId_emoji: { postId: post.id, memberId, emoji },
      },
    });

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
    } else {
      await prisma.reaction.create({ data: { postId: post.id, memberId, emoji } });
    }

    const summary = await buildSummary(post.id, memberId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
