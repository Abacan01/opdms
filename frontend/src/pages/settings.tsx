import { useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, Lock, Save, Camera, Eye, EyeOff, Upload, Link as LinkIcon, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";
import * as Dialog from "@radix-ui/react-dialog";

const getProfileSchema = (role?: string) => z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  birthday: z.string().optional(),
  address: z.string().optional(),
  sex: z.string().optional(),
  contactNumber: z.string().min(8, "Contact number is required"),
  occupation: role === "staff" ? z.string().min(1, "Occupation is required for staff") : z.string().optional(),
  specialization: z.string().optional(),
  servicesOffered: z.string().optional(),
  specializationDesc: z.string().optional(),
  whyMe: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm";

const selectCls =
  "w-full px-3 py-2.5 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm";

export default function Settings() {
  const { user, updateUserProfile, setLocalAvatar } = useAuth();
  const { toast } = useToast();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showStaffPrompt, setShowStaffPrompt] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const staffProfileIncomplete = useMemo(() => {
    if (user?.role !== "staff") return false;
    const missingOccupation = !user.occupation?.trim();
    const missingSpecialization = !user.specialization?.trim();
    const missingServices = !user.servicesOffered || user.servicesOffered.length === 0;
    return missingOccupation || missingSpecialization || missingServices;
  }, [user]);

  useEffect(() => {
    if (staffProfileIncomplete) setShowStaffPrompt(true);
  }, [staffProfileIncomplete]);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(getProfileSchema(user?.role)),
    defaultValues: {
      firstName: user?.firstName || user?.name?.split(" ")[0] || "",
      lastName: user?.lastName || user?.name?.split(" ").slice(1).join(" ") || "",
      email: user?.email || "",
      birthday: user?.birthday || "",
      address: user?.address || "",
      sex: user?.sex || "",
      contactNumber: user?.contactNumber || "",
      occupation: user?.occupation || "",
      specialization: user?.specialization || "",
      servicesOffered: user?.servicesOffered?.join(", ") || "",
      specializationDesc: user?.specializationDesc || "",
      whyMe: user?.whyMe || "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSaveProfile = async (data: ProfileForm) => {
    setIsSavingProfile(true);
    try {
      await updateUserProfile({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        name: `${data.firstName.trim()} ${data.lastName.trim()}`,
        birthday: data.birthday,
        address: data.address,
        sex: data.sex,
        contactNumber: data.contactNumber.replace(/[^0-9+\-() ]/g, ""),
        occupation: user?.role === "staff" ? data.occupation : undefined,
        specialization: user?.role === "staff" ? data.specialization : undefined,
        servicesOffered:
          user?.role === "staff"
            ? (data.servicesOffered || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : undefined,
        specializationDesc: user?.role === "staff" ? data.specializationDesc?.trim() : undefined,
        whyMe: user?.role === "staff" ? data.whyMe?.trim() : undefined,
      });
      toast({ title: "Profile updated", description: "Your information has been saved." });
      if (user?.role === "staff") {
        setShowStaffPrompt(false);
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const onChangePassword = async (data: PasswordForm) => {
    setIsSavingPassword(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) throw new Error("Not authenticated");
      const credential = EmailAuthProvider.credential(currentUser.email, data.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, data.newPassword);
      toast({ title: "Password changed", description: "Your password has been updated successfully." });
      passwordForm.reset();
    } catch (e: any) {
      const msg = e.code === "auth/wrong-password" || e.code === "auth/invalid-credential"
        ? "Current password is incorrect."
        : e.message;
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const onUploadAvatarFile = async (file: File) => {
    if (!user) return;

    const maxBytes = 5 * 1024 * 1024;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    if (file.size > maxBytes) {
      toast({ title: "File too large", description: "Maximum avatar size is 5MB.", variant: "destructive" });
      return;
    }

    try {
      setIsSavingAvatar(true);
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
      setLocalAvatar(dataUrl);
      toast({ title: "Profile photo updated" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message || "Could not upload image.", variant: "destructive" });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const onSaveAvatarUrl = async () => {
    const url = avatarUrlInput.trim();
    if (!url) {
      toast({ title: "Enter image URL", variant: "destructive" });
      return;
    }

    try {
      new URL(url);
    } catch {
      toast({ title: "Invalid URL", description: "Please enter a valid image URL.", variant: "destructive" });
      return;
    }

    try {
      setIsSavingAvatar(true);
      setLocalAvatar(url);
      setAvatarUrlInput("");
      toast({ title: "Profile photo updated" });
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message || "Could not set photo URL.", variant: "destructive" });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const onSyncGoogleAvatar = async () => {
    const googlePhoto = auth.currentUser?.photoURL;
    if (!googlePhoto) {
      toast({ title: "No Google photo", description: "This account has no Google profile photo.", variant: "destructive" });
      return;
    }

    try {
      setIsSavingAvatar(true);
      setLocalAvatar(googlePhoto);
      toast({ title: "Google photo synced" });
    } catch (e: any) {
      toast({ title: "Sync failed", description: e.message || "Unable to sync Google photo.", variant: "destructive" });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const initials = user
    ? `${user.firstName?.[0] || user.name?.[0] || ""}${user.lastName?.[0] || user.name?.split(" ")[1]?.[0] || ""}`.toUpperCase()
    : "U";

  return (
    <Layout>
      <div className="max-w-3xl mx-auto pb-10">
        {staffProfileIncomplete && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
            <p className="text-sm font-semibold">Medical practitioner profile incomplete</p>
            <p className="text-sm">Please complete occupation, specialization, and services offered so patients can see complete doctor information.</p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-foreground">User Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account information and preferences</p>
        </motion.div>

        {/* Profile Photo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card border rounded-2xl p-6 mb-6 shadow-sm"
        >
          <div className="flex items-center gap-6">
            <div className="relative">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-primary/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{initials}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">{user?.name}</h2>
              <p className="text-sm text-muted-foreground capitalize">
                {user?.role === "staff" && user?.occupation ? user.occupation : user?.role} · {user?.email}
              </p>
              <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary capitalize">
                {user?.role === "staff" ? (user?.occupation || "Complete Your Profile") : user?.role}
              </span>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onUploadAvatarFile(file);
                e.currentTarget.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSavingAvatar}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60"
            >
              <Upload className="w-4 h-4" />
              Upload Photo
            </button>
            <button
              type="button"
              onClick={onSyncGoogleAvatar}
              disabled={isSavingAvatar}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60"
            >
              <RefreshCcw className="w-4 h-4" />
              Sync Google Photo
            </button>
            <div className="sm:col-span-2 flex gap-2">
              <input
                value={avatarUrlInput}
                onChange={(e) => setAvatarUrlInput(e.target.value)}
                placeholder="Paste profile image URL"
                className={inputCls}
              />
              <button
                type="button"
                onClick={onSaveAvatarUrl}
                disabled={isSavingAvatar}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 shrink-0"
              >
                <LinkIcon className="w-4 h-4" />
                Use URL
              </button>
            </div>
          </div>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border rounded-2xl p-6 mb-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="p-2 rounded-xl bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">Personal Information</h3>
              <p className="text-xs text-muted-foreground">Update your personal details</p>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">First Name</label>
                <input {...profileForm.register("firstName")} placeholder="Juan" className={inputCls} />
                {profileForm.formState.errors.firstName && (
                  <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Last Name</label>
                <input {...profileForm.register("lastName")} placeholder="Dela Cruz" className={inputCls} />
                {profileForm.formState.errors.lastName && (
                  <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Email Address</label>
                <input {...profileForm.register("email")} type="email" placeholder="juan@email.com" className={inputCls} disabled />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Contact Number</label>
                <input
                  {...profileForm.register("contactNumber", {
                    setValueAs: (v) => String(v ?? "").replace(/[^0-9+\-() ]/g, ""),
                  })}
                  placeholder="09XX-XXX-XXXX"
                  className={inputCls}
                />
                {profileForm.formState.errors.contactNumber && (
                  <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.contactNumber.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Birthday</label>
                <input {...profileForm.register("birthday")} type="date" className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Sex</label>
                <select {...profileForm.register("sex")} className={selectCls}>
                  <option value="">Select sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Address</label>
              <textarea
                {...profileForm.register("address")}
                placeholder="Street, Barangay, City, Province"
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </div>

            {user?.role === "staff" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Occupation</label>
                    <input {...profileForm.register("occupation")} placeholder="Doctor / Nurse / Therapist" className={inputCls} required={user?.role === "staff"} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Specialization</label>
                    <input {...profileForm.register("specialization")} placeholder="Cardiology / Radiology" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Services Offered</label>
                  <input {...profileForm.register("servicesOffered")} placeholder="Consultation, ECG, X-Ray" className={inputCls} />
                  <p className="text-xs text-muted-foreground mt-1">Use commas to separate services.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Bio</label>
                  <textarea
                    {...profileForm.register("specializationDesc")}
                    rows={3}
                    placeholder="Cardiology specialist providing patient-centered medical care."
                    className={`${inputCls} resize-none`}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Why Me?</label>
                  <textarea
                    {...profileForm.register("whyMe")}
                    rows={2}
                    placeholder="Doctor at Don Juan Medical Center."
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:transform-none"
              >
                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>

        <Dialog.Root open={showStaffPrompt} onOpenChange={setShowStaffPrompt}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-background p-6 shadow-2xl">
              <Dialog.Title className="text-lg font-display font-bold mb-2">Complete Practitioner Profile</Dialog.Title>
              <p className="text-sm text-muted-foreground mb-4">
                Patients can only see complete practitioner details when occupation, specialization, and services offered are filled in.
              </p>
              <div className="flex justify-end">
                <Dialog.Close className="px-4 py-2.5 rounded-lg bg-primary text-white font-semibold">Okay</Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Password Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="p-2 rounded-xl bg-primary/10">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">Change Password</h3>
              <p className="text-xs text-muted-foreground">Update your account password</p>
            </div>
          </div>

          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  {...passwordForm.register("currentPassword")}
                  type={showCurrentPw ? "text" : "password"}
                  placeholder="Enter current password"
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    {...passwordForm.register("newPassword")}
                    type={showNewPw ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Confirm New Password</label>
                <input
                  {...passwordForm.register("confirmPassword")}
                  type="password"
                  placeholder="Repeat new password"
                  className={inputCls}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingPassword}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:transform-none"
              >
                {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Update Password
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
}
