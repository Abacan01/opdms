import { useState, useEffect, createContext, useContext, createElement, type ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useQueryClient } from "@tanstack/react-query";

// Firestore rejects `undefined` values — strip them before writing
function strip<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

function normalizeRole(roleValue: unknown): "patient" | "staff" {
  if (typeof roleValue !== "string") return "patient";
  const role = roleValue.toLowerCase();
  if (role === "staff" || role.includes("medical") || role.includes("doctor") || role.includes("pract")) {
    return "staff";
  }
  return "patient";
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: "patient" | "staff";
  avatarUrl?: string;
  avatarMode?: "google" | "custom";
  firstName?: string;
  lastName?: string;
  birthday?: string;
  address?: string;
  sex?: string;
  contactNumber?: string;
  occupation?: string;
  specialization?: string;
  servicesOffered?: string[];
  specializationDesc?: string;
  whyMe?: string;
  clinicSchedule?: string;
}

export interface GoogleLoginResult {
  user: FirebaseUser;
  needsProfileCompletion: boolean;
}

const localAvatarKey = (uid: string) => `opdms_local_avatar_${uid}`;

function getLocalAvatar(uid: string): string | null {
  try {
    return localStorage.getItem(localAvatarKey(uid));
  } catch {
    return null;
  }
}

function setLocalAvatarValue(uid: string, value: string) {
  try {
    localStorage.setItem(localAvatarKey(uid), value);
  } catch {
    // Ignore local storage failures.
  }
}

function clearLocalAvatarValue(uid: string) {
  try {
    localStorage.removeItem(localAvatarKey(uid));
  } catch {
    // Ignore local storage failures.
  }
}

interface AuthContextValue {
  user: UserProfile | null;
  needsProfileCompletion: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<FirebaseUser>;
  loginWithGoogle: () => Promise<GoogleLoginResult>;
  completeGoogleOnboarding: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    birthday?: string;
    address?: string;
    sex?: string;
    contactNumber?: string;
    role?: "patient" | "staff";
    occupation?: string;
    specialization?: string;
    servicesOffered?: string[];
  }) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    birthday?: string;
    address?: string;
    sex?: string;
    contactNumber?: string;
    role?: "patient" | "staff";
    occupation?: string;
    specialization?: string;
    servicesOffered?: string[];
    specializationDesc?: string;
    whyMe?: string;
  }) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setLocalAvatar: (avatarUrl: string) => void;
  clearLocalAvatar: () => void;
  isLoggingIn: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function hasRequiredProfileData(profile: UserProfile): boolean {
  const hasBase =
    !!profile.firstName?.trim() &&
    !!profile.lastName?.trim() &&
    !!profile.contactNumber?.trim() &&
    !!profile.birthday?.trim() &&
    !!profile.address?.trim() &&
    !!profile.sex?.trim();

  if (!hasBase) return false;
  if (profile.role !== "staff") return true;

  return (
    !!profile.occupation?.trim() &&
    !!profile.specialization?.trim() &&
    !!profile.servicesOffered?.length
  );
}

