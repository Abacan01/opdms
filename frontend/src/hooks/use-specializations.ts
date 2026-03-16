import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Specialization {
  id: string;
  name: string;
  description: string;
  image: string;
  link: string;
}

export function useSpecializations() {
  return useQuery({
    queryKey: ["specializations"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "specializations"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Specialization);
    },
  });
}
