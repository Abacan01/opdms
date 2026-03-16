import { Router, Response } from "express";
import { adminDb } from "../firebase";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const notificationRoutes = Router();

notificationRoutes.use(requireAuth);

// GET /api/notifications
notificationRoutes.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await adminDb
      .collection("notifications")
      .where("userId", "==", req.uid)
      .orderBy("createdAt", "desc")
      .get();
    const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(notifications);
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PATCH /api/notifications — mark all as read
notificationRoutes.patch("/", async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await adminDb
      .collection("notifications")
      .where("userId", "==", req.uid)
      .where("read", "==", false)
      .get();
    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => batch.update(doc.ref, { read: true }));
    await batch.commit();
    res.json({ success: true, updated: snapshot.size });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});
