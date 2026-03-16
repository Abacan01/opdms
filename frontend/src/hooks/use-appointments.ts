import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  documentId,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./use-auth";
import { format, parse } from "date-fns";


export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: number;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  appointmentType: string;
  service: string;
  symptoms?: string;
  status: "pending" | "upcoming" | "completed" | "cancelled";
  createdAt?: any;
}

export function formatAppointmentTime(time: string) {
  if (!time) return "";
  try {
    return format(parse(time, "HH:mm", new Date()), "h:mm a");
  } catch {
    return time;
  }
}

export function useAppointments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const cacheKey = ["appointments", user?.uid, user?.role];

  const sortAppointments = (items: Appointment[]) => {
    return [...items].sort((a, b) => {
      const aKey = `${a.date || ""}T${a.time || "00:00"}`;
      const bKey = `${b.date || ""}T${b.time || "00:00"}`;
      return aKey.localeCompare(bKey);
    });
  };

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: cacheKey,
    enabled: !!user,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!user) return [];

      const col = collection(db, "appointments");
      if (user.role === "staff") {
        const snap = await getDocs(col);
        const mapped = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
        const patientIds = Array.from(new Set(mapped.map((appt) => appt.patientId).filter(Boolean)));

        if (patientIds.length === 0) {
          return sortAppointments(mapped);
        }

        const chunks: string[][] = [];
        for (let i = 0; i < patientIds.length; i += 10) {
          chunks.push(patientIds.slice(i, i + 10));
        }

        const patientMap = new Map<string, string>();
        await Promise.all(
          chunks.map(async (ids) => {
            const usersQ = query(collection(db, "users"), where(documentId(), "in", ids));
            const usersSnap = await getDocs(usersQ);
            usersSnap.forEach((u) => {
              const data = u.data() as { name?: string; firstName?: string; lastName?: string };
              const displayName =
                data.name ||
                `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() ||
                "Unknown Patient";
              patientMap.set(u.id, displayName);
            });
          })
        );

        return sortAppointments(
          mapped.map((appt) => ({
            ...appt,
            patientName: patientMap.get(appt.patientId) || appt.patientName || "Unknown Patient",
          }))
        );
      }

      const baseQuery = query(col, where("patientId", "==", user.uid));

      try {
        const indexedQuery = query(baseQuery, orderBy("date", "asc"));
        const snap = await getDocs(indexedQuery);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
      } catch {
        // Fallback when a composite index is missing: fetch then sort locally.
        const snap = await getDocs(baseQuery);
        const mapped = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
        return sortAppointments(mapped);
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newAppt: Omit<Appointment, "id" | "status" | "patientId" | "createdAt">) => {
      if (!user) throw new Error("Not authenticated");
      const docRef = await addDoc(collection(db, "appointments"), {
        ...newAppt,
        patientId: user.uid,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "notifications"), {
        userId: user.uid,
        title: "Appointment Submitted",
        message: `Your ${newAppt.appointmentType} with ${newAppt.doctorName} on ${newAppt.date} at ${newAppt.time} is pending staff confirmation.`,
        type: "appointment",
        read: false,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...newAppt, patientId: user.uid, status: "pending" as const };
    },
    onSuccess: (created) => {
      queryClient.setQueryData<Appointment[]>(cacheKey, (current = []) =>
        sortAppointments([...current, created])
      );
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.uid] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Appointment> }) => {
      await updateDoc(doc(db, "appointments", id), updates);
      return { id, ...updates };
    },
    onSuccess: ({ id, ...updates }) => {
      queryClient.setQueryData<Appointment[]>(cacheKey, (current = []) =>
        sortAppointments(
          current.map((appt) => (appt.id === id ? ({ ...appt, ...updates } as Appointment) : appt))
        )
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "appointments", id));
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Appointment[]>(cacheKey, (current = []) =>
        current.filter((appt) => appt.id !== id)
      );
    },
  });

  return {
    appointments,
    isLoading,
    createAppointment: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateAppointment: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteAppointment: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
