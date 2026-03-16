import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface HealthService {
  id: string;
  name: string;
  description: string;
  image: string;
  fullDescription: string;
  sections: { title: string; content: string }[];
}

export interface CreateHealthServiceInput {
  name: string;
  description: string;
  image: string;
  fullDescription: string;
  sections?: { title: string; content: string }[];
}

export function useHealthServices() {
  return useQuery({
    queryKey: ["health_services"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "health_services"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as HealthService);
    },
  });
}

export function useCreateHealthService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateHealthServiceInput) => {
      const payload = {
        name: input.name,
        description: input.description,
        image: input.image,
        fullDescription: input.fullDescription,
        sections: input.sections ?? [],
      };
      await addDoc(collection(db, "health_services"), payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health_services"] });
    },
  });
}
