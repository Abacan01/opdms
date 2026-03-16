import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useQueryClient } from "@tanstack/react-query";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: "patient" | "staff";
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  birthday?: string;
  address?: string;
  sex?: string;
  contactNumber?: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const profileDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (profileDoc.exists()) {
          setUser(profileDoc.data() as UserProfile);
        } else {
          const profile: UserProfile = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email || "User",
            email: firebaseUser.email || "",
            role: "patient",
            avatarUrl: firebaseUser.photoURL || undefined,
          };
          await setDoc(doc(db, "users", firebaseUser.uid), profile);
          setUser(profile);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const result = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    const profileDoc = await getDoc(doc(db, "users", result.user.uid));
    if (profileDoc.exists()) {
      setUser(profileDoc.data() as UserProfile);
    }
    return result.user;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const profileDoc = await getDoc(doc(db, "users", result.user.uid));
    if (!profileDoc.exists()) {
      const profile: UserProfile = {
        uid: result.user.uid,
        name: result.user.displayName || "User",
        email: result.user.email || "",
        role: "patient",
        avatarUrl: result.user.photoURL || undefined,
      };
      await setDoc(doc(db, "users", result.user.uid), profile);
      setUser(profile);
    } else {
      setUser(profileDoc.data() as UserProfile);
    }
    return result.user;
  };

  const register = async (data: { name: string; email: string; password: string; role?: "patient" | "staff" }) => {
    const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
    await updateProfile(result.user, { displayName: data.name });
    const nameParts = data.name.split(" ");
    const profile: UserProfile = {
      uid: result.user.uid,
      name: data.name,
      email: data.email,
      role: data.role || "patient",
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
    };
    await setDoc(doc(db, "users", result.user.uid), profile);
    setUser(profile);
    return result.user;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    queryClient.clear();
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updatedProfile = { ...user, ...updates };
    await updateDoc(doc(db, "users", user.uid), updates);
    if (updates.name || updates.avatarUrl) {
      await updateProfile(auth.currentUser!, {
        displayName: updates.name || user.name,
        photoURL: updates.avatarUrl || user.avatarUrl,
      });
    }
    setUser(updatedProfile);
  };

  return {
    user,
    isLoading,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    isLoggingIn: false,
  };
}
