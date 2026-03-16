import { Router, Response } from "express";
import { adminDb } from "../firebase";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const recordRoutes = Router();

recordRoutes.use(requireAuth);

// GET /api/records
recordRoutes.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await adminDb
      .collection("medical_records")
      .where("patientId", "==", req.uid)
      .orderBy("date", "desc")
      .get();
    const records = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(records);
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/records/:id
recordRoutes.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const doc = await adminDb.collection("medical_records").doc(req.params.id).get();
    if (!doc.exists) {
      res.status(404).json({ error: "Record not found" });
      return;
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});
