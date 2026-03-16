import { useQuery } from "@tanstack/react-query";

export interface Doctor {
  id: number;
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

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 101,
    name: "Dr. John Doe De Castro",
    specialization: "Cardiologist",
    clinicSchedule: "M, T, W, TH, Sat 9:00am-3:00pm",
    avatarUrl: "https://i.pravatar.cc/300?img=11",
    services: ["ECG", "General Consultation", "Heart Check", "Blood Test"],
    officeAddress: "Don Juan Medical Center, Hilltop Batangas City",
    phone: "0962-987-1010",
    email: "johndoe.castro@djmc.com",
    specializationDesc: "A cardiologist is a physician specializing in the diagnosis, treatment, and prevention of diseases and conditions related to the heart and blood vessels. They are experts in the cardiovascular system, including the heart muscle itself and the arteries and veins that carry blood. Cardiologists can perform procedures, prescribe medications, and provide long-term management for various heart conditions.",
    whyMe: "Dr. John Doe De Castro is a highly skilled cardiologist who graduated from the University of Santo Tomas College of Medicine. With over 10 years of experience in diagnosing and treating complex heart conditions, he has developed a strong reputation for his work in preventive cardiology and advanced heart failure management. Dedicated to both patient care and research, he continues to advocate for heart health awareness across the country."
  },
  {
    id: 102,
    name: "Dra. Jasper Jean Mariano",
    specialization: "Cardiologist",
    clinicSchedule: "M, T, W, TH, Sat 8:00am-3:00pm",
    avatarUrl: "https://i.pravatar.cc/300?img=5",
    services: ["ECG", "General Consultation", "X-Ray", "Cardiac Stress Test"],
    officeAddress: "Don Juan Medical Center, Hilltop Batangas City",
    phone: "0962-987-1010",
    email: "marianojasperjean@gmail.com",
    specializationDesc: "A cardiologist is a physician specializing in the diagnosis, treatment, and prevention of diseases and conditions related to the heart and blood vessels. They are experts in the cardiovascular system, including the heart muscle itself and the arteries and veins that carry blood. Cardiologists can perform procedures, prescribe medications, and provide long-term management for various heart conditions.",
    whyMe: "Dra. Jasper Jean Mariano is a highly skilled cardiologist who graduated with honors from the Philippines College of Medicine. Known for her compassionate care and sharp clinical expertise, she specializes in diagnosing and treating complex heart conditions. Dra. Mariano completed her residency and fellowship at the Philippine Heart Center, where she developed a strong reputation for her work in preventive cardiology and advanced heart failure management. Dedicated to both patient care and research, she continues to advocate for heart health awareness across the country while mentoring future generations of doctors."
  },
  {
    id: 103,
    name: "Dra. D.Hessa Ackerman",
    specialization: "Physical Therapist",
    clinicSchedule: "M, W, F 9:00am-5:00pm",
    avatarUrl: "https://i.pravatar.cc/300?img=9",
    services: ["Physical Therapy Session", "Rehabilitation", "Mobility Assessment", "Post-Surgery Rehab"],
    officeAddress: "Don Juan Medical Center, Hilltop Batangas City",
    phone: "0917-555-0234",
    email: "hessa.ackerman@djmc.com",
    specializationDesc: "Physical therapists help patients improve movement and manage pain. They work with people of all ages who have medical problems, illnesses, or injuries that limit their regular ability to move and function. Physical therapists examine patients and develop plans using treatment techniques to promote the ability to move, reduce pain, restore function, and prevent disability.",
    whyMe: "Dra. D.Hessa Ackerman is a licensed physical therapist with extensive experience in musculoskeletal rehabilitation. She has helped hundreds of patients recover from injuries, surgeries, and chronic pain conditions. Her patient-centered approach and evidence-based treatment protocols ensure the best possible outcomes for every patient she treats."
  },
  {
    id: 104,
    name: "Dr. Maria Santos",
    specialization: "General Practitioner",
    clinicSchedule: "M-F 8:00am-5:00pm",
    avatarUrl: "https://i.pravatar.cc/300?img=10",
    services: ["General Consultation", "Vaccination", "Medical Care", "Urinalysis", "Blood Test"],
    officeAddress: "Don Juan Medical Center, Hilltop Batangas City",
    phone: "0998-765-4321",
    email: "maria.santos@djmc.com",
    specializationDesc: "A general practitioner (GP) is a medical doctor who provides primary care services, treating a wide range of health conditions. They are often the first point of contact for patients and play a crucial role in managing overall health, preventive care, and coordinating specialist referrals when needed.",
    whyMe: "Dr. Maria Santos brings over 15 years of experience in primary care medicine. She is passionate about preventive health and patient education, believing that informed patients make better health decisions. Her warm and approachable manner puts patients at ease, while her thorough clinical assessments ensure comprehensive care."
  },
  {
    id: 105,
    name: "Dr. James Lee",
    specialization: "Dermatologist",
    clinicSchedule: "T, TH 10:00am-4:00pm",
    avatarUrl: "https://i.pravatar.cc/300?img=12",
    services: ["Skin Consultation", "Acne Treatment", "Skin Biopsy", "Cosmetic Consultation"],
    officeAddress: "Don Juan Medical Center, Hilltop Batangas City",
    phone: "0912-345-6789",
    email: "james.lee@djmc.com",
    specializationDesc: "Dermatologists specialize in conditions of the skin, hair, and nails. They diagnose and treat more than 3,000 different diseases, from common conditions like acne and eczema to complex issues like skin cancer. Dermatologists also perform cosmetic procedures to improve the appearance of the skin.",
    whyMe: "Dr. James Lee is a board-certified dermatologist with a special interest in medical and cosmetic dermatology. He graduated from the University of the Philippines College of Medicine and completed his dermatology residency at the Philippine Dermatological Society. His expertise encompasses both medical skin conditions and aesthetic treatments."
  }
];

export function useDoctors() {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      return new Promise<Doctor[]>((resolve) => {
        setTimeout(() => resolve(MOCK_DOCTORS), 200);
      });
    },
  });
}
