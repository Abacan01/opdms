import { Router, Response } from "express";
import { adminDb } from "../firebase";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const appointmentRoutes = Router();

appointmentRoutes.use(requireAuth);

// GET /api/appointments
appointmentRoutes.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await adminDb
      .collection("appointments")
      .where("patientId", "==", req.uid)
      .orderBy("date", "asc")
      .get();
    const appointments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(appointments);
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/appointments
appointmentRoutes.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body, patientId: req.uid, status: "upcoming", createdAt: new Date().toISOString() };
    const ref = await adminDb.collection("appointments").add(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// PATCH /api/appointments/:id
appointmentRoutes.patch("/:id", async (req: AuthRequest, res: Response) => {
  try {
    await adminDb.collection("appointments").doc(req.params.id).update(req.body);
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// DELETE /api/appointments/:id
appointmentRoutes.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    await adminDb.collection("appointments").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
});
