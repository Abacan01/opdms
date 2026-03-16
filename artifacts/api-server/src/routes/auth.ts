import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    return res.status(400).json({ error: "Email already registered" });
  }
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash: hashPassword(password),
    role: role || "patient",
  }).returning();
  req.session = req.session || {};
  (req as any).session.userId = user.id;
  return res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
    message: "Registered successfully",
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  (req as any).session = (req as any).session || {};
  (req as any).session.userId = user.id;
  return res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
    message: "Logged in successfully",
  });
});

router.post("/logout", (req, res) => {
  (req as any).session = null;
  return res.json({ success: true, message: "Logged out" });
});

router.get("/me", async (req, res) => {
  const userId = (req as any).session?.userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) return res.status(401).json({ error: "User not found" });
  return res.json({ id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl });
});

export default router;
