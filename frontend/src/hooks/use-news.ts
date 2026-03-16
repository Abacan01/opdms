import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  excerpt: string;
  image: string;
  publishedAt?: any;
}

export function useNews() {
  return useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const q = query(collection(db, "news"), orderBy("publishedAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as NewsItem);
    },
  });
}