function isGoogleAccount(firebaseUser: FirebaseUser | null): boolean {
  if (!firebaseUser) return false;
  return firebaseUser.providerData.some((p) => p.providerId === "google.com");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let profileUnsub: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }

      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        profileUnsub = onSnapshot(userRef, async (profileDoc) => {
          if (!profileDoc.exists()) {
            const profile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email || "User",
              email: firebaseUser.email || "",
              role: "patient",
              firstName: firebaseUser.displayName?.split(" ")[0] || "",
              lastName: firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
              avatarUrl: firebaseUser.photoURL || undefined,
              avatarMode: isGoogleAccount(firebaseUser) ? "google" : "custom",
            };
            await setDoc(userRef, strip(profile));
            const localAvatar = getLocalAvatar(firebaseUser.uid);
            setUser(localAvatar ? { ...profile, avatarUrl: localAvatar, avatarMode: "custom" } : profile);
            setNeedsProfileCompletion(true);
            return;
          }

          const profileData = profileDoc.data() as UserProfile;
          let mergedProfile: UserProfile = {
            ...profileData,
            role: normalizeRole(profileData.role),
          };

          const localAvatar = getLocalAvatar(firebaseUser.uid);
          if (localAvatar) {
            mergedProfile = {
              ...mergedProfile,
              avatarUrl: localAvatar,
              avatarMode: "custom",
            };
          }

          // Keep Google photo in sync unless user explicitly switched to custom avatar.
          if (
            isGoogleAccount(firebaseUser) &&
            firebaseUser.photoURL &&
            !localAvatar &&
            mergedProfile.avatarMode !== "custom" &&
            mergedProfile.avatarUrl !== firebaseUser.photoURL
          ) {
            await updateDoc(userRef, {
              avatarUrl: firebaseUser.photoURL,
              avatarMode: "google",
            });
            mergedProfile = {
              ...mergedProfile,
              avatarUrl: firebaseUser.photoURL,
              avatarMode: "google",
            };
          }

          setUser(mergedProfile);
          setNeedsProfileCompletion(isGoogleAccount(firebaseUser) && !hasRequiredProfileData(mergedProfile));
        });
      } else {
        setUser(null);
        setNeedsProfileCompletion(false);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const result = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    const profileDoc = await getDoc(doc(db, "users", result.user.uid));
    if (profileDoc.exists()) {
      const profileData = profileDoc.data() as UserProfile;
      setUser({ ...profileData, role: normalizeRole(profileData.role) });
    }
    return result.user;
  };

  const loginWithGoogle = async (): Promise<GoogleLoginResult> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const profileDoc = await getDoc(doc(db, "users", result.user.uid));
    let profile: UserProfile;

    if (!profileDoc.exists()) {
      profile = {
        uid: result.user.uid,
        name: result.user.displayName || "User",
        email: result.user.email || "",
        role: "patient",
        avatarUrl: result.user.photoURL || undefined,
        avatarMode: "google",
        firstName: result.user.displayName?.split(" ")[0] || "",
        lastName: result.user.displayName?.split(" ").slice(1).join(" ") || "",
      };
      await setDoc(doc(db, "users", result.user.uid), strip(profile));
    } else {
      const profileData = profileDoc.data() as UserProfile;
      profile = { ...profileData, role: normalizeRole(profileData.role) };
    }

    const localAvatar = getLocalAvatar(result.user.uid);
    if (localAvatar) {
      profile.avatarUrl = localAvatar;
      profile.avatarMode = "custom";
    }

    // Sync Google profile photo by default unless user opted out with custom mode.
    if (result.user.photoURL && !localAvatar && profile.avatarMode !== "custom") {
      profile.avatarUrl = result.user.photoURL;
      profile.avatarMode = "google";
      await setDoc(doc(db, "users", result.user.uid), strip(profile), { merge: true });
    }

    setUser(profile);
    const requiresCompletion = !hasRequiredProfileData(profile);
    setNeedsProfileCompletion(requiresCompletion);
    return { user: result.user, needsProfileCompletion: requiresCompletion };
  };

  const completeGoogleOnboarding = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    birthday?: string;
    address?: string;
    sex?: string;
    contactNumber?: string;
    role?: "patient" | "staff";
    occupation?: string;
    specialization?: string;
    servicesOffered?: string[];
  }) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error("You must be signed in with Google first.");
    }

    const normalizedRole = data.role || "patient";
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const profileRef = doc(db, "users", currentUser.uid);

    const updates: Partial<UserProfile> = {
      name: fullName,
      firstName: data.firstName,
      lastName: data.lastName,
      birthday: data.birthday,
      address: data.address,
      sex: data.sex,
      contactNumber: data.contactNumber,
      role: normalizedRole,
      occupation: normalizedRole === "staff" ? data.occupation : undefined,
      specialization: normalizedRole === "staff" ? data.specialization : undefined,
      servicesOffered: normalizedRole === "staff" ? data.servicesOffered || [] : undefined,
      clinicSchedule: normalizedRole === "staff" ? "Mon-Sat 8:00 AM - 5:00 PM" : undefined,
    };

    await setDoc(profileRef, strip(updates), { merge: true });
    await updateProfile(currentUser, { displayName: fullName });

    // Link email/password credential so user can log in with normal email/password too.
    const methods = await fetchSignInMethodsForEmail(auth, currentUser.email);
    if (!methods.includes("password")) {
      const credential = EmailAuthProvider.credential(currentUser.email, data.password);
      try {
        await linkWithCredential(currentUser, credential);
      } catch (e: any) {
        const ignorableCodes = [
          "auth/provider-already-linked",
          "auth/credential-already-in-use",
          "auth/email-already-in-use",
        ];
        if (!ignorableCodes.includes(e?.code)) {
          throw e;
        }
      }
    }

    setNeedsProfileCompletion(false);
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    birthday?: string;
    address?: string;
    sex?: string;
    contactNumber?: string;
    role?: "patient" | "staff";
    occupation?: string;
    specialization?: string;
    servicesOffered?: string[];
    specializationDesc?: string;
    whyMe?: string;
  }) => {
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
    await updateProfile(result.user, { displayName: fullName });
    const normalizedRole = data.role || "patient";
    const profile: UserProfile = {
      uid: result.user.uid,
      name: fullName,
      email: data.email,
      role: normalizedRole,
      firstName: data.firstName,
      lastName: data.lastName,
      birthday: data.birthday,
      address: data.address,
      sex: data.sex,
      contactNumber: data.contactNumber,
      occupation: normalizedRole === "staff" ? data.occupation : undefined,
      specialization: normalizedRole === "staff" ? data.specialization : undefined,
      servicesOffered: normalizedRole === "staff" ? data.servicesOffered || [] : undefined,
      specializationDesc:
        normalizedRole === "staff"
          ? data.specializationDesc || (data.specialization ? `${data.specialization} specialist providing patient-centered medical care.` : undefined)
          : undefined,
      whyMe:
        normalizedRole === "staff"
          ? data.whyMe || (data.occupation ? `${data.occupation} at Don Juan Medical Center.` : undefined)
          : undefined,
      clinicSchedule: normalizedRole === "staff" ? "Mon-Sat 8:00 AM - 5:00 PM" : undefined,
    };
    await setDoc(doc(db, "users", result.user.uid), strip(profile));
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
    await updateDoc(doc(db, "users", user.uid), strip(updates));
    if (updates.name || updates.avatarUrl) {
      const authUpdates: { displayName?: string; photoURL?: string } = {};

      if (updates.name) {
        authUpdates.displayName = updates.name;
      }

      // Avoid sending local/base64 data URLs to Firebase Auth photoURL,
      // because Auth rejects oversized values.
      if (
        typeof updates.avatarUrl === "string" &&
        updates.avatarUrl.trim().length > 0 &&
        !updates.avatarUrl.startsWith("data:")
      ) {
        authUpdates.photoURL = updates.avatarUrl;
      }

      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(auth.currentUser!, authUpdates);
      }
    }
    setUser(updatedProfile);
  };

  const setLocalAvatar = (avatarUrl: string) => {
    if (!user) return;
    setLocalAvatarValue(user.uid, avatarUrl);
    setUser({ ...user, avatarUrl, avatarMode: "custom" });
  };

  const clearLocalAvatar = () => {
    if (!user) return;
    clearLocalAvatarValue(user.uid);
    const googlePhoto = auth.currentUser?.photoURL || user.avatarUrl;
    setUser({ ...user, avatarUrl: googlePhoto || undefined, avatarMode: "google" });
  };

  const value: AuthContextValue = {
    user,
    needsProfileCompletion,
    isLoading,
    login,
    loginWithGoogle,
    completeGoogleOnboarding,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    setLocalAvatar,
    clearLocalAvatar,
    isLoggingIn: false,
  };

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
