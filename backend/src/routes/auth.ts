import { Router, Request, Response } from "express";
import { adminAuth, adminDb } from "../firebase";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const authRoutes = Router();

// POST /api/auth/register
authRoutes.post("/register", async (req: Request, res: Response) => {
  const { name, email, password, role = "patient" } = req.body;
  try {
    const userRecord = await adminAuth.createUser({ email, password, displayName: name });
    await adminDb.collection("users").doc(userRecord.uid).set({
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ uid: userRecord.uid, name, email, role });
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// GET /api/auth/me
authRoutes.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await adminDb.collection("users").doc(req.uid!).get();
    if (!doc.exists) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ uid: req.uid, ...doc.data() });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/auth/logout — client handles Firebase signOut; this is a no-op
authRoutes.post("/logout", (_req, res) => {
  res.json({ success: true });
});
