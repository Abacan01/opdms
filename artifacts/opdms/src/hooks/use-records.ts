import { useQuery } from "@tanstack/react-query";

export interface MedicalRecord {
  id: number;
  patientId: number;
  patientName: string;
  patientAddress: string;
  patientAge: number;
  patientSex: string;
  doctorName: string;
  clinicName: string;
  clinicSchedule: string;
  diagnosis: string;
  prescription: string;
  prescriptionInstructions: string;
  recordType: "prescription" | "lab_result" | "consultation" | "treatment_plan";
  date: string;
  licenseNo: string;
  ptrNo: string;
}

const mockRecords: MedicalRecord[] = [
  {
    id: 201,
    patientId: 1,
    patientName: "John Doe",
    patientAddress: "123 Hilltop, Batangas City",
    patientAge: 32,
    patientSex: "M",
    doctorName: "Dr. John Doe De Castro",
    clinicName: "Don Juan Medical Center",
    clinicSchedule: "M, T, W, TH, Sat 9:00am-3:00pm",
    diagnosis: "Essential Hypertension",
    prescription: "Amlodipine 5mg Tab",
    prescriptionInstructions: "Take 1 tablet once a day in the morning.",
    recordType: "prescription",
    date: "2024-03-10",
    licenseNo: "LIC-123456",
    ptrNo: "PTR-987654"
  },
  {
    id: 202,
    patientId: 1,
    patientName: "John Doe",
    patientAddress: "123 Hilltop, Batangas City",
    patientAge: 32,
    patientSex: "M",
    doctorName: "Dra. Maria Santos",
    clinicName: "Don Juan Medical Center",
    clinicSchedule: "M-F 8:00am-5:00pm",
    diagnosis: "Upper Respiratory Tract Infection",
    prescription: "Co-Amoxiclav 625mg Tab\nParacetamol 500mg Tab",
    prescriptionInstructions: "Co-Amoxiclav: 1 tablet every 8 hours for 7 days.\nParacetamol: 1 tablet every 4 hours for fever.",
    recordType: "prescription",
    date: "2024-02-15",
    licenseNo: "LIC-654321",
    ptrNo: "PTR-456789"
  }
];

export function useRecords() {
  return useQuery({
    queryKey: ["records"],
    queryFn: async () => {
      return new Promise<MedicalRecord[]>((resolve) => {
        setTimeout(() => resolve(mockRecords), 400);
      });
    },
  });
}
