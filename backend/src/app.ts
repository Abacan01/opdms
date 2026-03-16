import express from "express";
import cors from "cors";
import { healthRoutes } from "./routes/health";
import { authRoutes } from "./routes/auth";
import { appointmentRoutes } from "./routes/appointments";
import { doctorRoutes } from "./routes/doctors";
import { recordRoutes } from "./routes/records";
import { articleRoutes } from "./routes/articles";
import { notificationRoutes } from "./routes/notifications";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/notifications", notificationRoutes);

export default app;
