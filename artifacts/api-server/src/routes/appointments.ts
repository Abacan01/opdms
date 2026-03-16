import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { appointmentsTable, doctorsTable, notificationsTable } from "@workspace/db";
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
  const rows = await db.select().from(appointmentsTable).where(eq(appointmentsTable.patientId, userId));
  return res.json(rows.map((r) => ({
    ...r,
    createdAt: r.createdAt?.toISOString(),
  })));
});

router.post("/", async (req: any, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  const { doctorId, date, time, appointmentType, service, symptoms } = req.body;
  if (!doctorId || !date || !time || !appointmentType || !service) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, doctorId)).limit(1);
  if (!doctor) return res.status(404).json({ error: "Doctor not found" });

  const [appt] = await db.insert(appointmentsTable).values({
    patientId: userId,
    doctorId,
    doctorName: doctor.name,
    specialization: doctor.specialization,
    date,
    time,
    appointmentType,
    service,
    symptoms: symptoms || null,
    status: "upcoming",
  }).returning();

  await db.insert(notificationsTable).values({
    userId,
    title: "Appointment Confirmed",
    message: `Your ${appointmentType} appointment with ${doctor.name} on ${date} at ${time} has been confirmed.`,
    type: "appointment",
    read: false,
  });

  return res.status(201).json({ ...appt, createdAt: appt.createdAt?.toISOString() });
});

router.get("/:id", async (req: any, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  const id = parseInt(req.params.id);
  const [appt] = await db.select().from(appointmentsTable).where(and(eq(appointmentsTable.id, id), eq(appointmentsTable.patientId, userId))).limit(1);
  if (!appt) return res.status(404).json({ error: "Appointment not found" });
  return res.json({ ...appt, createdAt: appt.createdAt?.toISOString() });
});

router.patch("/:id", async (req: any, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  const id = parseInt(req.params.id);
  const { date, time, status } = req.body;
  const updates: any = {};
  if (date) updates.date = date;
  if (time) updates.time = time;
  if (status) updates.status = status;
  const [appt] = await db.update(appointmentsTable).set(updates).where(and(eq(appointmentsTable.id, id), eq(appointmentsTable.patientId, userId))).returning();
  if (!appt) return res.status(404).json({ error: "Appointment not found" });
  return res.json({ ...appt, createdAt: appt.createdAt?.toISOString() });
});

router.delete("/:id", async (req: any, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  const id = parseInt(req.params.id);
  await db.update(appointmentsTable).set({ status: "cancelled" }).where(and(eq(appointmentsTable.id, id), eq(appointmentsTable.patientId, userId)));
  return res.json({ success: true, message: "Appointment cancelled" });
});

export default router;
