const express = require("express");
const prisma = require("../prismaClient");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

function validateProductInput(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  if (!partial || body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      errors.push("제품명은 필수입니다.");
    } else {
      data.name = name;
    }
  }

  if (!partial || body.price !== undefined) {
    const price = body.price;
    const priceNum = Number(price);
    if (
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isInteger(priceNum) ||
      priceNum < 0
    ) {
      errors.push("가격은 0 이상의 정수여야 합니다.");
    } else {
      data.price = priceNum;
    }
  }

  if (body.summary !== undefined) {
    data.summary = body.summary === null ? null : String(body.summary);
  }
  if (body.description !== undefined) {
    data.description =
      body.description === null ? null : String(body.description);
  }
  if (body.imageUrl !== undefined) {
    data.imageUrl = body.imageUrl === null ? null : String(body.imageUrl);
  }

  return { errors, data };
}

// GET /api/products
router.get("/", async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "잘못된 제품 ID입니다." });
    }
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: "제품을 찾을 수 없습니다." });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products (관리자 전용)
router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const { errors, data } = validateProductInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }
    const product = await prisma.product.create({ data });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id (관리자 전용)
router.put("/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "잘못된 제품 ID입니다." });
    }
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "제품을 찾을 수 없습니다." });
    }

    const { errors, data } = validateProductInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    const product = await prisma.product.update({ where: { id }, data });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id (관리자 전용)
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "잘못된 제품 ID입니다." });
    }
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "제품을 찾을 수 없습니다." });
    }
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
