import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const recordsTable = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  patientName: text("patient_name").notNull(),
  patientAddress: text("patient_address"),
  patientAge: integer("patient_age"),
  patientSex: text("patient_sex"),
  doctorName: text("doctor_name").notNull(),
  clinicName: text("clinic_name"),
  clinicSchedule: text("clinic_schedule"),
  diagnosis: text("diagnosis"),
  prescription: text("prescription"),
  prescriptionInstructions: text("prescription_instructions"),
  recordType: text("record_type").notNull().default("prescription"),
  date: text("date").notNull(),
  licenseNo: text("license_no"),
  ptrNo: text("ptr_no"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRecordSchema = createInsertSchema(recordsTable).omit({ id: true, createdAt: true });
export type InsertRecord = z.infer<typeof insertRecordSchema>;
export type MedicalRecord = typeof recordsTable.$inferSelect;
