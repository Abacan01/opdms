import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { recordsTable } from "@workspace/db";
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
  const rows = await db.select().from(recordsTable).where(eq(recordsTable.patientId, userId));
  return res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt?.toISOString() })));
});

router.get("/:id", async (req: any, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  const id = parseInt(req.params.id);
  const [record] = await db.select().from(recordsTable).where(and(eq(recordsTable.id, id), eq(recordsTable.patientId, userId))).limit(1);
  if (!record) return res.status(404).json({ error: "Record not found" });
  return res.json({ ...record, createdAt: record.createdAt?.toISOString() });
});

export default router;
