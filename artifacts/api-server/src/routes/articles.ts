import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { articlesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const rows = await db.select().from(articlesTable);
  return res.json(rows.map((r) => ({ ...r, publishedAt: r.publishedAt?.toISOString() })));
});

export default router;
