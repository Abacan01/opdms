import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
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
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  createdByStaffId?: string;
}

export function useRecords() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const cacheKey = ["records", user?.uid, user?.role];

  const recordsQuery = useQuery<MedicalRecord[]>({
    queryKey: cacheKey,
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      if (user.role !== "staff") {
        const q = query(collection(db, "medical_records"), where("patientId", "==", user.uid));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MedicalRecord);
      }

      const q = query(collection(db, "medical_records"), where("createdByStaffId", "==", user.uid));
      try {
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MedicalRecord);
      } catch (err) {
        console.error("Index error or no records", err);
        return [];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (record: Omit<MedicalRecord, "id">) => {
      const payload = {
        ...record,
        createdByStaffId: user?.role === "staff" ? user.uid : undefined,
        createdAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, "medical_records"), payload);
      return { id: ref.id, ...record } as MedicalRecord;
    },
    onSuccess: (created) => {
      queryClient.setQueryData<MedicalRecord[]>(cacheKey, (current = []) => [created, ...current]);
    },
  });

  return {
    ...recordsQuery,
    createRecord: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
