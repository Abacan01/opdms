import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  readTime: string;
  imageUrl?: string;
}

export function useArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const q = query(collection(db, "articles"), orderBy("publishedAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Article);
    },
  });
}
