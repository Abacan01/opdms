import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./use-auth";
import { format, addDays } from "date-fns";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: number;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  appointmentType: string;
  service: string;
  symptoms?: string;
  status: "upcoming" | "completed" | "cancelled";
  createdAt?: any;
}

export function useAppointments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["appointments", user?.uid],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const q = query(
        collection(db, "appointments"),
        where("patientId", "==", user.uid),
        orderBy("date", "asc")
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newAppt: Omit<Appointment, "id" | "status" | "patientId" | "createdAt">) => {
      if (!user) throw new Error("Not authenticated");
      const docRef = await addDoc(collection(db, "appointments"), {
        ...newAppt,
        patientId: user.uid,
        status: "upcoming",
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "notifications"), {
        userId: user.uid,
        title: "Appointment Confirmed",
        message: `Your ${newAppt.appointmentType} with ${newAppt.doctorName} on ${newAppt.date} at ${newAppt.time} is confirmed.`,
        type: "appointment",
        read: false,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...newAppt, patientId: user.uid, status: "upcoming" as const };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", user?.uid] });
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.uid] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Appointment> }) => {
      await updateDoc(doc(db, "appointments", id), updates);
      return { id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", user?.uid] });
    },
  });

  return {
    appointments,
    isLoading,
    createAppointment: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateAppointment: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
