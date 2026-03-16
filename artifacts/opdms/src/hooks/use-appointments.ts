import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays } from "date-fns";

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  appointmentType: string;
  service: string;
  symptoms?: string;
  status: "upcoming" | "completed" | "cancelled";
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const initialAppointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    doctorId: 101,
    doctorName: "Dr. John Doe De Castro",
    specialization: "Cardiologist",
    date: format(addDays(new Date(), 2), "yyyy-MM-dd"),
    time: "10:00 AM",
    appointmentType: "Consultation",
    service: "General Consultation",
    symptoms: "Mild chest pain",
    status: "upcoming"
  },
  {
    id: 2,
    patientId: 1,
    doctorId: 103,
    doctorName: "Dra. D.Hessa Ackerman",
    specialization: "Physical Therapist",
    date: format(addDays(new Date(), 5), "yyyy-MM-dd"),
    time: "02:00 PM",
    appointmentType: "Physical Therapy",
    service: "Physical Therapy Session",
    status: "upcoming"
  }
];

// Initialize localStorage if empty
if (!localStorage.getItem("opdms_appointments")) {
  localStorage.setItem("opdms_appointments", JSON.stringify(initialAppointments));
}

export function useAppointments() {
  const queryClient = useQueryClient();

  const getAppointments = () => {
    return JSON.parse(localStorage.getItem("opdms_appointments") || "[]") as Appointment[];
  };

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      await delay(400);
      return getAppointments();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newAppt: Omit<Appointment, "id" | "status" | "patientId">) => {
      await delay(600);
      const current = getAppointments();
      const appointment: Appointment = {
        ...newAppt,
        id: Date.now(),
        patientId: 1,
        status: "upcoming"
      };
      localStorage.setItem("opdms_appointments", JSON.stringify([...current, appointment]));
      return appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: Partial<Appointment> }) => {
      await delay(500);
      const current = getAppointments();
      const updated = current.map(appt => appt.id === id ? { ...appt, ...updates } : appt);
      localStorage.setItem("opdms_appointments", JSON.stringify(updated));
      return updated.find(a => a.id === id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
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
