import { Router, Request, Response } from "express";
import { adminDb } from "../firebase";

export const doctorRoutes = Router();

// GET /api/doctors
doctorRoutes.get("/", async (_req: Request, res: Response) => {
  try {
    const snapshot = await adminDb.collection("doctors").get();
    const doctors = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(doctors);
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/doctors/:id
doctorRoutes.get("/:id", async (req: Request, res: Response) => {
  try {
    const doc = await adminDb.collection("doctors").doc(req.params.id).get();
    if (!doc.exists) {
      res.status(404).json({ error: "Doctor not found" });
      return;
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});
