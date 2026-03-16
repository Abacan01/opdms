import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "patient" | "staff";
  avatarUrl?: string;
}

// Helper to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      await delay(400);
      const stored = localStorage.getItem("opdms_user");
      return stored ? JSON.parse(stored) : null;
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      await delay(800);
      
      // Mock demo logic
      if (credentials.email === "patient@demo.com" && credentials.password === "demo123") {
        const user: User = {
          id: 1,
          name: "John Doe",
          email: "patient@demo.com",
          role: "patient",
          avatarUrl: "https://i.pravatar.cc/150?u=patient"
        };
        localStorage.setItem("opdms_user", JSON.stringify(user));
        return user;
      }
      
      if (credentials.email === "staff@demo.com" && credentials.password === "demo123") {
        const user: User = {
          id: 2,
          name: "Dr. Maria Santos",
          email: "staff@demo.com",
          role: "staff",
          avatarUrl: "https://i.pravatar.cc/150?u=staff"
        };
        localStorage.setItem("opdms_user", JSON.stringify(user));
        return user;
      }

      throw new Error("Invalid credentials. Try patient@demo.com or staff@demo.com with demo123");
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await delay(300);
      localStorage.removeItem("opdms_user");
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth", "user"], null);
    },
  });

  return {
    user,
    isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
  };
}
