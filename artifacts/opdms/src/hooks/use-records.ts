import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./use-auth";

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientAddress?: string;
  patientAge?: number;
  patientSex?: string;
  doctorName: string;
  clinicName?: string;
  clinicSchedule?: string;
  diagnosis?: string;
  prescription?: string;
  prescriptionInstructions?: string;
  recordType: "prescription" | "lab_result" | "consultation" | "treatment_plan";
  date: string;
  licenseNo?: string;
  ptrNo?: string;
}

const MOCK_RECORDS: MedicalRecord[] = [
  {
    id: "r1",
    patientId: "demo",
    patientName: "John D. Doe",
    patientAddress: "Hilltop Batangas City",
    patientAge: 20,
    patientSex: "Male",
    doctorName: "Juan Dela Cruz, MD",
    clinicName: "Don Juan Medical Center",
    clinicSchedule: "M, T, W, TH, Sat 9:00am-3:00pm",
    diagnosis: "Vitamin deficiency",
    prescription: "Vitamin C syrup",
    prescriptionInstructions: "Once a day after breakfast",
    recordType: "prescription",
    date: "19-04-2025",
    licenseNo: "LIC-2024-001",
    ptrNo: "PTR-2024-001",
  },
  {
    id: "r2",
    patientId: "demo",
    patientName: "John D. Doe",
    patientAddress: "Hilltop Batangas City",
    patientAge: 20,
    patientSex: "Male",
    doctorName: "Dr. Maria Santos",
    clinicName: "Don Juan Medical Center",
    clinicSchedule: "M-F 8:00am-5:00pm",
    diagnosis: "General wellness",
    prescription: "Multivitamins",
    prescriptionInstructions: "Once a day after meals",
    recordType: "prescription",
    date: "15-03-2025",
    licenseNo: "LIC-2024-002",
    ptrNo: "PTR-2024-002",
  },
  {
    id: "r3",
    patientId: "demo",
    patientName: "John D. Doe",
    patientAddress: "Hilltop Batangas City",
    patientAge: 20,
    patientSex: "Male",
    doctorName: "Dra. Jasper Jean Mariano",
    clinicName: "Don Juan Medical Center",
    clinicSchedule: "M, T, W, TH, Sat 8:00am-3:00pm",
    diagnosis: "Routine cardiac check",
    recordType: "consultation",
    date: "10-02-2025",
    licenseNo: "LIC-2024-003",
    ptrNo: "PTR-2024-003",
  },
  {
    id: "r4",
    patientId: "demo",
    patientName: "John D. Doe",
    patientAddress: "Hilltop Batangas City",
    patientAge: 20,
    patientSex: "Male",
    doctorName: "Dra. D.Hessa Ackerman",
    clinicName: "Don Juan Medical Center",
    clinicSchedule: "M, W, F 9:00am-5:00pm",
    diagnosis: "Mild back strain",
    recordType: "treatment_plan",
    date: "05-01-2025",
    licenseNo: "LIC-2024-004",
    ptrNo: "PTR-2024-004",
  },
];

export function useRecords() {
  const { user } = useAuth();

  return useQuery<MedicalRecord[]>({
    queryKey: ["records", user?.uid],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      try {
        const q = query(
          collection(db, "medical_records"),
          where("patientId", "==", user.uid)
        );
        const snap = await getDocs(q);
        if (snap.empty) {
          return MOCK_RECORDS;
        }
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as MedicalRecord));
      } catch {
        return MOCK_RECORDS;
      }
    },
  });
}
