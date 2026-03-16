import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./use-auth";
import { differenceInYears, isValid, parseISO } from "date-fns";

export interface PatientProfile {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  age?: number;
  birthday?: string;
  sex?: string;
  address?: string;
  contactNumber?: string;
  lastVisit?: string;
}

export function usePatients() {
  const { user } = useAuth();

  return useQuery<PatientProfile[]>({
    queryKey: ["patients", user?.uid, user?.role],
    enabled: !!user && user.role === "staff",
    queryFn: async () => {
      const usersRef = collection(db, "users");
      const patientsSnap = await getDocs(query(usersRef, where("role", "==", "patient")));
      const appointmentsRef = collection(db, "appointments");
      const [assignedSnap, legacyDoctorSnap] = await Promise.all([
        getDocs(query(appointmentsRef, where("assignedStaffId", "==", user?.uid))),
        getDocs(query(appointmentsRef, where("doctorId", "==", user?.uid))),
      ]);

      const appointments = Array.from(
        new Map([...assignedSnap.docs, ...legacyDoctorSnap.docs].map((d) => [d.id, d])).values()
      );

      const assignedPatientIds = new Set<string>();

      const latestVisitByPatient = new Map<string, string>();
      appointments.forEach((apptDoc) => {
        const appt = apptDoc.data() as { patientId?: string; date?: string };
        if (!appt.patientId || !appt.date) return;

        assignedPatientIds.add(appt.patientId);

        const prev = latestVisitByPatient.get(appt.patientId);
        if (!prev || appt.date > prev) {
          latestVisitByPatient.set(appt.patientId, appt.date);
        }
      });

      return patientsSnap.docs
        .filter((docSnap) => assignedPatientIds.has(docSnap.id))
        .map((docSnap) => {
        const data = docSnap.data() as Omit<PatientProfile, "id">;
        const fallbackName = `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() || "Unknown Patient";
        const parsedBirthday = data.birthday ? parseISO(data.birthday) : null;
        const computedAge =
          typeof data.age === "number"
            ? data.age
            : parsedBirthday && isValid(parsedBirthday)
              ? Math.max(0, differenceInYears(new Date(), parsedBirthday))
              : undefined;
        return {
          id: docSnap.id,
          ...data,
          age: computedAge,
          name: data.name || fallbackName,
          lastVisit: latestVisitByPatient.get(docSnap.id),
        } as PatientProfile;
      });
    },
  });
}
