import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./use-auth";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "appointment" | "record" | "reminder" | "system";
  read: boolean;
  createdAt?: any;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", userId: "demo", title: "Appointment Confirmed", message: "Your Consultation with Dr. John Doe De Castro on April 9 at 9:00 AM has been confirmed.", type: "appointment", read: false },
  { id: "n2", userId: "demo", title: "Medical Record Available", message: "A new prescription from Dr. Maria Santos is now available in your records.", type: "record", read: false },
  { id: "n3", userId: "demo", title: "Appointment Reminder", message: "Reminder: You have an appointment tomorrow with Dra. Jasper Jean Mariano at 8:00 AM.", type: "reminder", read: true },
  { id: "n4", userId: "demo", title: "Welcome to OPDMS", message: "Welcome to the Don Juan Medical Center patient portal. Your health journey starts here.", type: "system", read: true },
];

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications", user?.uid],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      try {
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        if (snap.empty) return MOCK_NOTIFICATIONS;
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
      } catch {
        return MOCK_NOTIFICATIONS;
      }
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => updateDoc(doc(db, "notifications", n.id), { read: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.uid] });
    },
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, isLoading, unreadCount, markAllRead: markAllRead.mutate };
}
