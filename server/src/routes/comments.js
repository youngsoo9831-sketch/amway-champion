const express = require("express");
const prisma = require("../prismaClient");

// { mergeParams: true } - 상위 라우터(/api/posts/:postId/comments)의 postId 파라미터를 사용하기 위함
const router = express.Router({ mergeParams: true });

const CONTENT_MAX = 1000;

function serializeComment(c) {
  return {
    id: c.id,
    postId: c.postId,
    content: c.content,
    author: c.author,
    authorMemberId: c.authorMemberId,
    createdAt: c.createdAt,
  };
}

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

// GET /api/posts/:postId/comments
router.get("/", async (req, res, next) => {
  try {
    const post = await loadAccessiblePost(req, res);
    if (!post) return;

    const comments = await prisma.comment.findMany({
      where: { postId: post.id },
      orderBy: { createdAt: "asc" },
    });
    res.json(comments.map(serializeComment));
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:postId/comments
router.post("/", async (req, res, next) => {
  try {
    const post = await loadAccessiblePost(req, res);
    if (!post) return;

    const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
    if (!content) {
      return res.status(400).json({ error: "댓글 내용을 입력해주세요." });
    }
    if (content.length > CONTENT_MAX) {
      return res
        .status(400)
        .json({ error: `댓글은 ${CONTENT_MAX}자를 초과할 수 없습니다.` });
    }

    const memberId = req.session.memberId || null;

    if (post.boardType === "MEMBER" && !memberId) {
      return res.status(401).json({ error: "로그인이 필요합니다." });
    }

    let author;
    let authorMemberId = null;

    if (memberId) {
      const member = await prisma.member.findUnique({ where: { id: memberId } });
      if (!member) {
        return res.status(401).json({ error: "로그인이 필요합니다." });
      }
      author = member.name;
      authorMemberId = member.id;
    } else {
      const name = typeof req.body.author === "string" ? req.body.author.trim() : "";
      if (!name) {
        return res.status(400).json({ error: "작성자 이름을 입력해주세요." });
      }
      author = name;
    }

    const comment = await prisma.comment.create({
      data: { postId: post.id, content, author, authorMemberId },
    });
    res.status(201).json(serializeComment(comment));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/posts/:postId/comments/:commentId
router.delete("/:commentId", async (req, res, next) => {
  try {
    const post = await loadAccessiblePost(req, res);
    if (!post) return;

    const commentId = Number(req.params.commentId);
    if (!Number.isInteger(commentId)) {
      return res.status(400).json({ error: "잘못된 댓글 ID입니다." });
    }

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.postId !== post.id) {
      return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
    }

    if (req.session.isAdmin) {
      // 관리자는 항상 삭제 가능
    } else if (comment.authorMemberId) {
      if (req.session.memberId !== comment.authorMemberId) {
        return res
          .status(403)
          .json({ error: "본인이 작성한 댓글만 삭제할 수 있습니다." });
      }
    } else {
      return res
        .status(403)
        .json({ error: "비회원이 작성한 댓글은 관리자만 삭제할 수 있습니다." });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
