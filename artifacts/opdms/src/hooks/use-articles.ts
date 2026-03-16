import { useQuery } from "@tanstack/react-query";

export interface Article {
  id: number;
  title: string;
  category: string;
  summary: string;
  content: string;
  readTime: string;
}

const mockArticles: Article[] = [
  {
    id: 1,
    title: "10 Habits for a Healthy Heart",
    category: "Heart Health",
    summary: "Discover daily routines that can significantly reduce your risk of cardiovascular diseases.",
    content: "Full content here...",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Understanding Physical Therapy",
    category: "Preventive Care",
    summary: "How physical therapy can help you recover from injury and prevent future mobility issues.",
    content: "Full content here...",
    readTime: "4 min read"
  },
  {
    id: 3,
    title: "Nutrition Essentials for Immunity",
    category: "Nutrition",
    summary: "Foods to incorporate into your diet to build a strong immune system year-round.",
    content: "Full content here...",
    readTime: "6 min read"
  }
];

export function useArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      return new Promise<Article[]>((resolve) => {
        setTimeout(() => resolve(mockArticles), 300);
      });
    },
  });
}
