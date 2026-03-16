import { useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, Lock, Save, Camera, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  birthday: z.string().optional(),
  address: z.string().optional(),
  sex: z.string().optional(),
  contactNumber: z.string().optional(),
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
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || user?.name?.split(" ")[0] || "",
      lastName: user?.lastName || user?.name?.split(" ").slice(1).join(" ") || "",
      username: user?.username || user?.name?.replace(/\s+/g, "").toLowerCase() || "",
      email: user?.email || "",
      birthday: user?.birthday || "",
      address: user?.address || "",
      sex: user?.sex || "",
      contactNumber: user?.contactNumber || "",
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
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        username: data.username,
        birthday: data.birthday,
        address: data.address,
        sex: data.sex,
        contactNumber: data.contactNumber,
      });
      toast({ title: "Profile updated", description: "Your information has been saved." });
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

  const initials = user
    ? `${user.firstName?.[0] || user.name?.[0] || ""}${user.lastName?.[0] || user.name?.split(" ")[1]?.[0] || ""}`.toUpperCase()
    : "U";

  return (
    <Layout>
      <div className="max-w-3xl mx-auto pb-10">
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
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">{user?.name}</h2>
              <p className="text-sm text-muted-foreground capitalize">{user?.role} · {user?.email}</p>
              <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary capitalize">
                {user?.role}
              </span>
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
                <label className="text-sm font-medium text-foreground block mb-1.5">Username</label>
                <input {...profileForm.register("username")} placeholder="juandelacruz" className={inputCls} />
                {profileForm.formState.errors.username && (
                  <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.username.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Email Address</label>
                <input {...profileForm.register("email")} type="email" placeholder="juan@email.com" className={inputCls} disabled />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here</p>
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
              <label className="text-sm font-medium text-foreground block mb-1.5">Contact Number</label>
              <input {...profileForm.register("contactNumber")} placeholder="09XX-XXX-XXXX" className={inputCls} />
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

        {/* Password Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="p-2 rounded-xl bg-orange-100">
              <Lock className="w-5 h-5 text-orange-600" />
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
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:transform-none"
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
