import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  clinicSchedule: string;
  avatarUrl?: string;
  services: string[];
  officeAddress?: string;
  phone?: string;
  email?: string;
  whyMe?: string;
  specializationDesc?: string;
}

export function useDoctors() {
  const [data, setData] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (usersSnap) => {
      const staffUsers = usersSnap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }))
        .filter((u) => {
          const role = String(u.role ?? "").toLowerCase();
          return role === "staff" || role.includes("medical") || role.includes("doctor") || role.includes("pract");
        });

      const mapped = staffUsers.map((u) => {
        const fullName = String(u.name || `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "Medical Practitioner");
        const servicesRaw = Array.isArray(u.servicesOffered)
          ? u.servicesOffered
          : String(u.servicesOffered || "").split(",").map((s) => s.trim()).filter(Boolean);

        return {
          id: String(u.id),
          name: fullName,
          specialization: String(u.specialization || "General Practice"),
          clinicSchedule: String(u.clinicSchedule || "Mon-Sat 8:00 AM - 5:00 PM"),
          avatarUrl: typeof u.avatarUrl === "string" ? u.avatarUrl : undefined,
          services: servicesRaw.length > 0 ? servicesRaw : ["General Consultation"],
          officeAddress: typeof u.address === "string" ? u.address : undefined,
          phone: typeof u.contactNumber === "string" ? u.contactNumber : undefined,
          email: typeof u.email === "string" ? u.email : undefined,
          whyMe:
            typeof u.whyMe === "string" && u.whyMe.trim().length > 0
              ? u.whyMe
              : typeof u.occupation === "string"
                ? `${u.occupation} at Don Juan Medical Center.`
                : undefined,
          specializationDesc:
            typeof u.specializationDesc === "string" && u.specializationDesc.trim().length > 0
              ? u.specializationDesc
              : typeof u.specialization === "string"
                ? `${u.specialization} specialist providing patient-centered medical care.`
                : undefined,
        } as Doctor;
      });

      setData(mapped);
      setIsLoading(false);
    });

    return () => unsub();
  }, []);

  return { data, isLoading };
}
