import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: any, res: any): number | null {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

router.get("/", async (req: any, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  const rows = await db.select().from(notificationsTable).where(eq(notificationsTable.userId, userId));
  return res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt?.toISOString() })));
});

router.patch("/", async (req: any, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  await db.update(notificationsTable).set({ read: true }).where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.read, false)));
  return res.json({ success: true, message: "All notifications marked as read" });
});

export default router;
