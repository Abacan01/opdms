import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const appointmentsTable = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  doctorName: text("doctor_name").notNull(),
  specialization: text("specialization").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  appointmentType: text("appointment_type").notNull(),
  service: text("service").notNull(),
  symptoms: text("symptoms"),
  status: text("status").notNull().default("upcoming"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointmentsTable).omit({ id: true, createdAt: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointmentsTable.$inferSelect;
