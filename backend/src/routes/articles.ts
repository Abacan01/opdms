import { Router, Request, Response } from "express";
import { adminDb } from "../firebase";

export const articleRoutes = Router();

// GET /api/articles
articleRoutes.get("/", async (_req: Request, res: Response) => {
  try {
    const snapshot = await adminDb.collection("articles").orderBy("publishedAt", "desc").get();
    const articles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(articles);
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message });
  }
});
