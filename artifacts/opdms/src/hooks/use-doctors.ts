import { useQuery } from "@tanstack/react-query";

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  clinicSchedule: string;
  avatarUrl?: string;
  services: string[];
}

const mockDoctors: Doctor[] = [
  {
    id: 101,
    name: "Dr. John Doe De Castro",
    specialization: "Cardiologist",
    clinicSchedule: "M, T, W, TH, Sat 9:00am-3:00pm",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    services: ["ECG", "General Consultation", "Heart Check"]
  },
  {
    id: 102,
    name: "Dra. Jasper Jean Mackins",
    specialization: "Cardiologist",
    clinicSchedule: "M, T, W, TH, Sat 8:00am-3:00pm",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    services: ["ECG", "General Consultation"]
  },
  {
    id: 103,
    name: "Dra. D.Hessa Ackerman",
    specialization: "Physical Therapist",
    clinicSchedule: "M, W, F 9:00am-5:00pm",
    avatarUrl: "https://i.pravatar.cc/150?img=9",
    services: ["Physical Therapy Session", "Rehabilitation"]
  },
  {
    id: 104,
    name: "Dr. Maria Santos",
    specialization: "General Practitioner",
    clinicSchedule: "M-F 8:00am-5:00pm",
    avatarUrl: "https://i.pravatar.cc/150?img=10",
    services: ["General Consultation", "Vaccination", "Medical Care"]
  },
  {
    id: 105,
    name: "Dr. James Lee",
    specialization: "Dermatologist",
    clinicSchedule: "T, TH 10:00am-4:00pm",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    services: ["Skin Check", "Consultation"]
  }
];

export function useDoctors() {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      return new Promise<Doctor[]>((resolve) => {
        setTimeout(() => resolve(mockDoctors), 300);
      });
    },
  });
}
