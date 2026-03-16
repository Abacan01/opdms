import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { doctorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const rows = await db.select().from(doctorsTable);
  return res.json(rows.map((r) => ({
    ...r,
    services: JSON.parse(r.services || "[]"),
    availableSlots: JSON.parse(r.availableSlots || "[]"),
  })));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, id)).limit(1);
  if (!doctor) return res.status(404).json({ error: "Doctor not found" });
  return res.json({
    ...doctor,
    services: JSON.parse(doctor.services || "[]"),
    availableSlots: JSON.parse(doctor.availableSlots || "[]"),
  });
});

export default router;
